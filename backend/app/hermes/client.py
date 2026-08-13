"""
Hermes API Client for Python
"""
import os

class HermesApiClient:
    def __init__(self):
        self.base_url = os.environ.get("HERMES_BASE_URL", "http://127.0.0.1:8642")
        self.api_key = os.environ.get("HERMES_API_KEY", "")
        self.model = os.environ.get("HERMES_MODEL", "hermes-agent")

    def check_status(self):
        return {"status": "OFFLINE", "base_url": self.base_url, "model": self.model}
