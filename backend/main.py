from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy import text
from database import engine, settings
import models
from routers import ingest, resolution, candidates

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup check
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            print("Connected to database successfully.")
            
        # Create all staging tables
        models.Base.metadata.create_all(bind=engine)
        print("Database tables created successfully.")
    except Exception as e:
        print(f"Error connecting to the database: {e}")
    yield
    # Shutdown logic (if any) could go here

app = FastAPI(title="Skill-to-Employment Intelligence Platform API", lifespan=lifespan)

app.include_router(ingest.router)
app.include_router(resolution.router)
app.include_router(candidates.router)

@app.get("/health")
def healthcheck():
    return {
        "status": "ok", 
        "message": "Backend is running!", 
        "db_configured": bool(settings.database_url)
    }
