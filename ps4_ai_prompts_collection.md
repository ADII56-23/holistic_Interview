# PS4: Holistic Interview Intelligence Platform
## AI Prompts Collection for Development

This document contains carefully crafted prompts to help you build each component of the platform using AI assistance (Claude, GPT-4, etc.)

---

## 📋 Table of Contents
1. [Frontend Development Prompts](#frontend-development-prompts)
2. [Backend API Prompts](#backend-api-prompts)
3. [Speech Analysis Prompts](#speech-analysis-prompts)
4. [Body Language Analysis Prompts](#body-language-analysis-prompts)
5. [Content Analysis Prompts](#content-analysis-prompts)
6. [Database Schema Prompts](#database-schema-prompts)
7. [Deployment & DevOps Prompts](#deployment-devops-prompts)
8. [Testing & Quality Assurance Prompts](#testing-qa-prompts)

---

## 1. Frontend Development Prompts

### Prompt 1.1: Initialize React Project with Video Recording
```
I'm building an AI-powered interview preparation platform called "Holistic Interview Intelligence". 

Create a React 18 + Vite project with the following requirements:

TECH STACK:
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS + shadcn/ui for styling
- Zustand for state management
- React Router v6 for navigation

CORE FEATURE NEEDED:
Build a video recording interface component that:
1. Requests camera and microphone permissions
2. Shows live camera preview
3. Has Start/Stop recording buttons
4. Records video in WebM format (VP9 codec)
5. Captures audio with echo cancellation and noise suppression
6. Displays recording duration timer
7. Saves the recorded blob for upload

ADDITIONAL REQUIREMENTS:
- Handle permission denied errors gracefully
- Show loading states
- Make it responsive (mobile + desktop)
- Use modern React patterns (hooks, functional components)
- Include proper TypeScript types

Please provide:
1. Complete project setup commands
2. Full InterviewRecorder component code
3. Necessary package.json dependencies
4. Tailwind config for the UI
5. Example usage in App.tsx

Make the code production-ready with error handling and best practices.
```

### Prompt 1.2: Build Feedback Dashboard UI
```
Create a comprehensive feedback dashboard component for an interview analysis platform.

CONTEXT:
After a user completes a mock interview, they receive analysis results in this JSON structure:
{
  "overall_score": 85,
  "verbal_score": 78,
  "non_verbal_score": 88,
  "content_score": 89,
  "breakdown": {
    "speech": {
      "pace_score": 92,
      "filler_rate": 8.5,
      "confidence_score": 85,
      "wpm": 142,
      "filler_words": {"um": 5, "like": 7, "uh": 3}
    },
    "body_language": {
      "eye_contact": {"score": 92, "percentage": 68},
      "posture": {"average_score": 88, "slouch_percentage": 12},
      "gestures": {"movement_score": 85}
    },
    "content": {
      "relevance_score": 90,
      "star_score": 75,
      "clarity_score": 92
    }
  },
  "strengths": ["Excellent eye contact", "Clear communication", "Good speaking pace"],
  "improvements": [
    {
      "area": "Filler words",
      "current_score": 91.5,
      "how_to_improve": "Practice recording yourself and count filler words"
    },
    {
      "area": "STAR method",
      "current_score": 75,
      "how_to_improve": "Add quantifiable results to your behavioral answers"
    }
  ],
  "action_items": [
    "Reduce use of 'um' and 'like'",
    "Add metrics to STAR answers",
    "Maintain good posture throughout"
  ]
}

BUILD:
A React + TypeScript dashboard component that:
1. Displays overall score prominently with visual appeal (use shadcn/ui Card)
2. Shows three category scores (Verbal, Non-verbal, Content) with progress circles
3. Creates expandable sections for detailed breakdown
4. Color-codes scores: 90-100 (green), 75-89 (blue), 60-74 (yellow), <60 (red)
5. Lists strengths with check icons
6. Shows improvements with specific tips
7. Displays action items as a checklist
8. Includes progress comparison if user has history
9. Has smooth animations and transitions

DESIGN REQUIREMENTS:
- Modern, clean UI using Tailwind
- Mobile-responsive
- Use recharts for any visualizations
- Accessible (proper ARIA labels)
- Dark mode compatible

Provide the complete component code with TypeScript types.
```

### Prompt 1.3: Question Bank Interface
```
Build a question bank interface for an interview prep platform.

REQUIREMENTS:

DATA STRUCTURE:
interface Question {
  id: string;
  text: string;
  category: 'technical' | 'behavioral' | 'hr' | 'situational';
  difficulty: 'easy' | 'medium' | 'hard';
  domain: string; // e.g., "software-engineering", "product-management"
  tags: string[];
  company?: string; // e.g., "Google", "Amazon"
  timeLimit: number; // in seconds
}

FEATURES NEEDED:
1. Display questions in a grid/list view
2. Filter by:
   - Category (dropdown)
   - Difficulty (pills/badges)
   - Domain (search/select)
   - Company (optional filter)
3. Search functionality for question text
4. Click a question to start practice session
5. Show "practiced" badge if user has attempted before
6. Sort by: Most popular, Difficulty, Recent

UI COMPONENTS:
- QuestionCard component showing question preview
- FilterBar with all filter controls
- SearchBar with debounced search
- QuestionModal for full question view before starting

TECH STACK:
- React + TypeScript
- shadcn/ui components
- Tailwind CSS
- React Query for data fetching (mock API for now)

Please provide:
1. Complete QuestionBank component
2. QuestionCard component
3. Filter logic implementation
4. Mock data (20 sample questions)
5. Responsive design for mobile

Make it visually appealing and user-friendly.
```

---

## 2. Backend API Prompts

### Prompt 2.1: FastAPI Project Setup
```
Set up a production-ready FastAPI backend for an interview analysis platform.

REQUIREMENTS:

PROJECT STRUCTURE:
app/
├── main.py
├── api/
│   ├── routes/
│   │   ├── interviews.py
│   │   ├── questions.py
│   │   └── users.py
│   └── dependencies.py
├── core/
│   ├── config.py
│   └── security.py
├── models/
│   └── database.py
├── schemas/
│   └── interview.py
├── services/
│   ├── speech_analysis.py
│   ├── body_language.py
│   └── content_analysis.py
└── tasks/
    └── celery_app.py

FEATURES NEEDED:
1. FastAPI app with CORS middleware
2. PostgreSQL database integration (SQLAlchemy)
3. JWT authentication
4. File upload endpoint for videos (multipart/form-data)
5. Celery task queue setup with Redis
6. Environment variable management
7. API documentation (auto-generated by FastAPI)

SPECIFIC ENDPOINTS:
POST /api/v1/interviews/start - Create new session
POST /api/v1/interviews/upload - Upload video
GET /api/v1/interviews/{session_id}/status - Check analysis status
GET /api/v1/interviews/{session_id}/results - Get results
GET /api/v1/questions - List questions with filters

DATABASE MODELS:
- User (id, email, password_hash, created_at)
- InterviewSession (id, user_id, question_id, video_url, status, created_at)
- AnalysisResult (id, session_id, overall_score, verbal_score, etc.)
- Question (id, text, category, difficulty, domain)

TECH REQUIREMENTS:
- Python 3.11+
- FastAPI
- SQLAlchemy 2.0
- Alembic for migrations
- Pydantic v2 for schemas
- Celery + Redis
- python-multipart for file uploads
- python-jose for JWT
- passlib for password hashing

Please provide:
1. Complete project setup
2. All configuration files (pyproject.toml, .env.example)
3. Database models
4. Pydantic schemas
5. Main router implementation
6. Celery configuration
7. Docker Compose file for local development (PostgreSQL + Redis)

Include error handling, logging, and best practices.
```

### Prompt 2.2: Video Upload and Processing Pipeline
```
Create a robust video upload and processing pipeline for the interview platform.

CONTEXT:
Users record videos (typically 1-3 minutes, ~50-150MB) that need to be:
1. Uploaded to server
2. Stored in cloud storage (S3 or similar)
3. Queued for background analysis
4. Processed by multiple analysis modules
5. Results saved to database

BUILD:

1. UPLOAD ENDPOINT (FastAPI):
   - Accept multipart/form-data video upload
   - Validate file type (video/webm, video/mp4)
   - Validate file size (max 200MB)
   - Generate unique filename
   - Upload to S3/MinIO
   - Create database record
   - Queue Celery task
   - Return job_id for status checking

2. CELERY TASK ORCHESTRATION:
   ```python
   @celery.task
   def process_interview_video(session_id: str, video_url: str):
       # Download video from S3
       # Extract audio for speech analysis
       # Run parallel tasks:
       #   - analyze_speech_task
       #   - analyze_body_language_task
       #   - analyze_content_task
       # Aggregate results
       # Save to database
       # Update session status
   ```

3. STATUS TRACKING:
   - Use Celery task states
   - Store progress in Redis
   - Endpoint to check: GET /api/v1/jobs/{job_id}/status
   - Return: {status: "pending|processing|completed|failed", progress: 0-100}

4. ERROR HANDLING:
   - Retry logic for failed tasks
   - Cleanup on failure
   - Proper error messages
   - Logging for debugging

TECH STACK:
- FastAPI for endpoints
- Boto3 for S3 uploads
- Celery for async processing
- Redis for task queue and caching
- FFmpeg for video/audio extraction

REQUIREMENTS:
- Handle large file uploads (chunked upload support)
- Progress tracking during upload
- Automatic cleanup of old videos (30 days)
- Rate limiting to prevent abuse
- Proper security (signed URLs, authentication)

Please provide:
1. Complete upload endpoint code
2. Celery task implementation
3. S3 utility functions
4. Status checking endpoint
5. Error handling middleware
6. Example environment variables
7. Docker setup if needed

Make it production-ready and scalable.
```

---

## 3. Speech Analysis Prompts

### Prompt 3.1: Implement Whisper Speech-to-Text
```
Build a speech-to-text transcription system using OpenAI Whisper for interview analysis.

CONTEXT:
I need to transcribe recorded interview answers (1-3 minute videos) to analyze:
- Exact words spoken
- Timestamp for each word
- Filler word detection
- Speaking pace calculation

REQUIREMENTS:

1. WHISPER INTEGRATION:
   - Use openai-whisper Python library
   - Model: "base" for speed (can upgrade to "medium" later)
   - Language: English
   - Include word-level timestamps

2. INPUT:
   - Audio file path (extracted from video using FFmpeg)
   - Typical duration: 1-3 minutes
   - Format: WAV or MP3

3. OUTPUT FORMAT:
   ```python
   {
       "full_text": "I worked on a project where...",
       "segments": [
           {
               "start": 0.0,
               "end": 5.2,
               "text": "I worked on a project"
           }
       ],
       "words": [
           {
               "word": "I",
               "start": 0.0,
               "end": 0.1
           },
           {
               "word": "worked",
               "start": 0.2,
               "end": 0.5
           }
       ],
       "language": "en",
       "duration": 120.5
   }
   ```

4. PERFORMANCE:
   - Process 2-minute audio in under 30 seconds
   - Use GPU if available
   - Cache model loading

5. ERROR HANDLING:
   - Handle audio quality issues
   - Manage unclear speech
   - Timeout for very long audio

IMPLEMENTATION NEEDED:
```python
# Create these functions:

def transcribe_audio(audio_path: str) -> dict:
    """
    Transcribe audio file using Whisper
    Returns dict with full text, segments, and word timestamps
    """
    pass

def extract_audio_from_video(video_path: str, output_path: str) -> str:
    """
    Extract audio track from video using FFmpeg
    Returns path to extracted audio file
    """
    pass

def preprocess_audio(audio_path: str) -> str:
    """
    Normalize audio levels, remove silence
    Returns path to preprocessed audio
    """
    pass
```

ADDITIONAL FEATURES:
- Progress callback for long transcriptions
- Support for multiple languages (future)
- Confidence scores for words
- Speaker diarization (if multiple speakers)

TECH STACK:
- openai-whisper
- ffmpeg-python
- torch (for GPU acceleration)
- numpy
- librosa (for audio preprocessing)

Please provide:
1. Complete transcription module
2. Audio extraction utility
3. Example usage
4. Requirements.txt
5. Error handling for edge cases
6. Performance optimization tips

Test with sample audio and show results.
```

### Prompt 3.2: Filler Word Detection and Analysis
```
Create a comprehensive filler word detection and analysis system.

CONTEXT:
After transcribing interview audio, I need to identify and analyze filler words that indicate nervousness or lack of confidence.

INPUT:
Whisper transcription output with word-level timestamps:
```python
{
    "words": [
        {"word": "I", "start": 0.0, "end": 0.1},
        {"word": "um", "start": 0.2, "end": 0.4},
        {"word": "worked", "start": 0.5, "end": 0.8},
        {"word": "like", "start": 1.0, "end": 1.2},
        # ... more words
    ],
    "full_text": "I um worked like on this project..."
}
```

FILLER WORDS TO DETECT:
- Single words: "um", "uh", "er", "ah", "hmm"
- Common phrases: "like", "you know", "I mean", "sort of", "kind of"
- Hesitation markers: "well", "so", "basically", "actually", "literally"
- Repetition: "the the", "I I", "and and"

ANALYSIS NEEDED:

1. DETECTION:
   ```python
   def detect_filler_words(transcript: dict) -> dict:
       """
       Returns:
       {
           "filler_count": {"um": 5, "like": 8, "you know": 3},
           "total_fillers": 16,
           "total_words": 250,
           "filler_rate": 6.4,  # percentage
           "timestamps": [
               {"word": "um", "start": 0.2, "end": 0.4},
               {"word": "like", "start": 1.0, "end": 1.2}
           ],
           "density_map": {  # fillers per 30-second window
               "0-30": 3,
               "30-60": 5,
               "60-90": 2
           }
       }
       """
   ```

2. SCORING SYSTEM:
   - Excellent: <2% filler rate
   - Good: 2-5%
   - Fair: 5-10%
   - Poor: >10%

3. PATTERN ANALYSIS:
   - Identify if fillers cluster at beginning (nervousness)
   - Check if rate decreases over time (warming up)
   - Detect specific trigger points (difficult questions)

4. VISUALIZATION DATA:
   - Timeline showing filler word positions
   - Heatmap of filler density
   - Most common fillers (top 5)

5. PERSONALIZED FEEDBACK:
   ```python
   def generate_filler_feedback(analysis: dict) -> str:
       """
       Examples:
       - "You used 'um' 8 times. Try pausing silently instead."
       - "Your filler rate was highest in the first 30 seconds, suggesting initial nervousness."
       - "Great job! Your filler rate of 1.2% is excellent."
       """
   ```

ADVANCED FEATURES:
- Distinguish between filler "like" and comparison "like"
- Detect false starts ("I was... I mean I am...")
- Track improvement over multiple sessions
- Compare with benchmark data

IMPLEMENTATION:
Provide:
1. Complete filler detection function
2. Scoring algorithm
3. Feedback generation logic
4. Visualization data preparation
5. Unit tests with sample data
6. Edge case handling

Make it robust enough to handle:
- Accents and speech variations
- Background noise artifacts
- Partial words from transcription errors
```

### Prompt 3.3: Speaking Pace and Rhythm Analysis
```
Build a speaking pace analyzer that evaluates speech rhythm and delivery speed.

GOAL:
Analyze how fast someone speaks during an interview and whether their pace is appropriate, consistent, and engaging.

INPUT DATA:
```python
# From Whisper transcription
{
    "words": [...],  # Word-level timestamps
    "segments": [...],  # Sentence-level segments
    "duration": 125.3  # Total audio duration in seconds
}
```

ANALYSIS COMPONENTS:

1. OVERALL PACE (WPM):
   ```python
   def calculate_wpm(transcript: dict) -> float:
       """
       Calculate words per minute
       
       Optimal ranges:
       - Conversational: 120-150 WPM
       - Presentations: 140-160 WPM
       - Fast (hard to follow): >180 WPM
       - Too slow (boring): <100 WPM
       
       Returns WPM with 1 decimal precision
       """
   ```

2. PACE VARIATION:
   ```python
   def analyze_pace_consistency(transcript: dict) -> dict:
       """
       Calculate WPM for 15-second windows throughout the answer
       
       Returns:
       {
           "segment_wpm": [145, 152, 138, 148, ...],
           "variance": 8.3,  # Lower is more consistent
           "consistency_score": 92,  # 0-100
           "pattern": "steady|accelerating|decelerating|erratic"
       }
       """
   ```

3. PAUSE ANALYSIS:
   ```python
   def analyze_pauses(transcript: dict) -> dict:
       """
       Detect and categorize pauses between words
       
       Pause categories:
       - Natural: 0.2-0.5s (breathing, phrasing)
       - Thinking: 0.5-1.5s (processing, recalling)
       - Awkward: >1.5s (struggling, uncertain)
       
       Returns:
       {
           "total_pauses": 23,
           "average_duration": 0.6,
           "pause_categories": {
               "natural": 15,
               "thinking": 6,
               "awkward": 2
           },
           "longest_pause": {
               "duration": 2.3,
               "timestamp": 45.2,
               "context": "when describing technical details"
           }
       }
       """
   ```

4. RHYTHM SCORING:
   ```python
   def score_speaking_rhythm(pace_data: dict) -> dict:
       """
       Combine all metrics into rhythm score
       
       Factors:
       - Optimal WPM range: 40 points
       - Consistency: 30 points
       - Appropriate pauses: 30 points
       
       Returns:
       {
           "overall_score": 85,
           "wpm_score": 95,
           "consistency_score": 78,
           "pause_score": 82,
           "strengths": ["Good average pace", "Natural pauses"],
           "improvements": ["Slight speed variation in middle section"]
       }
       """
   ```

5. ENGAGEMENT PREDICTION:
   ```python
   def predict_engagement(rhythm_data: dict) -> dict:
       """
       Predict how engaging the delivery is
       
       Factors that reduce engagement:
       - Too fast/slow
       - Monotonous (low variance)
       - Too many long pauses
       - Rushed (very few pauses)
       
       Returns engagement score and suggestions
       """
   ```

FEEDBACK GENERATION:
```python
def generate_pace_feedback(analysis: dict) -> list[str]:
    """
    Examples:
    - "Your pace of 142 WPM is excellent for conversational delivery."
    - "You spoke 23% faster in the last minute - try to maintain consistency."
    - "Long pauses at 1:23 and 2:15 suggest uncertainty. Practice those sections."
    - "Great natural rhythm with appropriate pauses for emphasis."
    """
```

VISUALIZATION DATA:
Prepare data for charts:
1. WPM over time (line chart)
2. Pause distribution (histogram)
3. Pace consistency (variance indicator)

EDGE CASES TO HANDLE:
- Very short answers (<30 seconds)
- Silent thinking before speaking
- Background noise causing gaps
- Transcription errors affecting word count

Please provide:
1. All analysis functions
2. Scoring algorithms with clear thresholds
3. Feedback generation logic
4. Example calculations with sample data
5. Visualization data structures
6. Unit tests

Make the analysis nuanced enough to give actionable feedback, not just numbers.
```

---

## 4. Body Language Analysis Prompts

### Prompt 4.1: Eye Contact Detection with MediaPipe
```
Build an eye contact tracking system using MediaPipe Face Mesh for interview analysis.

OBJECTIVE:
Detect when a candidate is making eye contact with the camera during a video interview and provide scoring based on optimal eye contact patterns.

CONTEXT:
Good eye contact in virtual interviews:
- 60-70% of the time looking at camera
- Natural breaks (don't stare continuously)
- Consistent throughout the interview
- Not looking down at notes constantly

TECHNICAL APPROACH:
Use MediaPipe Face Mesh to:
1. Detect face and facial landmarks
2. Track iris position relative to eye corners
3. Calculate gaze direction
4. Determine if looking at camera

IMPLEMENTATION NEEDED:

```python
import cv2
import mediapipe as mp
import numpy as np

def analyze_eye_contact(video_path: str) -> dict:
    """
    Analyze eye contact throughout the video
    
    Returns:
    {
        "eye_contact_percentage": 67.5,  # % of time looking at camera
        "total_frames_analyzed": 3600,
        "frames_with_contact": 2430,
        "contact_intervals": [
            {"start_time": 0.5, "end_time": 5.2, "duration": 4.7},
            {"start_time": 7.1, "end_time": 12.3, "duration": 5.2}
        ],
        "average_contact_duration": 4.95,  # seconds
        "average_break_duration": 2.1,
        "longest_contact": 8.3,
        "longest_break": 5.7,
        "score": 85,  # 0-100
        "pattern": "consistent|improving|declining|erratic",
        "feedback": [
            "Excellent eye contact at 67.5%",
            "Good consistency throughout"
        ]
    }
    """
    pass

def calculate_gaze_direction(face_landmarks) -> dict:
    """
    Determine gaze direction from face landmarks
    
    Use iris landmarks (468-473) and eye corner landmarks
    Calculate iris center position relative to eye corners
    
    Returns:
    {
        "looking_at_camera": bool,
        "horizontal_offset": float,  # -1.0 to 1.0 (left to right)
        "vertical_offset": float,    # -1.0 to 1.0 (up to down)
        "confidence": float          # 0.0 to 1.0
    }
    """
    pass

def score_eye_contact(percentage: float, consistency: float) -> dict:
    """
    Score based on percentage and consistency
    
    Scoring:
    - Percentage (60 points):
      * 60-70%: 60 points
      * 50-60% or 70-80%: 45 points
      * 40-50% or 80-90%: 30 points
      * <40% or >90%: 15 points
    
    - Consistency (40 points):
      * Low variance: 40 points
      * Medium variance: 25 points
      * High variance: 10 points
    
    Returns overall score and breakdown
    """
    pass
```

SPECIFIC REQUIREMENTS:

1. **Performance**:
   - Process 1920x1080 video at 10+ FPS
   - Skip every 2-3 frames to improve speed
   - Use GPU acceleration if available

2. **Accuracy**:
   - Handle different lighting conditions
   - Work with various face angles (±30 degrees)
   - Ignore brief glances at notes (< 2 seconds)

3. **Edge Cases**:
   - Face temporarily out of frame
   - Multiple faces in frame (use largest/closest)
   - Poor lighting or webcam quality
   - Glasses or eye occlusion

4. **Visualization**:
   Prepare data for visual timeline:
   ```python
   {
       "timeline": [
           {"time": 0, "looking": true},
           {"time": 5.2, "looking": false},
           # ... every second or transition
       ]
   }
   ```

5. **Feedback Generation**:
   ```python
   def generate_eye_contact_feedback(analysis: dict) -> list[str]:
       """
       Examples:
       - "Excellent! 68% eye contact is ideal for virtual interviews"
       - "Try looking at the camera more - currently 45%"
       - "You looked away for 8 seconds at 1:23 - avoid long breaks"
       - "Eye contact improved throughout the interview - great adaptation!"
       """
   ```

DELIVERABLES:
1. Complete implementation of all functions
2. MediaPipe initialization code
3. Frame processing loop with optimization
4. Scoring algorithm with clear thresholds
5. Example usage with sample video
6. Performance benchmarks
7. Error handling for edge cases

Include comments explaining the math behind gaze detection.
```

### Prompt 4.2: Posture Analysis System
```
Create a posture analysis system using MediaPipe Pose to evaluate body language during interviews.

GOAL:
Detect and score posture quality including:
- Slouching vs. upright sitting
- Shoulder alignment
- Forward head posture
- Leaning to one side
- Overall stability

GOOD POSTURE INDICATORS:
- Shoulders level and back
- Head aligned with spine (not forward)
- Upright torso (not slouched)
- Stable position (minimal swaying)

IMPLEMENTATION:

```python
import cv2
import mediapipe as mp
import numpy as np

def analyze_posture(video_path: str) -> dict:
    """
    Analyze posture throughout the video
    
    Returns:
    {
        "overall_score": 82,  # 0-100
        "frame_scores": [85, 83, 80, ...],  # Score per analyzed frame
        "metrics": {
            "shoulder_alignment": {
                "average_angle": 3.2,  # degrees from horizontal
                "variance": 1.8,
                "score": 90
            },
            "head_position": {
                "average_forward_lean": 0.05,  # normalized 0-1
                "score": 85
            },
            "slouch_detection": {
                "percentage_slouching": 15.3,  # % of time
                "slouch_events": [
                    {"time": 45.2, "duration": 8.3},
                    {"time": 89.1, "duration": 3.5}
                ],
                "score": 78
            },
            "stability": {
                "sway_amount": 0.12,  # normalized
                "score": 88
            }
        },
        "timeline": [  # For visualization
            {"time": 0, "posture_score": 85},
            {"time": 10, "posture_score": 82},
            # ...
        ],
        "feedback": [
            "Good upright posture overall",
            "Slight slouching detected at 0:45 and 1:29",
            "Try to keep shoulders level - slight right tilt noticed"
        ]
    }
    """
    pass

def calculate_shoulder_angle(left_shoulder, right_shoulder) -> float:
    """
    Calculate angle of line between shoulders from horizontal
    
    Perfect alignment: 0 degrees
    Acceptable: <10 degrees
    Noticeable: 10-20 degrees
    Poor: >20 degrees
    
    Returns angle in degrees
    """
    dx = right_shoulder.x - left_shoulder.x
    dy = right_shoulder.y - left_shoulder.y
    angle = np.degrees(np.arctan2(dy, dx))
    return abs(angle)

def detect_forward_head(nose, left_shoulder, right_shoulder, left_ear) -> float:
    """
    Detect forward head posture (text neck)
    
    Method:
    1. Calculate shoulder center point
    2. Measure horizontal distance from nose to shoulder center
    3. Normalize by shoulder width
    
    Returns:
    - <0.05: Good alignment
    - 0.05-0.15: Slight forward
    - >0.15: Significant forward head
    """
    pass

def detect_slouching(shoulders, hips, confidence_threshold=0.5) -> dict:
    """
    Detect slouching by analyzing torso angle
    
    Method:
    1. Calculate midpoint between shoulders
    2. Calculate midpoint between hips (if visible)
    3. Measure angle of torso line from vertical
    
    Returns:
    {
        "is_slouching": bool,
        "slouch_angle": float,  # degrees from vertical
        "confidence": float
    }
    """
    pass

def calculate_body_stability(landmark_positions_over_time) -> dict:
    """
    Measure how much the body sways/moves
    
    Excessive movement suggests nervousness or poor posture control
    
    Track shoulder center position variance over time
    
    Returns:
    {
        "horizontal_sway": float,
        "vertical_movement": float,
        "stability_score": int  # 0-100
    }
    """
    pass

def score_posture(metrics: dict) -> int:
    """
    Aggregate posture scoring
    
    Weights:
    - Shoulder alignment: 25%
    - Head position: 25%
    - Slouching: 30%
    - Stability: 20%
    
    Returns overall score 0-100
    """
    pass
```

SPECIFIC ANALYSIS:

1. **Shoulder Alignment**:
   - Track both shoulders throughout video
   - Calculate tilt angle from horizontal
   - Detect if one shoulder consistently higher

2. **Forward Head Posture**:
   - Compare nose position to shoulder line
   - Common issue with laptop cameras below eye level
   - Suggest camera height adjustment if detected

3. **Slouching Detection**:
   - Compare upper body angle to ideal vertical
   - Track changes over time
   - Identify when slouching begins

4. **Side Leaning**:
   - Detect if center of mass shifts left/right
   - Could indicate informal or unprofessional posture

FEEDBACK EXAMPLES:
```python
def generate_posture_feedback(analysis: dict) -> list[str]:
    """
    - "Excellent posture! Maintained upright position 94% of the time"
    - "Your left shoulder appears 8° higher - check your chair height"
    - "Forward head posture detected - try raising your camera to eye level"
    - "Noticeable slouching starting at 1:15 - try to reset posture"
    - "Great stability with minimal swaying - shows confidence"
    """
```

EDGE CASES:
- Sitting vs. standing (different metrics)
- Only upper body visible (no hips in frame)
- Tight camera framing
- Person moving in/out of frame
- Occlusion (arm crossing blocking torso)

DELIVERABLES:
1. Complete posture analysis pipeline
2. All metric calculation functions
3. Scoring system with clear thresholds
4. Feedback generation
5. Timeline data for visualization
6. Testing with sample videos
7. Performance optimization notes

Make sure to handle low-confidence pose detections gracefully.
```

### Prompt 4.3: Hand Gesture Analysis
```
Build a hand gesture tracking and analysis system for interview body language assessment.

OBJECTIVE:
Analyze hand movements and gestures to evaluate:
- Gesture frequency (appropriate vs. excessive vs. insufficient)
- Gesture types (open palm, pointing, fidgeting)
- Hand visibility (hiding hands suggests nervousness)
- Gesture-speech synchronization
- Nervous habits (touching face, wringing hands)

BACKGROUND:
Effective hand gestures in interviews:
- Natural and purposeful
- Match what's being said
- Open palm shows honesty
- Not too frequent (distracting) or absent (stiff)
- Visible but not dominating the frame

IMPLEMENTATION:

```python
import cv2
import mediapipe as mp
import numpy as np

def analyze_hand_gestures(video_path: str) -> dict:
    """
    Complete hand gesture analysis
    
    Returns:
    {
        "hand_visibility": {
            "percentage_visible": 78.5,
            "both_hands_visible": 45.2,
            "one_hand_visible": 33.3,
            "no_hands_visible": 21.5,
            "score": 85
        },
        "gesture_types": {
            "open_palm": 35,  # percentage of gestures
            "pointing": 15,
            "fist_closed": 8,
            "steepling": 12,
            "touching_face": 5,  # nervous habit
            "hand_wringing": 2,  # nervous habit
            "descriptive": 23    # illustrative gestures
        },
        "movement_analysis": {
            "average_movement_speed": 0.25,  # normalized
            "gesture_frequency": 12,  # gestures per minute
            "movement_pattern": "calm|moderate|excessive|fidgety",
            "score": 80
        },
        "nervous_habits": {
            "detected": ["touching_face", "hair_touching"],
            "frequency": {
                "touching_face": 3,
                "hair_touching": 2
            },
            "timestamps": [
                {"habit": "touching_face", "time": 23.4},
                {"habit": "touching_face", "time": 67.8}
            ]
        },
        "overall_score": 82,
        "feedback": [
            "Good hand visibility at 78.5%",
            "Natural gesture frequency",
            "Avoid touching face - noticed 3 times"
        ]
    }
    """
    pass

def classify_hand_gesture(hand_landmarks) -> str:
    """
    Classify gesture type from hand landmarks
    
    Gestures to detect:
    - Open palm: All fingers extended
    - Pointing: Index finger extended, others closed
    - Fist: All fingers closed
    - Steepling: Fingertips together (confidence gesture)
    - Counting: Specific fingers extended
    - Nervous fidgeting: Rapid small movements
    
    Returns gesture type as string
    """
    # Count extended fingers
    fingers_extended = count_extended_fingers(hand_landmarks)
    
    # Analyze hand shape
    # Detect specific poses
    pass

def count_extended_fingers(hand_landmarks) -> list[bool]:
    """
    Determine which fingers are extended
    
    Returns list of 5 booleans [thumb, index, middle, ring, pinky]
    """
    pass

def detect_nervous_habits(hand_history, face_landmarks) -> dict:
    """
    Detect nervous habits like:
    - Touching face
    - Playing with hair
    - Wringing hands
    - Tapping/fidgeting
    
    Method:
    - Track hand positions over time
    - Detect proximity to face
    - Identify repetitive movements
    - Classify movement patterns
    
    Returns detected habits with timestamps
    """
    pass

def analyze_movement_patterns(hand_positions_over_time) -> dict:
    """
    Analyze hand movement characteristics
    
    Metrics:
    - Movement speed (average pixels per frame)
    - Movement smoothness (acceleration variance)
    - Rest periods (hands still)
    - Gesture frequency (distinct movements per minute)
    
    Patterns:
    - Calm: Slow, deliberate movements, frequent rest
    - Moderate: Natural gesture frequency, smooth motion
    - Excessive: High frequency, large movements
    - Fidgety: Rapid small movements, no rest
    
    Returns pattern classification and metrics
    """
    pass

def calculate_gesture_quality_score(gesture_data: dict) -> dict:
    """
    Score hand gesture quality
    
    Factors:
    - Visibility (30%): 60-80% visible is ideal
    - Frequency (25%): 8-15 gestures/min is natural
    - Variety (20%): Mix of gesture types
    - No nervous habits (15%): Deduct for face touching, etc.
    - Movement quality (10%): Smooth, purposeful
    
    Returns:
    {
        "overall_score": 85,
        "component_scores": {
            "visibility": 90,
            "frequency": 82,
            "variety": 85,
            "habit_penalty": -5,
            "movement_quality": 88
        }
    }
    """
    pass
```

ADVANCED FEATURES:

1. **Gesture-Speech Synchronization**:
   ```python
   def analyze_gesture_speech_sync(gesture_times, speech_segments):
       """
       Check if gestures align with emphasis in speech
       Good speakers gesture during important points
       """
       pass
   ```

2. **Cultural Awareness**:
   - Some gestures have different meanings in different cultures
   - Pointing may be considered rude in some contexts
   - Steepling shows confidence in Western cultures

3. **Context-Specific Scoring**:
   - Technical interviews: Hand gestures less critical
   - Leadership roles: More gestures expected
   - Remote vs. in-person: Different norms

FEEDBACK GENERATION:
```python
def generate_gesture_feedback(analysis: dict) -> list[str]:
    """
    Examples:
    - "Hands visible 85% of time - excellent!"
    - "Try using more open palm gestures to convey openness"
    - "Noticed face touching at 0:23 and 1:45 - shows nervousness"
    - "Gesture frequency of 14/min is natural and engaging"
    - "Good variety in gestures - very expressive"
    - "Hands hidden for first 30 seconds - place them in frame"
    """
```

EDGE CASES:
- Hands out of frame (cropped video)
- Crossing arms (intentional vs. nervous)
- Holding objects (coffee cup, pen)
- Cultural variations in gestures
- Hand size/shape variations

DELIVERABLES:
1. Complete gesture analysis pipeline
2. Gesture classification with confidence scores
3. Nervous habit detection
4. Movement pattern analysis
5. Scoring system
6. Feedback generation
7. Example usage and test cases
8. Performance optimization (process every N frames)

Focus on actionable insights, not just raw data.
```

---

## 5. Content Analysis Prompts

### Prompt 5.1: LLM-Based Answer Relevance Checker
```
Create an AI-powered system to evaluate if interview answers actually address the questions asked.

CONTEXT:
Students often:
- Go off-topic or ramble
- Provide generic answers that could apply to any question
- Miss key elements the question is asking for
- Provide examples that don't relate to the question

GOAL:
Use Claude API (or GPT-4) to analyze answer quality and relevance.

IMPLEMENTATION:

```python
import anthropic
import json
from typing import Dict, List

def analyze_answer_relevance(
    question: str,
    answer_transcript: str,
    question_category: str = None,
    expected_elements: List[str] = None
) -> dict:
    """
    Analyze if answer addresses the question properly
    
    Args:
        question: The interview question asked
        answer_transcript: What the candidate said (from speech-to-text)
        question_category: "behavioral", "technical", "situational", etc.
        expected_elements: Optional list of things answer should include
    
    Returns:
    {
        "relevance_score": 85,  # 0-100
        "addresses_question": true,
        "stays_on_topic": true,
        "provides_specifics": true,
        "includes_examples": true,
        "answer_quality": "excellent|good|fair|poor",
        "key_points_covered": [
            "Described the situation clearly",
            "Explained their specific role",
            "Shared measurable results"
        ],
        "missing_elements": [
            "Could add more detail about the outcome",
            "Team collaboration not mentioned"
        ],
        "strengths": [
            "Concrete example provided",
            "Quantified the impact (20% improvement)"
        ],
        "improvements": [
            "Answer could be more concise",
            "Add more details about challenges faced"
        ],
        "word_count": 187,
        "estimated_time": "~90 seconds",
        "feedback": "Your answer addressed the question well with a specific example. Consider being more concise and adding details about team collaboration."
    }
    """
    
    # Construct prompt for Claude
    client = anthropic.Anthropic(api_key="your-api-key")
    
    prompt = f"""You are an expert interview coach analyzing a candidate's answer.

Question Asked: {question}
Question Category: {question_category or "general"}
{f"Expected Elements: {', '.join(expected_elements)}" if expected_elements else ""}

Candidate's Answer: {answer_transcript}

Analyze this answer on the following criteria:
1. Does it directly address the question? (not just related tangentially)
2. Does it stay on topic throughout?
3. Are specific examples/details provided?
4. Is the answer structured and coherent?
5. Are there concrete facts, metrics, or outcomes?

Provide a detailed analysis in this EXACT JSON format:
{{
    "relevance_score": <0-100>,
    "addresses_question": <true/false>,
    "stays_on_topic": <true/false>,
    "provides_specifics": <true/false>,
    "includes_examples": <true/false>,
    "answer_quality": "<excellent|good|fair|poor>",
    "key_points_covered": [<list of what was covered well>],
    "missing_elements": [<list of what should be added>],
    "strengths": [<list of 2-3 specific strengths>],
    "improvements": [<list of 2-3 specific actionable improvements>],
    "feedback": "<2-3 sentence summary with specific advice>"
}}

Be specific and actionable in your feedback. Reference actual parts of the answer.
"""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}]
    )
    
    # Parse JSON response
    analysis = json.loads(response.content[0].text)
    
    # Add calculated fields
    analysis["word_count"] = len(answer_transcript.split())
    analysis["estimated_time"] = f"~{analysis['word_count'] // 2} seconds"
    
    return analysis
```

ADVANCED FEATURES:

1. **Context-Aware Analysis**:
   ```python
   def analyze_with_context(question, answer, resume_highlights, job_description):
       """
       Factor in candidate's background and job requirements
       """
       prompt = f"""
       Candidate Background: {resume_highlights}
       Target Role: {job_description}
       Question: {question}
       Answer: {answer}
       
       Evaluate if the answer:
       1. Showcases relevant skills from their background
       2. Aligns with the job requirements
       3. Demonstrates fit for the role
       """
   ```

2. **Benchmark Comparison**:
   ```python
   def compare_to_ideal_answer(question, candidate_answer, ideal_answer_example):
       """
       Show gap between candidate answer and high-quality example
       """
   ```

3. **Progressive Feedback**:
   ```python
   def generate_follow_up_questions(question, answer, missing_elements):
       """
       If answer incomplete, suggest follow-up questions interviewer might ask
       """
   ```

SCORING RUBRIC:
- **90-100**: Excellent - Directly answers, specific examples, well-structured
- **75-89**: Good - Addresses question, some specifics, mostly coherent
- **60-74**: Fair - Somewhat relevant, lacks specifics or structure
- **Below 60**: Poor - Off-topic, vague, or doesn't answer question

DELIVERABLES:
1. Complete relevance analysis function
2. Prompt engineering best practices
3. Response parsing with error handling
4. Example usage with sample Q&A pairs
5. Cost estimation (Claude API pricing)
6. Caching strategy to reduce API calls
7. Fallback for API failures

Test with various question types:
- Behavioral: "Tell me about a time when..."
- Technical: "How would you design..."
- Situational: "What would you do if..."
- HR: "Why do you want this role?"
```

### Prompt 5.2: STAR Method Detector
```
Build a system that detects if behavioral interview answers follow the STAR method (Situation, Task, Action, Result).

BACKGROUND:
STAR method is the gold standard for behavioral questions:
- **S**ituation: Context, background, what was happening
- **T**ask: Your responsibility, what you needed to do
- **A**ction: Specific steps you took
- **R**esult: Outcome, impact, what you learned

Many candidates miss one or more elements, especially Results.

IMPLEMENTATION:

```python
import anthropic
import json

def detect_star_method(
    question: str,
    answer_transcript: str
) -> dict:
    """
    Analyze if answer follows STAR structure
    
    Returns:
    {
        "has_situation": true,
        "has_task": true,
        "has_action": true,
        "has_result": false,
        "star_completeness": 75,  # percentage (3/4 = 75%)
        "star_score": 68,  # quality score 0-100
        "extracted_sections": {
            "situation": "In my previous role at XYZ company, we faced declining user engagement...",
            "task": "I was responsible for improving the onboarding flow...",
            "action": "I conducted user research, redesigned the UI, and A/B tested...",
            "result": null  # Missing!
        },
        "quality_assessment": {
            "situation_quality": "good",  # clear|good|vague|missing
            "task_quality": "good",
            "action_quality": "excellent",
            "result_quality": "missing"
        },
        "strengths": [
            "Very detailed actions - specific steps listed",
            "Clear situation context provided"
        ],
        "improvements": [
            "Add quantifiable results (metrics, percentages)",
            "Mention what you learned or would do differently"
        ],
        "suggested_addition": "For the Result, add something like: 'This led to a 30% increase in user retention and reduced drop-off by 15%. I learned the importance of user research in design decisions.'",
        "feedback": "Good STAR structure but missing the Result - the most important part! Add specific metrics about the outcome of your actions."
    }
    """
    
    client = anthropic.Anthropic(api_key="your-api-key")
    
    prompt = f"""You are an expert interview coach analyzing behavioral interview answers.

Question: {question}
Candidate's Answer: {answer_transcript}

Analyze if this answer follows the STAR method:

1. **Situation**: Is there clear context/background? (what was happening, where, when)
2. **Task**: Is their specific responsibility explained? (what they needed to accomplish)
3. **Action**: Are specific actions detailed? (what they actually did, step by step)
4. **Result**: Are concrete outcomes shared? (metrics, impact, learnings)

For each component, extract the relevant text and rate quality as:
- "excellent": Very detailed, specific, clear
- "good": Present with reasonable detail
- "vague": Mentioned but unclear or generic
- "missing": Not included

Return this EXACT JSON format:
{{
    "has_situation": <true/false>,
    "has_task": <true/false>,
    "has_action": <true/false>,
    "has_result": <true/false>,
    "star_completeness": <0-100>,
    "star_score": <0-100>,
    "extracted_sections": {{
        "situation": "<extracted text or null>",
        "task": "<extracted text or null>",
        "action": "<extracted text or null>",
        "result": "<extracted text or null>"
    }},
    "quality_assessment": {{
        "situation_quality": "<excellent|good|vague|missing>",
        "task_quality": "<excellent|good|vague|missing>",
        "action_quality": "<excellent|good|vague|missing>",
        "result_quality": "<excellent|good|vague|missing>"
    }},
    "strengths": [<2-3 specific things done well>],
    "improvements": [<2-3 specific actionable improvements>],
    "suggested_addition": "<specific text to add for missing/weak sections>",
    "feedback": "<2-3 sentences with clear, actionable advice>"
}}

Be specific. If Result is missing, suggest actual metrics they could add.
"""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )
    
    analysis = json.loads(response.content[0].text)
    return analysis

def score_star_quality(star_analysis: dict) -> int:
    """
    Calculate overall STAR score based on presence AND quality
    
    Scoring:
    - Each component: 25 points maximum
    - Excellent: 25 points
    - Good: 18 points
    - Vague: 10 points
    - Missing: 0 points
    
    Special weight on Result (most important)
    """
    quality_scores = {
        "excellent": 25,
        "good": 18,
        "vague": 10,
        "missing": 0
    }
    
    scores = {
        "situation": quality_scores[star_analysis["quality_assessment"]["situation_quality"]],
        "task": quality_scores[star_analysis["quality_assessment"]["task_quality"]],
        "action": quality_scores[star_analysis["quality_assessment"]["action_quality"]],
        "result": quality_scores[star_analysis["quality_assessment"]["result_quality"]]
    }
    
    # Weight Result more heavily (30%)
    total_score = (
        scores["situation"] * 0.2 +
        scores["task"] * 0.2 +
        scores["action"] * 0.3 +
        scores["result"] * 0.3
    ) * 4  # Scale to 100
    
    return round(total_score)

def generate_star_coaching(star_analysis: dict) -> str:
    """
    Generate detailed coaching on how to improve STAR structure
    """
    missing = []
    weak = []
    
    for component, quality in star_analysis["quality_assessment"].items():
        component_name = component.replace("_quality", "").upper()
        if quality == "missing":
            missing.append(component_name)
        elif quality == "vague":
            weak.append(component_name)
    
    coaching = []
    
    if missing:
        coaching.append(f"❌ Missing: {', '.join(missing)}")
        coaching.append("These are critical components. Every STAR answer needs all four.")
    
    if weak:
        coaching.append(f"⚠️ Weak: {', '.join(weak)}")
        coaching.append("Add more specific details to strengthen these sections.")
    
    # Always emphasize Results
    if star_analysis["quality_assessment"]["result_quality"] != "excellent":
        coaching.append("")
        coaching.append("💡 PRO TIP: Results are the most important part!")
        coaching.append("Include:")
        coaching.append("  • Quantifiable metrics (%, $, time saved)")
        coaching.append("  • Impact on team/company/users")
        coaching.append("  • What you learned")
        coaching.append("  • How you'd apply it in future")
    
    return "

".join(coaching)
```

EXAMPLES FOR TESTING:

```python
# Good STAR answer
question = "Tell me about a time you improved a process"
answer = """
In my previous role as a data analyst, our reporting process was taking 3 hours daily (Situation).
I was responsible for streamlining this to free up time for more strategic work (Task).
I automated the data pipeline using Python scripts and set up scheduled reports in Tableau (Action).
This reduced reporting time to 15 minutes, saving 2.75 hours daily. Over a year, that's 600+ hours freed up for higher-value analysis. I learned the importance of automation and now proactively look for repetitive tasks to optimize (Result).
"""

# Incomplete STAR (missing Result)
answer_incomplete = """
At my internship, the team struggled with meeting deadlines (Situation).
I needed to help improve project management (Task).
I introduced Asana and created task templates for recurring projects (Action).
"""

# Test both
analysis1 = detect_star_method(question, answer)
analysis2 = detect_star_method(question, answer_incomplete)
```

DELIVERABLES:
1. STAR detection function
2. Quality scoring algorithm
3. Coaching generation
4. Test suite with examples
5. Prompt optimization
6. Edge case handling (very short/long answers)
```

---

*[Continue to next sections?]*

Would you like me to continue with:
- Database Schema Prompts
- Deployment & DevOps Prompts
- Testing & Quality Assurance Prompts
- Or focus on a specific section in more detail?

Let me know which areas you'd like expanded!
