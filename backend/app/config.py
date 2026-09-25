from pydantic_settings import BaseSettings
from pydantic import Field
import os

class Settings(BaseSettings):
    ollama_base_url: str = Field(default="http://localhost:11434")
    ollama_model: str = Field(default="qwen3:1.7b")
    embedding_model: str = Field(default="all-MiniLM-L6-v2")
    chroma_db_path: str = Field(default="./data/chroma_db")
    sqlite_database_path: str = Field(default="./data/ip_sakti.db")
    top_k_results: int = Field(default=5)
    confidence_threshold: float = Field(default=0.35)
    max_file_size_mb: int = Field(default=50)
    allowed_origins: str = Field(default="http://localhost:5173,http://localhost:3000")
    debug: bool = Field(default=False)
    hf_token: str = Field(default="")

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

settings = Settings()

# Suppress HuggingFace unauthenticated request warnings
if settings.hf_token:
    os.environ["HF_TOKEN"] = settings.hf_token
