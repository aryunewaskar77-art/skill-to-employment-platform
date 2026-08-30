from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database import SQLALCHEMY_DATABASE_URL
import backend.models as models
from backend.routers.resolution import seed_review_samples

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    seed_review_samples(db)
    print("Success")
except Exception as e:
    import traceback
    traceback.print_exc()
