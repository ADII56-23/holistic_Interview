from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Optional, Any

class InterviewBase(BaseModel):
    question_id: str

class InterviewCreate(InterviewBase):
    pass

class InterviewStatus(BaseModel):
    id: str
    status: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class AnalysisResultSchema(BaseModel):
    overall_score: float
    verbal_score: float
    non_verbal_score: float
    content_score: float
    breakdown: dict
    strengths: List[str]
    improvements: List[Any]
    action_items: List[str]
    
    model_config = ConfigDict(from_attributes=True)

class InterviewResult(InterviewStatus):
    result: Optional[AnalysisResultSchema] = None
    video_url: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class QuestionSchema(BaseModel):
    id: str
    text: str
    category: str
    difficulty: str
    domain: str
    time_limit: int
    
    model_config = ConfigDict(from_attributes=True)

class JDRequest(BaseModel):
    jd_text: str

class PersonalizedRequest(BaseModel):
    jd_text: Optional[str] = ""
    resume_text: Optional[str] = ""
