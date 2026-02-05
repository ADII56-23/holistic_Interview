from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.schemas.interview import QuestionSchema, JDRequest, PersonalizedRequest
from app.models.database import Question, get_db
from app.services.content_analysis import content_analyzer

router = APIRouter()

@router.get("/", response_model=List[QuestionSchema])
async def get_questions(
    category: str = None,
    difficulty: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Question)
    if category:
        query = query.filter(Question.category == category)
    if difficulty:
        query = query.filter(Question.difficulty == difficulty)
    return query.all()

@router.post("/generate-from-jd", response_model=List[QuestionSchema])
async def generate_from_jd(request: JDRequest):
    try:
        questions = await content_analyzer.generate_from_jd(request.jd_text)
        return questions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-personalized", response_model=List[QuestionSchema])
async def generate_personalized(request: PersonalizedRequest):
    try:
        questions = await content_analyzer.generate_personalized(request.jd_text, request.resume_text)
        return questions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-quiz")
async def generate_quiz(topic: str, difficulty: str = "Intermediate"):
    try:
        questions = await content_analyzer.generate_quiz(topic, difficulty)
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/subtopics")
async def get_subtopics(language: str):
    try:
        topics = await content_analyzer.generate_subtopics(language)
        return {"topics": topics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-session")
async def analyze_session(data: Dict[str, Any]):
    try:
        feedback = await content_analyzer.generate_interview_feedback(
            role=data.get("role", "Software Engineer"),
            transcripts=data.get("transcripts", [])
        )
        return feedback
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/check-config")
async def check_config():
    from app.core.config import settings
    return {
        "has_openai_key": bool(settings.OPENAI_API_KEY),
        "key_prefix": settings.OPENAI_API_KEY[:7] if settings.OPENAI_API_KEY else "None"
    }

@router.get("/{question_id}", response_model=QuestionSchema)
async def get_question(question_id: str, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question
