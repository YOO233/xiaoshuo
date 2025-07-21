import os
import uuid
import json
from datetime import datetime
from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)
app.config.from_object(__import__('dify_config'))

def ensure_log_dir():
    if not os.path.exists(app.config['LOG_DIR']):
        os.makedirs(app.config['LOG_DIR'])

def write_log_entry(log_data):
    log_date = datetime.now().strftime("%Y%m%d")
    log_file = os.path.join(app.config['LOG_DIR'], f"{log_date}.log")
    
    entry = {
        "timestamp": datetime.now().isoformat(),
        "user_id": log_data["user_id"],
        "request": log_data["request"],
        "response": {
            "status": log_data["status"],
            "tokens_used": log_data.get("tokens_used", 0),
            "duration": log_data.get("duration", 0)
        },
        "error": log_data.get("error")
    }
    
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        user_id = str(uuid.uuid4())[:8]
        content = request.form.get("content", "").strip()
        word_count = request.form.get("word_count", "1000").strip()
        
        log_data = {
            "user_id": user_id,
            "request": {"conet": content, "zishu": word_count},
            "status": "pending"
        }
        
        try:
            response = requests.post(
                app.config['DIFY_API_URL'],
                headers=app.config['REQUEST_HEADERS'],
                json={
                    "inputs": {
                        "conet": content,
                        "zishu": word_count
                    },
                    "response_mode": "blocking",
                    "user": user_id
                },
                timeout=app.config['TIMEOUT']
            )
            response.raise_for_status()
            
            result = response.json()["data"]
            output_text = result["outputs"]["text"].replace("\n", "<br>")
            
            log_data.update({
                "status": "success",
                "tokens_used": result["total_tokens"],
                "duration": result["elapsed_time"]
            })
            
            return jsonify({
                "success": True,
                "output": output_text,
                "stats": {
                    "tokens": result["total_tokens"],
                    "duration": f"{result['elapsed_time']:.1f}s"
                }
            })
            
        except Exception as e:
            error_msg = f"API Error: {str(e)}"
            log_data.update({
                "status": "error",
                "error": error_msg
            })
            return jsonify({"success": False, "error": error_msg}), 500
            
        finally:
            ensure_log_dir()
            write_log_entry(log_data)
            
    return render_template("index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
