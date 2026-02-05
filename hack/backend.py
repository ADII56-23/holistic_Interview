from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
import openai
import os
import json

app = FastAPI()

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

# LLM Setup (GPT-4o)
llm = ChatOpenAI(model="gpt-4o", openai_api_key=OPENAI_API_KEY)

# 1. Transcription Chain (OpenAI Whisper)
async def transcribe_video(video_file: UploadFile):
    # In a real scenario, we'd save the file and send it to Whisper
    transcript = openai.Audio.transcribe("whisper-1", video_file.file)
    return transcript["text"]

# 2. Skill Tree & Content Generation Chain (LangChain)
learning_prompt = ChatPromptTemplate.from_template("""
You are VideoSkillAI. Transform this transcript into an interactive learning package.
Transcript: {transcript}
User Level: {user_level}
Modalities: {modalities}

Output strictly in JSON format as specified.
""")

content_chain = LLMChain(llm=llm, prompt=learning_prompt)

# 3. Unique Twist: AR Overlay Chain (A-Frame)
ar_prompt = ChatPromptTemplate.from_template("""
Based on the following skill tree nodes, generate A-Frame (HTML/WebVR) code 
to visualize this tree in a 3D AR space.
Nodes: {nodes}
Edges: {edges}
Output only the A-Frame HTML snippet.
""")

ar_chain = LLMChain(llm=llm, prompt=ar_prompt)

# 4. Quiz Generation Chain
quiz_prompt = ChatPromptTemplate.from_template("""
You are InterviewQuizAI. Generate EXACTLY 10 multiple choice questions about the following topic and difficulty level.
Topic: {topic}
Difficulty: {difficulty}

Output strictly in JSON format as a list of objects:
[
  {{
    "id": 1,
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "The exact string of the correct option"
  }},
  ...
]
""")

quiz_chain = LLMChain(llm=llm, prompt=quiz_prompt)

@app.post("/transform")
async def transform_video(file: UploadFile = File(...), user_level: str = "Beginner", modalities: str = "quizzes, code"):
    # Step 1: Transcribe
    transcript = await transcribe_video(file)
    
    # Step 2: Generate Learning Content
    learning_pkg = await content_chain.arun(transcript=transcript, user_level=user_level, modalities=modalities)
    
    # Step 3: Generate AR Visualization Code (Unique Twist)
    ar_code = await ar_chain.arun(nodes=learning_pkg["skill_tree"]["nodes"], edges=learning_pkg["skill_tree"]["edges"])
    
    return {
        "learning_package": learning_pkg,
        "ar_visualization": ar_code
    }

@app.post("/generate-quiz")
async def generate_quiz_endpoint(topic: str, difficulty: str = "Intermediate"):
    # Generate Quiz Content
    quiz_content = await quiz_chain.arun(topic=topic, difficulty=difficulty)
    
    try:
        # Try to parse the LLM output as JSON
        parsed_quiz = json.loads(quiz_content)
        return {"quiz": parsed_quiz}
    except:
        # If parsing fails, return as string (fallback)
        return {"quiz_raw": quiz_content}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
