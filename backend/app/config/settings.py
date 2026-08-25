from typing import Dict, List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    ENV: str = "development"
    
    # LLM Settings
    LLM_PROVIDER: str = "mock" # mock, ollama, openai
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    
    # CORS Origins (Comma separated string)
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,https://shopmind-ai.vercel.app"

    # Database Settings
    DATABASE_URL: str = "sqlite:///./shopmind.db"
    
    # RAG Settings
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    FAISS_INDEX_PATH: str = "./app/data/faiss_index"
    CHUNK_SIZE: int = 300
    CHUNK_OVERLAP: int = 50

    # Cache Settings
    CACHE_TTL: int = 300

    # Configurable Ranking Weights
    RANKING_WEIGHTS: Dict[str, float] = {
        "budget_fit": 0.35,
        "rating": 0.35,
        "requirement_match": 0.30
    }

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
