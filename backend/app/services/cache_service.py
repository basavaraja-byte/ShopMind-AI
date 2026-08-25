import time
from typing import Any, Optional, Dict

class CacheService:
    """Abstract caching interface for query response performance (Requirement #12)."""
    def get(self, key: str) -> Optional[Any]: raise NotImplementedError
    def set(self, key: str, value: Any, ttl: int = 300): raise NotImplementedError
    def delete(self, key: str): raise NotImplementedError
    def clear(self): raise NotImplementedError

class InMemoryCacheService(CacheService):
    def __init__(self):
        self._store: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        if key in self._store:
            item = self._store[key]
            if time.time() < item["expires_at"]:
                return item["value"]
            else:
                del self._store[key]
        return None

    def set(self, key: str, value: Any, ttl: int = 300):
        self._store[key] = {
            "value": value,
            "expires_at": time.time() + ttl
        }

    def delete(self, key: str):
        self._store.pop(key, None)

    def clear(self):
        self._store.clear()

cache_service = InMemoryCacheService()
