from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.models.database import engine, Base, SessionLocal
from app.services.seeder import seed_questions

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Holistic Interview Intelligence API",
    description="Backend API for AI-powered interview analysis",
    version="1.0.0",
)

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        seed_questions(db)
    finally:
        db.close()

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def health_check():
    return {
        "status": "online",
        "message": "Holistic Interview Intelligence API is running",
        "version": "1.0.0"
    }

# Include routers
from app.api.routes import interviews, questions, users

app.include_router(interviews.router, prefix="/api/v1/interviews", tags=["interviews"])
app.include_router(questions.router, prefix="/api/v1/questions", tags=["questions"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
