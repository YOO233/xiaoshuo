DIFY_API_URL = "http://192.168.0.250:50080/v1/workflows/run"
API_KEY = "app-IbVUj0YXRqRlT1OJeVOJ4qqF"
REQUEST_HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}
TIMEOUT = (5, 300)  # 连接超时5秒，读取超时300秒
LOG_DIR = "logs"
