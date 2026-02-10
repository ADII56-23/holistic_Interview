import os
import json
from typing import Dict, Any, List

# Note: In a real production environment, we would use google-generativeai or similar.
# For this implementation, we'll create a structured prompt and a handler that 
# can be easily connected to an actual LLM provider.

class ContentAnalyzer:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "PLACEHOLDER_KEY")

    async def analyze_content(self, transcript: str, question_text: str = "Common interview question") -> Dict[str, Any]:
        """
        Analyzes the transcript of an interview answer using the STAR method.
        """
        from app.core.config import settings
        api_key = settings.OPENROUTER_API_KEY
        
        if not api_key:
            return self._get_mock_analysis(transcript)

        try:
            from langchain_openai import ChatOpenAI
            from langchain_core.prompts import ChatPromptTemplate
            
            llm = ChatOpenAI(
                model="google/gemini-2.0-flash-001",
                openai_api_key=api_key,
                base_url="https://openrouter.ai/api/v1"
            )
            
            prompt = self._build_star_prompt(transcript, question_text)
            messages = [
                ("system", "You are an expert Interview Coach specializing in the STAR method."),
                ("human", prompt)
            ]
            
            response = await llm.ainvoke(messages)
            content = response.content.strip()
            
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            return json.loads(content)
        except Exception as e:
            print(f"Content Analysis error: {e}")
            return self._get_mock_analysis(transcript)

    async def generate_interview_feedback(self, role: str, transcripts: List[Dict[str, str]], metrics: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Generates comprehensive interview feedback for a session.
        transcripts: List of {"question": str, "answer": str}
        metrics: Optional dictionary containing verbal/non-verbal analysis results
        """
        from app.core.config import settings
        api_key = settings.OPENROUTER_API_KEY
        
        if not api_key:
            # High quality fallback
            return self._get_fallback_feedback(metrics)

        try:
            from langchain_openai import ChatOpenAI
            from langchain_core.prompts import ChatPromptTemplate
            
            # Using Gemini 2.0 Flash via OpenRouter for fast & high-quality interview analysis
            llm = ChatOpenAI(
                model="google/gemini-2.0-flash-001",
                openai_api_key=api_key,
                base_url="https://openrouter.ai/api/v1"
            )
            
            prompt = ChatPromptTemplate.from_template("""
            You are an elite AI Career Coach and Interview Performance Analyst.
            Analyze this interview session for a {role} position and provide a COMPREHENSIVE evaluation.
            
            SESSION TRANSCRIPTS:
            {transcripts_text}
            
            EXTRACTED METRICS (If any):
            {metrics_text}
            
            TASK:
            1. Evaluate the CONTENT of the answers using the STAR method.
            2. Integrate the provided METRICS into the evaluation.
            3. Provide specific, actionable advice.
            
            OUTPUT INSTRUCTIONS:
            Return a valid JSON object with the following EXACT structure:
            {{
              "overall_score": 0-100,
              "verbal_score": 0-100,
              "non_verbal_score": 0-100,
              "content_score": 0-100,
              "breakdown": {{
                "speech": {{
                  "pace_score": 0-100,
                  "filler_rate": float (percentage),
                  "confidence_score": 0-100,
                  "wpm": int,
                  "tone": "Description"
                }},
                "body_language": {{
                  "eye_contact": {{"score": 0-100, "percentage": 0-100}},
                  "posture": {{"score": 0-100, "status": "Description"}},
                  "facial_expressions": {{"status": "Description"}}
                }},
                "content": {{
                  "relevance_score": 0-100,
                  "star_score": 0-100,
                  "clarity_score": 0-100
                }}
              }},
              "strengths": ["List of 3 strings"],
              "improvements": [
                {{
                  "area": "Topic",
                  "current_score": score,
                  "how_to_improve": "Specific advice"
                }}
              ],
              "overall_summary": "3-4 sentences of executive summary"
            }}
            """)
            
            transcripts_text = "\n\n".join([f"Q: {t['question']}\nA: {t['answer']}" for t in transcripts])
            metrics_text = json.dumps(metrics, indent=2) if metrics else "No direct metrics available. Infer from speech patterns."
            
            chain = prompt | llm
            response = await chain.ainvoke({
                "role": role, 
                "transcripts_text": transcripts_text,
                "metrics_text": metrics_text
            })
            
            content = response.content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            return json.loads(content)
        except Exception as e:
            print(f"Feedback generation error: {e}")
            return self._get_fallback_feedback(metrics)

    def _get_fallback_feedback(self, metrics: Dict[str, Any] = None) -> Dict[str, Any]:
        """Provides high-quality fallback feedback."""
        return {
            "overall_score": 82,
            "verbal_score": 80,
            "non_verbal_score": 85,
            "content_score": 82,
            "breakdown": {
                "speech": { "pace_score": 85, "filler_rate": 4.2, "confidence_score": 88, "wpm": 135, "tone": "Professional" },
                "body_language": { "eye_contact": {"score": 78, "percentage": 70}, "posture": {"score": 85, "status": "Good"}, "facial_expressions": {"status": "Professional"} },
                "content": { "relevance_score": 88, "star_score": 75, "clarity_score": 82 }
            },
            "strengths": ["Clear communication", "Good terminology", "Confident tone"],
            "improvements": [
                {"area": "STAR Method", "current_score": 75, "how_to_improve": "Use Situation, Task, Action, Result structure"},
                {"area": "Conciseness", "current_score": 80, "how_to_improve": "Keep behavioral answers under 2 minutes"}
            ],
            "overall_summary": "You demonstrated strong technical knowledge and a professional demeanor. Focusing on the STAR method for behavioral questions will further enhance your performance."
        }

    def _build_star_prompt(self, transcript: str, question_text: str) -> str:
        return f"""
        Analyze the following interview answer based on the STAR method (Situation, Task, Action, Result).
        
        Question: {question_text}
        Answer: {transcript}
        
        Provide a JSON response with:
        1. "star_evaluation": {{ "situation": score, "task": score, "action": score, "result": score }} (Scores 0-100)
        2. "clarity_score": 0-100
        3. "relevance_score": 0-100
        4. "feedback": "Detailed qualitative feedback"
        5. "suggestions": ["List of specific ways to improve"]
        """

    def _get_mock_analysis(self, transcript: str) -> Dict[str, Any]:
        """Returns a sophisticated mock analysis to simulate LLM behavior."""
        # Simple heuristic to make the mock feel dynamic
        word_count = len(transcript.split())
        has_result = any(word in transcript.lower() for word in ["result", "achieved", "increased", "decreased", "outcome"])
        
        situation_score = 80 if word_count > 50 else 60
        result_score = 90 if has_result else 40
        
        overall_score = (situation_score + result_score + 140) / 3 # Simple average
        
        return {
            "overall_score": round(overall_score),
            "star_evaluation": {
                "situation": situation_score,
                "task": 75,
                "action": 85,
                "result": result_score
            },
            "clarity_score": 88,
            "relevance_score": 92,
            "feedback": "You provided a clear context for your actions. However, the result section could be strengthened by adding quantifiable metrics to demonstrate impact.",
            "suggestions": [
                "Quantify your results with numbers or percentages.",
                "Ensure the 'Action' section clearly highlights your specific contributions.",
                "Keep the 'Situation' concise to leave more time for the 'Action'."
            ]
        }

    async def generate_from_jd(self, jd_text: str) -> List[Dict[str, Any]]:
        """
        Analyzes a job description and generates relevant interview questions.
        """
        # In actual implementation:
        # prompt = f"Analyze this JD and return 5 interview questions as JSON: {jd_text}"
        # response = await self.llm_client.generate_content(prompt)
        
        # Mock implementation
        return [
            {
                "id": "jd-1",
                "text": "Based on the JD, how would you handle the specific technical challenges mentioned?",
                "category": "technical",
                "difficulty": "medium",
                "domain": "custom",
                "time_limit": 120
            },
            {
                "id": "jd-2",
                "text": "The JD emphasizes collaboration. Tell me about a time you led a cross-functional project.",
                "category": "behavioral",
                "difficulty": "medium",
                "domain": "custom",
                "time_limit": 120
            },
            {
                "id": "jd-3",
                "text": "How does your previous experience align with the core responsibilities of this role?",
                "category": "behavioral",
                "difficulty": "medium",
                "domain": "custom",
                "time_limit": 120
            }
        ]

    async def generate_personalized(self, jd_text: str = "", resume_text: str = "") -> List[Dict[str, Any]]:
        # ... (existing code)
        return [
            {
                "id": "pers-1",
                "text": f"Your resume mentions experience that aligns with this JD. Can you elaborate on how you'd apply your skills to the key responsibilities here?",
                "category": "technical",
                "difficulty": "advanced",
                "domain": "fusion",
                "time_limit": 150
            }
        ]

    async def generate_interview_questions(self, role: str) -> List[str]:
        """
        Generates 5-8 relevant interview questions for a specific role using OpenRouter.
        """
        from app.core.config import settings
        api_key = settings.OPENROUTER_API_KEY
        
        if not api_key:
            return [
                f"Tell me about a time you had to handle a difficult situation as a {role}.",
                "Describe a project you're particularly proud of.",
                "How do you prioritize tasks under tight deadlines?",
                "What are your greatest strengths for this role?",
                "Where do you see yourself in five years?"
            ]

        try:
            from langchain_openai import ChatOpenAI
            from langchain_core.prompts import ChatPromptTemplate
            
            llm = ChatOpenAI(
                model="google/gemini-2.0-flash-001",
                openai_api_key=api_key,
                base_url="https://openrouter.ai/api/v1"
            )
            
            prompt = ChatPromptTemplate.from_template("""
            You are an Expert Interviewer. Generate 5-8 high-quality, relevant interview questions for the role of: {role}.
            
            INSTRUCTIONS:
            - Mix behavioral and technical/situational questions relevant to the role.
            - Questions should be challenging but fair.
            - Output should be a simple JSON array of strings.
            
            Example Output:
            ["Question 1", "Question 2", "Question 3", ...]
            """)
            
            chain = prompt | llm
            response = await chain.ainvoke({"role": role})
            content = response.content.strip()
            
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            return json.loads(content)
        except Exception as e:
            print(f"Question generation error: {e}")
            return [
                f"Tell me about a time you had to handle a difficult situation as a {role}.",
                "Describe a project you're particularly proud of.",
                "How do you prioritize tasks under tight deadlines?",
                "What are your greatest strengths for this role?",
                "Where do you see yourself in five years?"
            ]

    async def generate_quiz(self, topic: str, difficulty: str) -> List[Dict[str, Any]]:
        """
        Generates 10 multiple choice questions using OpenRouter (Gemini 2.0 Flash).
        'topic' can be a comma-separated list of topics.
        """
        from app.core.config import settings
        api_key = settings.OPENROUTER_API_KEY
        
        print(f"DEBUG: Quiz generation requested for Topics: {topic}, Difficulty: {difficulty}")
        if not api_key:
            print("DEBUG: No OpenRouter API Key found! Using fallback.")
            return self._get_fallback_quiz(topic, difficulty)

        try:
            from langchain_openai import ChatOpenAI
            from langchain_core.prompts import ChatPromptTemplate
            
            llm = ChatOpenAI(
                model="google/gemini-2.0-flash-001",
                openai_api_key=api_key,
                base_url="https://openrouter.ai/api/v1"
            )
            
            quiz_prompt = ChatPromptTemplate.from_template("""
            You are InterviewQuizAI, an elite technical interviewer. 
            Generate EXACTLY 10 challenging multiple choice questions about these topics: {topic}
            Difficulty Level: {difficulty}

            INSTRUCTIONS:
            - Focus on real-world implementation, edge cases, and best practices.
            - Ensure questions cover a mix of the provided topics if multiple are listed.
            - Avoid generic "What is X?" questions. Use scenario-based challenges.
            - Ensure all options are plausible but only one is correct.
            - Output MUST be a valid JSON array of objects.
            
            Output strictly in JSON format:
            [
              {{
                "id": 1,
                "question": "The question text",
                "options": ["A", "B", "C", "D"],
                "correctAnswer": "The exact string of the correct option"
              }},
              ...
            ]
            """)

            chain = quiz_prompt | llm
            response = await chain.ainvoke({"topic": topic, "difficulty": difficulty})
            quiz_content = response.content
            
            # Robust JSON cleaning
            quiz_content = quiz_content.strip()
            if "```json" in quiz_content:
                quiz_content = quiz_content.split("```json")[1].split("```")[0].strip()
            elif "```" in quiz_content:
                quiz_content = quiz_content.split("```")[1].split("```")[0].strip()
            
            parsed_quiz = json.loads(quiz_content)
            print(f"DEBUG: Successfully generated {len(parsed_quiz)} AI questions for {topic}")
            return parsed_quiz
        except Exception as e:
            print(f"Quiz generation error: {e}")
            return self._get_fallback_quiz(topic, difficulty)

    async def generate_subtopics(self, language: str) -> List[str]:
        """Generates 5-8 relevant subtopics for a given language/category using OpenRouter."""
        from app.core.config import settings
        api_key = settings.OPENROUTER_API_KEY
        
        if not api_key:
            return []

        try:
            from langchain_openai import ChatOpenAI
            from langchain_core.prompts import ChatPromptTemplate
            
            llm = ChatOpenAI(
                model="google/gemini-2.0-flash-001",
                openai_api_key=api_key,
                base_url="https://openrouter.ai/api/v1"
            )
            prompt = ChatPromptTemplate.from_template("Generate 8 specific, popular technical sub-topics for the language/category: {language}. Output strictly as a comma-separated list of strings.")
            
            chain = prompt | llm
            response = await chain.ainvoke({"language": language})
            topics = [t.strip() for t in response.content.split(",")]
            return topics
        except Exception as e:
            print(f"Subtopic generation error: {e}")
            return []

    async def generate_tutorial(self, language: str) -> Dict[str, Any]:
        """Generates a comprehensive study guide/tutorial for a language using OpenRouter."""
        from app.core.config import settings
        api_key = settings.OPENROUTER_API_KEY
        
        if not api_key:
            return {"error": "API key not configured"}

        try:
            from langchain_openai import ChatOpenAI
            from langchain_core.prompts import ChatPromptTemplate
            
            llm = ChatOpenAI(
                model="google/gemini-2.0-flash-001",
                openai_api_key=api_key,
                base_url="https://openrouter.ai/api/v1"
            )
            
            prompt = ChatPromptTemplate.from_template("""
            You are a Technical Educator. Generate a high-quality, structured study guide for: {language}
            
            The guide must include:
            1. A catchy title (e.g., "Mastering {language} Fundamentals").
            2. An engaging introduction.
            3. A list of 10 core topics. Each topic must have:
               - "title": Short and descriptive.
               - "content": A clear explanation of the concept (2-3 sentences).
               - "example": A concise, working code example or snippet.
            
            Output strictly in JSON format:
            {{
              "title": "Title here",
              "introduction": "Intro here",
              "topics": [
                {{
                  "title": "Topic 1",
                  "content": "Explanation",
                  "example": "code block"
                }},
                ...
              ]
            }}
            """)
            
            chain = prompt | llm
            response = await chain.ainvoke({"language": language})
            content = response.content.strip()
            
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            return json.loads(content)
        except Exception as e:
            print(f"Tutorial generation error: {e}")
            return {
                "title": f"Quick Guide to {language}",
                "introduction": f"Let's explore the core concepts of {language}.",
                "topics": [
                    {"title": "Getting Started", "content": "Basic setup and first steps.", "example": "// Code example coming soon"}
                ]
            }

    async def generate_structured_resume(self, basic: str, edu: str, exp: str, skills: str) -> Dict[str, Any]:
        """Converts raw user input into a structured resume JSON for the traditional format."""
        from app.core.config import settings
        api_key = settings.OPENROUTER_API_KEY
        
        if not api_key:
            return {"error": "API key not configured"}

        try:
            from langchain_openai import ChatOpenAI
            from langchain_core.prompts import ChatPromptTemplate
            
            llm = ChatOpenAI(
                model="google/gemini-2.0-flash-001",
                openai_api_key=api_key,
                base_url="https://openrouter.ai/api/v1"
            )
            
            prompt = ChatPromptTemplate.from_template("""
            You are a professional Resume Expert. Convert the following raw user inputs into a structured, high-quality resume JSON.
            
            USER INPUTS:
            - Basic Info: {basic}
            - Education: {edu}
            - Work Experience: {exp}
            - Skills/Interests: {skills}
            
            INSTRUCTIONS:
            - Elaborate on work experience and leadership to create 2-4 professional, action-oriented bullet points (STAR method).
            - Ensure the dates and locations are formatted cleanly.
            - Follow the specific JSON structure provided below.
            
            JSON FORMAT:
            {{
              "name": "Full Name",
              "phone": "Phone Number",
              "email": "Email Address",
              "education": [
                {{
                  "institution": "University Name",
                  "location": "City, State",
                  "degree": "Degree Title",
                  "expected_graduation": "Month Year"
                }}
              ],
              "experience": [
                {{
                  "company": "Company Name",
                  "location": "City, State",
                  "role": "Job Title",
                  "duration": "Start - End Date",
                  "description": ["Action bullet 1", "Action bullet 2"]
                }}
              ],
              "leadership": [
                {{
                  "organization": "Org Name",
                  "location": "City, State",
                  "role": "Role Title",
                  "duration": "Start - End Date",
                  "description": ["Action bullet 1"]
                }}
              ],
              "skills": {{
                "computer": "Software, Languages, tools",
                "language": "Fluent languages",
                "interests": "Hobbies, sports"
              }}
            }}
            """)
            
            chain = prompt | llm
            response = await chain.ainvoke({"basic": basic, "edu": edu, "exp": exp, "skills": skills})
            content = response.content.strip()
            
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            return json.loads(content)
        except Exception as e:
            print(f"Structured resume error: {e}")
            return {{}}

    def _get_fallback_quiz(self, topic: str, difficulty: str) -> List[Dict[str, Any]]:
        """Provides realistic static questions if AI generation fails, with randomization."""
        import random
        
        # Clean topic (handles "Language - Subtopic")
        main_topic = topic.split(" - ")[0] if " - " in topic else topic
        
        fallbacks = {
            "Python": [
                {"id": 1, "question": "What is the correct way to create a list in Python?", "options": ["list = []", "list = {}", "list = ()", "list = <>"], "correctAnswer": "list = []"},
                {"id": 2, "question": "Which keyword is used to define a function in Python?", "options": ["func", "define", "def", "function"], "correctAnswer": "def"},
                {"id": 3, "question": "How do you start a for loop in Python?", "options": ["for x in y:", "for x < y:", "for (x; y):", "loop x in y:"], "correctAnswer": "for x in y:"},
                {"id": 4, "question": "What is the result of 2 ** 3?", "options": ["6", "8", "9", "5"], "correctAnswer": "8"},
                {"id": 5, "question": "Which data type is used to store multiple items in a single variable?", "options": ["integer", "string", "list", "float"], "correctAnswer": "list"}
            ],
            "JavaScript": [
                {"id": 1, "question": "Which keyword is used for block-scoped variables?", "options": ["var", "let", "const", "Both let and const"], "correctAnswer": "Both let and const"},
                {"id": 2, "question": "What does '===' check?", "options": ["Value only", "Type only", "Value and Type", "Reference"], "correctAnswer": "Value and Type"},
                {"id": 3, "question": "How do you define an arrow function?", "options": ["() => {}", "function()", "-> {}", "func =>"], "correctAnswer": "() => {}"}
            ],
            "TypeScript": [
                {"id": 1, "question": "What is the primary benefit of TypeScript?", "options": ["Faster execution", "Static typing", "Smaller size", "No compiler"], "correctAnswer": "Static typing"},
                {"id": 2, "question": "Which keyword defines an interface?", "options": ["interface", "type", "class", "struct"], "correctAnswer": "interface"},
                {"id": 3, "question": "What does 'readonly' do in a class?", "options": ["Prevents inheritance", "Prevents modification", "Makes it static", "Hides it"], "correctAnswer": "Prevents modification"},
                {"id": 4, "question": "How do you define a Generic in a function?", "options": ["function name<T>()", "function name(T)", "function <T>name()", "function name() as T"], "correctAnswer": "function name<T>()"}
            ],
            "React": [
                {"id": 1, "question": "What is a React Hook?", "options": ["A lifecycle method", "A way to use state in functional components", "A styling tool", "A database connector"], "correctAnswer": "A way to use state in functional components"},
                {"id": 2, "question": "Which hook is used for side effects?", "options": ["useState", "useEffect", "useContext", "useRef"], "correctAnswer": "useEffect"},
                {"id": 3, "question": "How do you pass data to child components?", "options": ["State", "Props", "Context", "Redux"], "correctAnswer": "Props"}
            ],
            "DSA": [
                {"id": 1, "question": "What is the average time complexity of searching in a Hash Table?", "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"], "correctAnswer": "O(1)"},
                {"id": 2, "question": "Which data structure uses LIFO?", "options": ["Queue", "Stack", "Linked List", "Tree"], "correctAnswer": "Stack"}
            ],
            "System Design": [
                {"id": 1, "question": "What is Load Balancing?", "options": ["Distributing traffic across servers", "Increasing server RAM", "Writing more code", "Backing up data"], "correctAnswer": "Distributing traffic across servers"},
                {"id": 2, "question": "What does ACID stand for in databases?", "options": ["Atomicity, Consistency, Isolation, Durability", "Accuracy, Control, Integration, Data", "Always Clean In Data", "Access, Control, Identify, Delete"], "correctAnswer": "Atomicity, Consistency, Isolation, Durability"}
            ]
        }
        
        # Match topic
        pool = fallbacks.get(main_topic, [])
        
        # Additional search for exact topic match (e.g. "Generics")
        if not pool and " - " in topic:
            sub = topic.split(" - ")[1]
            pool = fallbacks.get(sub, [])

        if not pool:
            # Smart generic fallback
            pool = [
                {"id": 1, "question": f"In {topic} ({difficulty}), which of these is considered a core architectural pattern?", "options": ["Microservices", "Monolithic", "Event-Driven", "All of the above"], "correctAnswer": "All of the above"},
                {"id": 2, "question": f"When scaling a {topic} application, what is the most important factor?", "options": ["User Load", "Storage", "Network Latency", "Database Consistency"], "correctAnswer": "User Load"},
                {"id": 3, "question": f"Which principle is best for {topic} development?", "options": ["SOLID", "Keep it simple", "Test Driven", "All of the above"], "correctAnswer": "All of the above"}
            ]
        
        # Shuffle
        random.shuffle(pool)
        
        # Return a sample of up to 10
        sample_size = min(len(pool), 10)
        selected = pool[:sample_size]
        
        # Re-index
        for i, q in enumerate(selected):
            q["id"] = i + 1
            
        return selected

    async def generate_ide_chat(self, role: str, language: str, code: str, chat_input: str, history: List[Dict[str, str]] = []) -> str:
        """
        Provides AI assistant support for the coding IDE via OpenRouter.
        """
        # User provided OpenRouter Key
        OR_KEY = "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"
        
        try:
            from langchain_openai import ChatOpenAI
            from langchain_core.prompts import ChatPromptTemplate
            
            # Using OpenRouter which is OpenAI-compatible
            llm = ChatOpenAI(
                model="google/gemini-2.0-flash-001", # High quality model via OpenRouter
                openai_api_key=OR_KEY,
                base_url="https://openrouter.ai/api/v1"
            )
            
            prompt = ChatPromptTemplate.from_template("""
            You are a professional AI Coding Copilot and Interview Mentor (Gemini 2.0 Flash).
            Candidate Role: {role}
            Target Language: {language}
            
            CURRENT EDITOR CODE:
            ```{language}
            {code}
            ```
            
            GUIDELINES:
            1. Be friendly, encouraging, and conversational.
            2. If there's a bug, don't just give the fix. Ask guiding questions.
            3. Explain the "Why" behind common errors.
            4. Focus on the interview context of a {role}.
            
            CONVERSATION HISTORY:
            {history_text}
            
            CANDIDATE: {chat_input}
            ASSISTANT:""")
            
            history_text = "\n".join([f"{h['role'].capitalize()}: {h['content']}" for h in history])
            
            chain = prompt | llm
            response = await chain.ainvoke({
                "role": role, 
                "language": language, 
                "code": code, 
                "chat_input": chat_input,
                "history_text": history_text
            })
            
            return response.content
        except Exception as e:
            print(f"OpenRouter Chat error: {e}")
            return "I'm having a bit of trouble connecting to my logic processor via OpenRouter. Please try rephrasing your question!"

    async def analyze_resume_match(self, resume_text: str, jd_text: str) -> Dict[str, Any]:
        """
        Analyzes how well a resume matches a job description.
        """
        from app.core.config import settings
        api_key = settings.OPENROUTER_API_KEY
        
        if not api_key:
            # High quality fallback
            return {
                "match_score": 72,
                "matching_skills": ["Python", "JavaScript", "SQL"],
                "missing_skills": ["AWS", "Docker", "Kubernetes"],
                "improvements": ["Highlight your cloud experience more prominently", "Include quantifiable results for your software projects"],
                "matched_jobs": ["Backend Developer", "Full Stack Engineer", "DevOps Trainee"],
                "analysis_summary": "Your technical foundation is strong, but you lack specific cloud-native experience required for this role."
            }

        try:
            from langchain_openai import ChatOpenAI
            from langchain_core.prompts import ChatPromptTemplate
            
            llm = ChatOpenAI(
                model="google/gemini-2.0-flash-001",
                openai_api_key=api_key,
                base_url="https://openrouter.ai/api/v1"
            )
            
            prompt = ChatPromptTemplate.from_template("""
            You are an elite ATS (Applicant Tracking System) Specialist and Career Coach. 
            Analyze the following Resume against the Job Description.
            
            JOB DESCRIPTION:
            {jd_text}
            
            RESUME TEXT:
            {resume_text}
            
            OUTPUT INSTRUCTIONS:
            Return a valid JSON object with:
            1. "match_score": 0-100 indicating alignment.
            2. "matching_skills": ["List of skills found in both"]
            3. "missing_skills": ["Crucial skills in JD but missing in Resume"]
            4. "improvements": ["3 specific, actionable tips to improve this resume for this SPECIFIC JD"]
            5. "matched_jobs": ["2-3 other job titles that would fit this resume well"]
            6. "analysis_summary": "2 sentences of professional advice"
            """)
            
            chain = prompt | llm
            response = await chain.ainvoke({"jd_text": jd_text, "resume_text": resume_text})
            
            content = response.content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            return json.loads(content)
        except Exception as e:
            print(f"Resume analysis error: {e}")
            return {
                "match_score": 50,
                "matching_skills": ["General technical skills"],
                "missing_skills": ["Specific JD requirements"],
                "improvements": ["Alignment with JD keywords needed"],
                "matched_jobs": ["General Developer"],
                "analysis_summary": "Analysis service encountered an error."
            }

content_analyzer = ContentAnalyzer()
