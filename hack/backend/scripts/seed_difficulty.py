
from sqlalchemy.orm import Session
import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.models.database import SessionLocal, Question
import uuid

def seed():
    db = SessionLocal()
    try:
        # Clear existing questions for clean test if desired, or just add new ones
        # db.query(Question).delete()
        
        questions = [
            # Beginner
            {
                "id": str(uuid.uuid4()),
                "text": "Tell me about yourself and your background.",
                "category": "Behavioral",
                "difficulty": "beginner",
                "time_limit": 90
            },
            {
                "id": str(uuid.uuid4()),
                "text": "Why do you want to work for our company?",
                "category": "Behavioral",
                "difficulty": "beginner",
                "time_limit": 90
            },
            # Intermediate
            {
                "id": str(uuid.uuid4()),
                "text": "Describe a time you had a conflict with a teammate. How did you resolve it?",
                "category": "Situational",
                "difficulty": "intermediate",
                "time_limit": 60
            },
            {
                "id": str(uuid.uuid4()),
                "text": "How do you handle tight deadlines and high-pressure situations?",
                "category": "Situational",
                "difficulty": "intermediate",
                "time_limit": 60
            },
            # Advanced
            {
                "id": str(uuid.uuid4()),
                "text": "Design a globally distributed system for processing billions of events per second.",
                "category": "Technical",
                "difficulty": "advanced",
                "time_limit": 45
            },
            {
                "id": str(uuid.uuid4()),
                "text": "How do you lead a team through a fundamental shift in technical strategy?",
                "category": "Leadership",
                "difficulty": "advanced",
                "time_limit": 45
            }
        ]

        for q_data in questions:
            # Check if text already exists to avoid duplicates
            exists = db.query(Question).filter(Question.text == q_data["text"]).first()
            if not exists:
                q = Question(**q_data)
                db.add(q)
        
        db.commit()
        print("Database seeded successfully with difficulty-coded questions.")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
