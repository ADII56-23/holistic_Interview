from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import uuid
import os
import shutil

from app.schemas.interview import InterviewCreate, InterviewStatus, InterviewResult
from app.models.database import InterviewSession, AnalysisResult
from app.core.config import settings
from app.services.speech_analysis import speech_analyzer
from app.services.body_language import body_language_analyzer
from app.services.content_analysis import content_analyzer

router = APIRouter()

# Dependency to get DB session (Mock for now until DB is connected)
def get_db():
    # To be replaced with real SQLAlchemy session
    pass

@router.post("/start", response_model=InterviewStatus)
async def start_interview(data: InterviewCreate):
    # Mock behavior
    session_id = str(uuid.uuid4())
    return {
        "id": session_id,
        "status": "pending",
        "created_at": "2024-02-04T12:00:00Z"
    }

@router.post("/upload")
async def upload_video(
    session_id: str = Form(...),
    file: UploadFile = File(...)
):
    # Validate file type
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video")
    
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    file_extension = file.filename.split(".")[-1]
    filename = f"{session_id}.{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")
    
    # In a real app, we would queue a Celery task here
    # For now, we run them synchronously to demonstrate the results
    try:
        speech_results = speech_analyzer.run_full_analysis(file_path)
        body_results = body_language_analyzer.analyze_video(file_path)
        content_results = await content_analyzer.analyze_content(speech_results["transcript"])
        
        # In-memory storage for the "session" results (Mock global)
        global mock_results
        if 'mock_results' not in globals(): mock_results = {}
        
        mock_results[session_id] = {
            "overall_score": int((speech_results["pace"]["wpm"] / 150 * 30) + (body_results["score"] / 3) + (content_results["overall_score"] / 3)),
            "verbal_score": 100 - int(speech_results["fillers"]["filler_rate"]),
            "non_verbal_score": body_results["score"],
            "content_score": content_results["overall_score"],
            "breakdown": {
                "speech": speech_results,
                "body_language": body_results,
                "content": content_results
            },
            "strengths": ["Clear speaking pace" if speech_results["pace"]["status"] == "normal" else "Good potential"] + content_results["suggestions"][:1],
            "improvements": body_results["feedback"] + [f"Try to reduce filler words (currently {speech_results['fillers']['filler_rate']}%)"],
            "action_items": ["Practice maintaining more steady eye contact"] + content_results["suggestions"][1:]
        }
    except Exception as e:
        print(f"Analysis failed: {str(e)}")

    return {
        "message": "Upload and Analysis successful",
        "session_id": session_id,
        "status": "completed"
    }

@router.get("/{session_id}/status", response_model=InterviewStatus)
async def get_status(session_id: str):
    # Mock behavior
    return {
        "id": session_id,
        "status": "processing",
        "created_at": "2024-02-04T12:00:00Z"
    }

@router.get("/{session_id}/results", response_model=InterviewResult)
async def get_results(session_id: str):
    global mock_results
    if 'mock_results' not in globals() or session_id not in mock_results:
        # Fallback mock for UI demo if no upload happened
        return {
            "id": session_id,
            "status": "completed",
            "created_at": "2024-02-04T12:00:00Z",
            "result": {
                "overall_score": 85,
                "verbal_score": 78,
                "non_verbal_score": 88,
                "content_score": 89,
                "breakdown": {},
                "strengths": ["Example strength"],
                "improvements": [],
                "action_items": []
            }
        }
    
    return {
        "id": session_id,
        "status": "completed",
        "created_at": "2024-02-04T12:00:00Z",
        "result": mock_results[session_id]
    }
