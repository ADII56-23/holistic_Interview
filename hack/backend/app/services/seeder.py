from sqlalchemy.orm import Session
from app.models.database import Question
import uuid

def seed_questions(db: Session):
    # Check if we already have questions
    if db.query(Question).count() > 0:
        return

    questions = [
        # Beginner
        {
            "text": "Tell me about yourself and your background.",
            "category": "behavioral",
            "difficulty": "beginner",
            "domain": "general",
            "time_limit": 90
        },
        {
            "text": "Why do you want to work for our company?",
            "category": "behavioral",
            "difficulty": "beginner",
            "domain": "general",
            "time_limit": 90
        },
        # Intermediate
        {
            "text": "Describe a time you had a conflict with a teammate. How did you resolve it?",
            "category": "situational",
            "difficulty": "intermediate",
            "domain": "collaboration",
            "time_limit": 60
        },
        {
            "text": "How do you handle tight deadlines and high-pressure situations?",
            "category": "situational",
            "difficulty": "intermediate",
            "domain": "performance",
            "time_limit": 60
        },
        # Advanced
        {
            "text": "Design a globally distributed system for processing billions of events per second.",
            "category": "technical",
            "difficulty": "advanced",
            "domain": "software-engineering",
            "time_limit": 45
        },
        {
            "text": "How do you lead a team through a fundamental shift in technical strategy?",
            "category": "leadership",
            "difficulty": "advanced",
            "domain": "management",
            "time_limit": 45
        }
    ]

    for q_data in questions:
        db_question = Question(
            id=str(uuid.uuid4()),
            **q_data
        )
        db.add(db_question)
    
    db.commit()
