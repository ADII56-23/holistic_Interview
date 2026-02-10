from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, List
import os
from openai import OpenAI

router = APIRouter()

# Initialize OpenAI client (works with OpenRouter too if you change base_url)
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    # base_url="https://openrouter.ai/api/v1", # Uncomment for OpenRouter
)

SYSTEM_PROMPTS = {
    "Software Engineer": "You are an experienced technical interviewer for a Software Engineer position. Ask about algorithms, system design, and coding practices. Be professional but conversational. Keep responses concise (under 2 sentences) to simulate a phone call. Do not repeat greeting.",
    "Product Manager": "You are a hiring manager for a Product Manager role. Ask about product strategy, prioritization, and metrics. Be professional. Keep responses concise.",
    "Data Scientist": "You are a lead data scientist interviewing a candidate. Ask about statistics, machine learning models, and data cleaning. Keep responses concise.",
    "Marketing Specialist": "You are a marketing director interviewing a candidate. Ask about campaign management, SEO, and brand strategy. Keep responses concise."
}

@router.post("/chat-response")
async def process_interviewer_response(
    role: str = Body(embed=True),
    history: List[Dict[str, str]] = Body(embed=True)
):
    """
    Generates the AI Interviewer's next response based on conversation history.
    Acts as the 'Brain' for the simulated phone interview.
    """
    try:
        # Get appropriate system prompt
        system_prompt = SYSTEM_PROMPTS.get(role, SYSTEM_PROMPTS["Software Engineer"])
        
        # Construct messages
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history
        # Ensure history is valid
        if history:
            messages.extend(history)
            
        # Call LLM
        response = client.chat.completions.create(
            model="gpt-4o-mini", # Cost-effective model
            messages=messages,
            max_tokens=150,
            temperature=0.7
        )
        
        ai_message = response.choices[0].message.content
        return {"response": ai_message}
        
    except Exception as e:
        print(f"AI Chat Error: {e}")
        # Fallback response in case of error
        return {"response": "I apologize, I didn't quite catch that. Could you please repeat?"}

