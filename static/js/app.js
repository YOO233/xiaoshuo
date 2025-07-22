document.getElementById('generateForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const loading = document.getElementById('loading');
    const resultContainer = document.getElementById('resultContainer');
    const output = document.getElementById('output');
    const timeEstimate = document.getElementById('timeEstimate');
    const durationSpan = document.getElementById('duration');
    const tokensSpan = document.getElementById('tokens');
    
    // 禁用按钮并显示加载状态
    submitBtn.disabled = true;
    loading.style.display = 'block';
    resultContainer.style.display = 'none';
    // 动态计算倒计时时间
    const wordCount = parseInt(document.getElementById('word_count').value) || 1000;
    if (wordCount < 500 || wordCount > 10000) {
        alert('字数范围需在500-10000之间');
        return;
    }
    let baseTime = wordCount <= 1000 ? 110 : 110 + Math.ceil((wordCount - 1000) / 15);
    let estimatedSeconds = baseTime;
    
    try {
        const formData = new FormData(e.target);
        const startTime = Date.now();
        
        // 心跳计时器
        const timer = setInterval(() => {
            estimatedSeconds = Math.max(0, estimatedSeconds - 1);
        timeEstimate.textContent = estimatedSeconds.toString();
        }, 1000);
        
        const response = await fetch('/', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        clearInterval(timer);
        
        if (data.success) {
            output.innerHTML = data.output;
            durationSpan.textContent = data.stats.duration;
            tokensSpan.textContent = data.stats.tokens;
            resultContainer.style.display = 'block';
        } else {
            alert(`错误：${data.error}`);
        }
        
    } catch (error) {
        alert('网络请求失败，请检查连接状态');
    } finally {
        submitBtn.disabled = false;
        loading.style.display = 'none';
        // 动态重置倒计时初始值
        const currentWordCount = parseInt(document.getElementById('word_count').value) || 1000;
        const resetTime = currentWordCount <= 1000 ? 110 : 110 + Math.ceil((currentWordCount - 1000)/15);
        timeEstimate.textContent = resetTime.toString();
    }
});

// 初始化页面时触发计算
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('word_count').dispatchEvent(new Event('input'));
});

// 实时计算预估时间
document.getElementById('word_count').addEventListener('input', (e) => {
    const count = parseInt(e.target.value) || 1000;
    const preview = document.getElementById('timeEstimatePreview');
    preview.textContent = count <= 1000 ? 110 : 110 + Math.ceil((count - 1000)/15);
});

function copyResult() {
    const output = document.getElementById('output');
    const range = document.createRange();
    range.selectNode(output);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    alert('内容已复制到剪贴板');
}
