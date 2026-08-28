from contextlib import asynccontextmanager
from fastapi import FastAPI
from pydantic_settings import BaseSettings
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os

class Settings(BaseSettings):
    database_url: str

    class Config:
        env_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
        env_file_encoding = 'utf-8'
        extra = "ignore"

settings = Settings()

# Set up SQLAlchemy Engine and Session
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup check
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            print("Connected to database successfully.")
    except Exception as e:
        print(f"Error connecting to the database: {e}")
    yield
    # Shutdown logic (if any) could go here

app = FastAPI(title="Skill-to-Employment Intelligence Platform API", lifespan=lifespan)

@app.get("/health")
def healthcheck():
    return {
        "status": "ok", 
        "message": "Backend is running!", 
        "db_configured": bool(settings.database_url)
    }

