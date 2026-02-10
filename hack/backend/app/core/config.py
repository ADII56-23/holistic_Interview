from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Holistic Interview Intelligence"
    
    # Database
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///./interview.db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-for-development"  # Change in production
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Storage
    UPLOAD_DIR: str = "uploads"
    
    # AI Keys
    OPENAI_API_KEY: str = ""
    OPENROUTER_API_KEY: str = "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"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
