from pydantic import BaseModel, Field
from typing import List, Optional

class Education(BaseModel):
    institution: str
    location: str
    degree: str
    expected_graduation: str

class Experience(BaseModel):
    company: str
    location: str
    role: str
    duration: str
    description: List[str]

class Leadership(BaseModel):
    organization: str
    location: str
    role: str
    duration: str
    description: List[str]

class SkillsInterests(BaseModel):
    computer: str
    language: str
    interests: str

class ResumeData(BaseModel):
    name: str
    phone: str
    email: str
    education: List[Education]
    experience: List[Experience]
    leadership: List[Leadership]
    skills: SkillsInterests

class AIResumeRequest(BaseModel):
    basic_info: str
    education_info: str
    experience_info: str
    skills_info: str
