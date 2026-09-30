import time
from threading import Lock
from fastapi import HTTPException, status

class RateLimiter:
    def __init__(self, max_attempts: int = 5, window_seconds: int = 300):
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self.attempts: dict[str, list[float]] = {}
        self.lock = Lock()

    def is_allowed(self, key: str) -> bool:
        now = time.time()
        with self.lock:
            if key not in self.attempts:
                self.attempts[key] = []
            self.attempts[key] = [t for t in self.attempts[key] if now - t < self.window_seconds]
            if len(self.attempts[key]) >= self.max_attempts:
                return False
            self.attempts[key].append(now)
            return True

    def reset(self, key: str):
        with self.lock:
            self.attempts.pop(key, None)

login_rate_limiter = RateLimiter(max_attempts=5, window_seconds=300)
