import json
import httpx
from typing import Dict, Any, Optional
from app.config.settings import settings

class LLMService:
    """Multi-provider LLM abstraction supporting Ollama, OpenAI, and Mock Engine."""
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()

    async def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        if self.provider == "openai" and settings.OPENAI_API_KEY:
            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                        json={
                            "model": settings.OPENAI_MODEL,
                            "messages": [
                                {"role": "system", "content": system_prompt or "Return strict valid JSON only."},
                                {"role": "user", "content": prompt}
                            ],
                            "response_format": {"type": "json_object"}
                        }
                    )
                    if resp.status_code == 200:
                        content = resp.json()["choices"][0]["message"]["content"]
                        return json.loads(content)
            except Exception:
                pass
                
        if self.provider == "ollama":
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(
                        f"{settings.OLLAMA_BASE_URL}/api/generate",
                        json={
                            "model": settings.OLLAMA_MODEL,
                            "prompt": prompt,
                            "system": system_prompt or "Return strict valid JSON only.",
                            "stream": False,
                            "format": "json"
                        }
                    )
                    if resp.status_code == 200:
                        return json.loads(resp.json().get("response", "{}"))
            except Exception:
                pass
                
        return self._mock_structured_reasoning(prompt)

    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        if self.provider == "openai" and settings.OPENAI_API_KEY:
            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                        json={
                            "model": settings.OPENAI_MODEL,
                            "messages": [
                                {"role": "system", "content": system_prompt or "You are ShopMind AI assistant."},
                                {"role": "user", "content": prompt}
                            ]
                        }
                    )
                    if resp.status_code == 200:
                        return resp.json()["choices"][0]["message"]["content"]
            except Exception:
                pass

        if self.provider == "ollama":
            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(
                        f"{settings.OLLAMA_BASE_URL}/api/generate",
                        json={
                            "model": settings.OLLAMA_MODEL,
                            "prompt": prompt,
                            "system": system_prompt or "You are ShopMind AI assistant.",
                            "stream": False
                        }
                    )
                    if resp.status_code == 200:
                        return resp.json().get("response", "")
            except Exception:
                pass
                
        return ""

    def _mock_structured_reasoning(self, prompt: str) -> Dict[str, Any]:
        prompt_lower = prompt.lower()
        
        category = "mobile"
        if "laptop" in prompt_lower: category = "laptop"
        elif "shoe" in prompt_lower or "running" in prompt_lower: category = "running shoes"
        elif "headphone" in prompt_lower: category = "headphones"
        elif "watch" in prompt_lower: category = "smart watches"
        elif "tablet" in prompt_lower: category = "tablets"

        budget = 20000.0
        if "5000" in prompt_lower: budget = 5000.0
        elif "70000" in prompt_lower: budget = 70000.0

        return {
            "intent": "product_recommendation",
            "category": category,
            "budget": budget,
            "brand": "Samsung" if "samsung" in prompt_lower else None,
            "requirements": ["good camera"] if "camera" in prompt_lower else []
        }

llm_service = LLMService()
