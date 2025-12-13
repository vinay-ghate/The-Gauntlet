import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "The Gauntlet MVP"
    API_V1_STR: str = "/api/v1"
    
    # Auth
    SECRET_KEY: str = "changethis_secret_key_for_jwt_encoding"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "admin")
    
    # AI
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Server Config (Mock or Real)
    # List of allowed servers. In a real app this might be in a DB.
    # Format: "host:port:user:key_path" or just host for now
    SERVERS: List[str] = []

    class Config:
        env_file = ".env"

settings = Settings()
