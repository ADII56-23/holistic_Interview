from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from pydantic import BaseModel

from app.services.content_analysis import content_analyzer

router = APIRouter()

class IDEChatRequest(BaseModel):
    role: str
    language: str
    code: str
    chat_input: str
    history: List[Dict[str, str]] = []

@router.post("/chat")
async def ide_chat(request: IDEChatRequest):
    try:
        response = await content_analyzer.generate_ide_chat(
            role=request.role,
            language=request.language,
            code=request.code,
            chat_input=request.chat_input,
            history=request.history
        )
        return {"response": response}
    except Exception as e:
        print(f"IDE Chat Route Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
