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
    let estimatedSeconds = 60;
    
    try {
        const formData = new FormData(e.target);
        const startTime = Date.now();
        
        // 心跳计时器
        const timer = setInterval(() => {
            estimatedSeconds = Math.max(0, estimatedSeconds - 1);
            timeEstimate.textContent = estimatedSeconds || '0';
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
        timeEstimate.textContent = '30';
    }
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
