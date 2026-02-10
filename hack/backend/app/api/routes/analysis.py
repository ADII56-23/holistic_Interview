from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Dict, Any, List
import os
import shutil
import uuid
from app.services.speech_analysis import speech_analyzer
from app.services.body_language import body_language_analyzer
from app.services.content_analysis import content_analyzer
from app.core.config import settings

router = APIRouter()

@router.post("/analyze-video")
async def analyze_video(
    role: str = Form("Software Engineer"),
    file: UploadFile = File(...),
    transcripts: str = Form(None) # JSON string of List[Dict[str, str]]
):
    """
    Uploads an interview video and runs full verbal/non-verbal analysis.
    """
    import json
    
    # Create unique filename
    file_id = str(uuid.uuid4())
    temp_dir = os.path.join(settings.UPLOAD_DIR, "temp")
    os.makedirs(temp_dir, exist_ok=True)
    
    file_extension = os.path.splitext(file.filename)[1]
    if not file_extension:
        file_extension = ".webm"
        
    video_path = os.path.join(temp_dir, f"{file_id}{file_extension}")
    
    try:
        # Save uploaded file
        with open(video_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 1. Run Speech Analysis
        speech_results = speech_analyzer.run_full_analysis(video_path)
        
        # 2. Run Body Language Analysis
        body_results = body_language_analyzer.analyze_video(video_path)
        
        # 3. Combine Metrics
        combined_metrics = {
            "verbal": speech_results,
            "non_verbal": body_results
        }
        
        # 4. Use provided transcripts if available, otherwise use Whisper output
        final_transcripts = []
        if transcripts:
            try:
                final_transcripts = json.loads(transcripts)
            except:
                final_transcripts = [{"question": "Captured Answer", "answer": speech_results["transcript"]}]
        else:
            final_transcripts = [{"question": "Captured Answer", "answer": speech_results["transcript"]}]
            
        # 5. Generate AI Feedback
        final_feedback = await content_analyzer.generate_interview_feedback(
            role=role,
            transcripts=final_transcripts,
            metrics=combined_metrics
        )
        
        return final_feedback
        
    except Exception as e:
        print(f"Video Analysis Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup
        if os.path.exists(video_path):
            os.remove(video_path)
