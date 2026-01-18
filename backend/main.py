import os
import uuid
import base64
import io
import re
import time
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
from groq import Groq
from dotenv import load_dotenv
import shutil

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Secure API key loading
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in environment variables!")

client = Groq(api_key=GROQ_API_KEY)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active interview sessions (in production, use Redis/Database)
interview_sessions = {}

# Company interview styles
COMPANY_STYLES = {
    "google": {
        "name": "Google",
        "style": """You interview like a Google engineer: Focus on algorithmic thinking, 
ask about time/space complexity, encourage thinking out loud, use "What if..." follow-ups.
Be friendly but rigorous. Ask about edge cases."""
    },
    "amazon": {
        "name": "Amazon",
        "style": """You interview like an Amazon engineer: Focus on Leadership Principles,
ask behavioral questions using STAR method, probe for customer obsession, ownership, and bias for action.
Ask "Tell me about a time when..." questions. Dig deep into specifics."""
    },
    "meta": {
        "name": "Meta",
        "style": """You interview like a Meta engineer: Focus on coding efficiency,
system design at scale, move fast mentality. Ask about trade-offs and real-world impact.
Be direct and focus on practical problem-solving."""
    },
    "microsoft": {
        "name": "Microsoft",
        "style": """You interview like a Microsoft engineer: Focus on problem-solving approach,
collaboration skills, growth mindset. Ask about how they'd work with teams.
Be supportive but thorough in technical assessment."""
    },
    "startup": {
        "name": "Startup",
        "style": """You interview like a startup CTO: Focus on versatility, 
ability to wear multiple hats, shipping quickly, and learning on the fly.
Ask about side projects and initiative. Be casual but assess deeply."""
    },
    "default": {
        "name": "Standard",
        "style": """You are a professional technical interviewer. Be fair, encouraging, 
and thorough in your assessment."""
    }
}

# Difficulty configurations
DIFFICULTY_CONFIGS = {
    "easy": {
        "description": "Entry-level questions, more hints provided",
        "prompt_modifier": """Ask entry-level questions suitable for junior developers or students.
Provide helpful hints when the candidate struggles. Be very encouraging.
Focus on fundamentals and basic concepts."""
    },
    "medium": {
        "description": "Standard interview difficulty",
        "prompt_modifier": """Ask standard interview questions suitable for mid-level developers.
Provide occasional hints if needed. Balance challenge with encouragement.
Include some follow-up questions to probe deeper."""
    },
    "hard": {
        "description": "Senior-level challenging questions",
        "prompt_modifier": """Ask challenging questions suitable for senior developers.
Expect thorough, detailed answers. Probe edge cases and trade-offs extensively.
Ask complex follow-ups and challenge assumptions. Be rigorous."""
    }
}

# Interview topic configurations
INTERVIEW_TOPICS = {
    "dsa": {
        "name": "Data Structures & Algorithms",
        "system_prompt": """You are a senior software engineer conducting a DSA interview. 
Ask questions about arrays, linked lists, trees, graphs, sorting, searching, dynamic programming.
Start with easier concepts and gradually increase difficulty based on candidate's responses.
Keep responses concise (under 50 words). Provide hints if the candidate is stuck."""
    },
    "system_design": {
        "name": "System Design",
        "system_prompt": """You are a principal engineer conducting a system design interview.
Ask about scalability, databases, caching, load balancing, microservices, API design.
Start with high-level architecture then drill down into specifics.
Keep responses concise (under 50 words). Guide the candidate through the design process."""
    },
    "behavioral": {
        "name": "Behavioral Interview",
        "system_prompt": """You are an HR manager conducting a behavioral interview using the STAR method.
Ask about leadership, teamwork, conflict resolution, challenges overcome, and career goals.
Listen for specific examples and follow up with clarifying questions.
Keep responses concise (under 50 words). Be empathetic and encouraging."""
    },
    "frontend": {
        "name": "Frontend Development",
        "system_prompt": """You are a senior frontend developer conducting a technical interview.
Ask about HTML, CSS, JavaScript, React, state management, performance optimization, accessibility.
Include practical scenario-based questions.
Keep responses concise (under 50 words). Correct misconceptions gently."""
    },
    "backend": {
        "name": "Backend Development",
        "system_prompt": """You are a senior backend developer conducting a technical interview.
Ask about APIs, databases, authentication, server architecture, security, and testing.
Include real-world problem-solving scenarios.
Keep responses concise (under 50 words). Probe deeper on interesting answers."""
    },
    "general": {
        "name": "General Technical",
        "system_prompt": """You are a professional technical interviewer. 
The user is a candidate. Keep your responses short (under 30 words). 
Correct them if they are wrong, or ask a follow-up question.
Be encouraging but honest about areas for improvement."""
    }
}

class InterviewSession(BaseModel):
    topic: str = "general"
    difficulty: str = "medium"  # easy, medium, hard
    company_style: str = "default"  # google, amazon, meta, microsoft, startup, default
    enable_tts: bool = True  # Enable text-to-speech
    job_description: Optional[str] = None  # Job description for tailored questions
    resume_text: Optional[str] = None  # Parsed resume text
    duration_minutes: int = 30  # Interview duration in minutes

class Message(BaseModel):
    role: str
    content: str

class TextToSpeechRequest(BaseModel):
    text: str

class ResumeParseRequest(BaseModel):
    text: str

@app.get("/")
def health_check():
    return {"status": "active", "message": "Backend is running"}

@app.get("/topics")
def get_topics():
    """Return available interview topics"""
    return {
        "topics": [
            {"id": key, "name": value["name"]} 
            for key, value in INTERVIEW_TOPICS.items()
        ]
    }

@app.get("/companies")
def get_companies():
    """Return available company interview styles"""
    return {
        "companies": [
            {"id": key, "name": value["name"]} 
            for key, value in COMPANY_STYLES.items()
        ]
    }

@app.get("/difficulties")
def get_difficulties():
    """Return available difficulty levels"""
    return {
        "difficulties": [
            {"id": key, "name": key.capitalize(), "description": value["description"]} 
            for key, value in DIFFICULTY_CONFIGS.items()
        ]
    }

@app.post("/tts")
async def text_to_speech(request: TextToSpeechRequest):
    """Convert text to speech using Groq's TTS"""
    try:
        # Use Groq's text-to-speech
        response = client.audio.speech.create(
            model="playht-tts",
            voice="Fritz-PlayHT",  # Professional male voice
            input=request.text,
            response_format="wav"
        )
        
        # Return audio as streaming response
        audio_bytes = response.read()
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/wav",
            headers={"Content-Disposition": "inline; filename=speech.wav"}
        )
    except Exception as e:
        print(f"TTS Error: {e}")
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")

@app.post("/resume/parse")
async def parse_resume(file: UploadFile = File(...)):
    """Parse resume file and extract key information using AI"""
    try:
        # Read file content
        content = await file.read()
        
        # For text files, decode directly
        if file.filename.endswith('.txt'):
            resume_text = content.decode('utf-8')
        else:
            # For PDF/DOC, we'll use a simple text extraction
            # In production, use proper PDF parsing library
            try:
                resume_text = content.decode('utf-8', errors='ignore')
            except:
                resume_text = str(content)
        
        # Use AI to extract key information from resume
        extraction_prompt = f"""Analyze this resume and extract key information in a structured format:

RESUME TEXT:
{resume_text[:4000]}  # Limit to 4000 chars

Extract and return in this exact format:
NAME: [candidate name]
EXPERIENCE_YEARS: [total years of experience]
CURRENT_ROLE: [current or most recent job title]
SKILLS: [comma-separated list of top 10 technical skills]
EDUCATION: [highest degree and field]
KEY_PROJECTS: [2-3 notable projects, brief description]
STRENGTHS: [3 key strengths based on resume]
AREAS_TO_PROBE: [3 areas an interviewer should ask about]

Be concise and factual."""

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": extraction_prompt}],
            temperature=0.3,
            max_tokens=500
        )
        
        parsed_info = completion.choices[0].message.content
        
        return {
            "success": True,
            "raw_text": resume_text[:2000],  # Return truncated raw text
            "parsed_info": parsed_info,
            "filename": file.filename
        }
        
    except Exception as e:
        print(f"Resume Parse Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")

@app.post("/job/analyze")
async def analyze_job_description(job_description: str = Form(...)):
    """Analyze job description and extract key requirements"""
    try:
        analysis_prompt = f"""Analyze this job description and extract key information:

JOB DESCRIPTION:
{job_description[:3000]}

Extract and return:
1. ROLE: Job title and level
2. KEY_REQUIREMENTS: Top 5 must-have skills/qualifications
3. NICE_TO_HAVE: Optional skills mentioned
4. INTERVIEW_FOCUS: What topics an interviewer should focus on
5. SUGGESTED_QUESTIONS: 3 specific questions to ask based on this JD

Be concise and actionable."""

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": analysis_prompt}],
            temperature=0.3,
            max_tokens=400
        )
        
        analysis = completion.choices[0].message.content
        
        return {
            "success": True,
            "analysis": analysis
        }
        
    except Exception as e:
        print(f"Job Analysis Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze job description: {str(e)}")

@app.post("/interview/start")
def start_interview(session: InterviewSession):
    """Start a new interview session"""
    session_id = str(uuid.uuid4())
    start_time = time.time()
    
    topic_config = INTERVIEW_TOPICS.get(session.topic, INTERVIEW_TOPICS["general"])
    company_config = COMPANY_STYLES.get(session.company_style, COMPANY_STYLES["default"])
    difficulty_config = DIFFICULTY_CONFIGS.get(session.difficulty, DIFFICULTY_CONFIGS["medium"])
    
    # Build comprehensive system prompt
    full_system_prompt = f"""{topic_config["system_prompt"]}

{company_config["style"]}

{difficulty_config["prompt_modifier"]}"""

    # Add resume context if provided
    if session.resume_text:
        full_system_prompt += f"""

CANDIDATE'S RESUME INFORMATION:
{session.resume_text[:2000]}

Use this information to:
- Ask about specific projects mentioned in their resume
- Probe deeper into their claimed skills
- Reference their experience when asking follow-up questions
- Tailor difficulty based on their experience level"""

    # Add job description context if provided
    if session.job_description:
        full_system_prompt += f"""

TARGET JOB DESCRIPTION:
{session.job_description[:1500]}

Focus your questions on:
- Skills and requirements mentioned in this job description
- Scenarios relevant to this role
- Assess fit for this specific position"""

    full_system_prompt += """

IMPORTANT INSTRUCTIONS:
- After each candidate response, provide a brief score (1-10) at the END of your response in this exact format: [SCORE: X/10]
- The score should reflect: accuracy, depth, communication clarity, and relevance
- Keep your main response under 60 words, then add the score
- Adapt your next question difficulty based on their performance"""
    
    # Create personalized opening message
    if session.resume_text and "NAME:" in session.resume_text:
        # Try to extract name from parsed resume
        name_match = re.search(r'NAME:\s*([^\n]+)', session.resume_text)
        candidate_name = name_match.group(1).strip() if name_match else "there"
    else:
        candidate_name = "there"
    
    # Create opening message based on topic and company
    base_openings = {
        "dsa": f"Hello {candidate_name}! I'll be your interviewer today, conducting this in the style of {company_config['name']}. Let's start with Data Structures & Algorithms. Can you explain what a hash table is and when you'd use one?",
        "system_design": f"Welcome {candidate_name}! I'm conducting this system design interview {company_config['name']}-style. Let's start: How would you design a URL shortener like bit.ly?",
        "behavioral": f"Hi {candidate_name}! I'm excited to learn more about you today. This will be a {company_config['name']}-style behavioral interview. Tell me about yourself and what brings you to this opportunity?",
        "frontend": f"Hello {candidate_name}! Let's dive into frontend development, {company_config['name']}-style. Can you explain the difference between let, const, and var in JavaScript?",
        "backend": f"Welcome {candidate_name}! Let's explore backend development with a {company_config['name']} interview approach. What's the difference between SQL and NoSQL databases?",
        "general": f"Hello {candidate_name}! Welcome to your {company_config['name']}-style mock interview. Tell me about a recent project you've worked on."
    }
    
    opening = base_openings.get(session.topic, base_openings["general"])
    
    # If we have resume info, make opening more personal
    if session.resume_text and "CURRENT_ROLE:" in session.resume_text:
        role_match = re.search(r'CURRENT_ROLE:\s*([^\n]+)', session.resume_text)
        if role_match:
            current_role = role_match.group(1).strip()
            opening = f"Hello {candidate_name}! I see you're currently working as a {current_role}. I'll be conducting this {company_config['name']}-style {topic_config['name']} interview. Let's begin - tell me about a challenging problem you've solved recently."
    
    interview_sessions[session_id] = {
        "topic": session.topic,
        "topic_name": topic_config["name"],
        "difficulty": session.difficulty,
        "company_style": session.company_style,
        "company_name": company_config["name"],
        "system_prompt": full_system_prompt,
        "history": [],
        "scores": [],
        "question_count": 0,
        "enable_tts": session.enable_tts,
        "current_difficulty_adjustment": 0,
        "start_time": start_time,
        "duration_minutes": session.duration_minutes,
        "has_resume": bool(session.resume_text),
        "has_job_description": bool(session.job_description)
    }
    
    interview_sessions[session_id]["history"].append({"role": "assistant", "content": opening})
    interview_sessions[session_id]["question_count"] = 1
    
    return {
        "session_id": session_id,
        "topic": topic_config["name"],
        "company": company_config["name"],
        "difficulty": session.difficulty,
        "opening_message": opening,
        "enable_tts": session.enable_tts,
        "duration_minutes": session.duration_minutes,
        "has_resume": bool(session.resume_text),
        "has_job_description": bool(session.job_description)
    }

@app.post("/interview/{session_id}/analyze")
async def analyze_audio(session_id: str, file: UploadFile = File(...)):
    """Process audio and continue the interview conversation"""
    
    if session_id not in interview_sessions:
        raise HTTPException(status_code=404, detail="Session not found. Please start a new interview.")
    
    session = interview_sessions[session_id]
    
    try:
        # 1. Save the temporary file
        temp_filename = f"temp_audio_{session_id}.webm"
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 2. Transcribe the audio (Speech to Text)
        print("Transcribing...")
        with open(temp_filename, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                file=(temp_filename, audio_file.read()),
                model="whisper-large-v3",
                response_format="json",
                language="en",
                temperature=0.0 
            )
        user_text = transcription.text
        print(f"User said: {user_text}")
        
        # Add user message to history
        session["history"].append({"role": "user", "content": user_text})

        # 3. Build messages with full conversation history
        messages = [{"role": "system", "content": session["system_prompt"]}]
        messages.extend(session["history"])
        
        # 4. Generate AI Response with context
        print("Thinking...")
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=200
        )
        ai_response = completion.choices[0].message.content
        print(f"AI said: {ai_response}")
        
        # 5. Extract score from response
        import re
        score = None
        score_match = re.search(r'\[SCORE:\s*(\d+)/10\]', ai_response)
        if score_match:
            score = int(score_match.group(1))
            session["scores"].append(score)
            # Remove score from displayed response (keep it clean for user)
            display_response = re.sub(r'\s*\[SCORE:\s*\d+/10\]', '', ai_response).strip()
        else:
            display_response = ai_response
        
        # 6. Calculate running average and adaptive difficulty
        avg_score = sum(session["scores"]) / len(session["scores"]) if session["scores"] else None
        
        # Adaptive difficulty adjustment
        if avg_score:
            if avg_score >= 8 and session["current_difficulty_adjustment"] < 2:
                session["current_difficulty_adjustment"] += 1
            elif avg_score <= 4 and session["current_difficulty_adjustment"] > -2:
                session["current_difficulty_adjustment"] -= 1
        
        # Add AI response to history (with score for context)
        session["history"].append({"role": "assistant", "content": ai_response})
        session["question_count"] += 1
        
        # Cleanup temp file
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

        return {
            "user_text": user_text, 
            "ai_response": display_response,
            "question_number": session["question_count"],
            "history_length": len(session["history"]),
            "score": score,
            "average_score": round(avg_score, 1) if avg_score else None,
            "total_scores": len(session["scores"]),
            "difficulty_trend": "harder" if session["current_difficulty_adjustment"] > 0 else ("easier" if session["current_difficulty_adjustment"] < 0 else "stable")
        }

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/interview/{session_id}/end")
def end_interview(session_id: str):
    """End the interview and get summary"""
    
    if session_id not in interview_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = interview_sessions[session_id]
    
    # Calculate score analytics
    scores = session.get("scores", [])
    avg_score = round(sum(scores) / len(scores), 1) if scores else None
    min_score = min(scores) if scores else None
    max_score = max(scores) if scores else None
    
    # Generate summary using AI
    score_info = f"\nScores received: {scores}\nAverage score: {avg_score}/10" if scores else ""
    
    summary_prompt = f"""Based on this interview conversation, provide a detailed performance summary:
    
Interview Topic: {session.get('topic_name', session['topic'])}
Company Style: {session.get('company_name', 'Standard')}
Difficulty: {session['difficulty']}
Number of exchanges: {session['question_count']}{score_info}

Conversation:
{chr(10).join([f"{msg['role'].upper()}: {msg['content']}" for msg in session['history']])}

Provide a structured assessment:
1. **Overall Impression** (2-3 sentences)
2. **Technical Accuracy** - Rate and explain
3. **Communication Skills** - Rate and explain  
4. **Problem-Solving Approach** - Rate and explain
5. **Top 3 Strengths**
6. **Top 3 Areas for Improvement**
7. **Specific Recommendations** for next steps
8. **Final Score**: X/10

Be constructive, specific, and actionable."""

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": summary_prompt}],
            temperature=0.5,
            max_tokens=500
        )
        summary = completion.choices[0].message.content
    except Exception:
        summary = "Unable to generate summary. Please try again."
    
    # Build comprehensive result
    result = {
        "session_id": session_id,
        "topic": session.get("topic_name", session["topic"]),
        "company_style": session.get("company_name", "Standard"),
        "difficulty": session["difficulty"],
        "total_questions": session["question_count"],
        "scores": {
            "individual": scores,
            "average": avg_score,
            "min": min_score,
            "max": max_score,
            "trend": "improving" if len(scores) >= 2 and scores[-1] > scores[0] else ("declining" if len(scores) >= 2 and scores[-1] < scores[0] else "stable")
        },
        "summary": summary,
        "history": session["history"]
    }
    
    del interview_sessions[session_id]
    
    return result

@app.get("/interview/{session_id}/status")
def get_session_status(session_id: str):
    """Get current session status"""
    if session_id not in interview_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = interview_sessions[session_id]
    scores = session.get("scores", [])
    
    # Calculate elapsed time
    start_time = session.get("start_time", time.time())
    elapsed_seconds = int(time.time() - start_time)
    duration_minutes = session.get("duration_minutes", 30)
    remaining_seconds = max(0, (duration_minutes * 60) - elapsed_seconds)
    
    return {
        "session_id": session_id,
        "topic": session.get("topic_name", session["topic"]),
        "company_style": session.get("company_name", "Standard"),
        "difficulty": session["difficulty"],
        "question_count": session["question_count"],
        "history_length": len(session["history"]),
        "current_average": round(sum(scores) / len(scores), 1) if scores else None,
        "enable_tts": session.get("enable_tts", True),
        "elapsed_seconds": elapsed_seconds,
        "remaining_seconds": remaining_seconds,
        "duration_minutes": duration_minutes,
        "is_time_up": remaining_seconds <= 0,
        "has_resume": session.get("has_resume", False),
        "has_job_description": session.get("has_job_description", False)
    }

@app.get("/interview/{session_id}/time")
def get_interview_time(session_id: str):
    """Get interview timer status"""
    if session_id not in interview_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = interview_sessions[session_id]
    start_time = session.get("start_time", time.time())
    elapsed_seconds = int(time.time() - start_time)
    duration_minutes = session.get("duration_minutes", 30)
    remaining_seconds = max(0, (duration_minutes * 60) - elapsed_seconds)
    
    return {
        "elapsed_seconds": elapsed_seconds,
        "elapsed_formatted": f"{elapsed_seconds // 60:02d}:{elapsed_seconds % 60:02d}",
        "remaining_seconds": remaining_seconds,
        "remaining_formatted": f"{remaining_seconds // 60:02d}:{remaining_seconds % 60:02d}",
        "duration_minutes": duration_minutes,
        "progress_percent": min(100, (elapsed_seconds / (duration_minutes * 60)) * 100),
        "is_time_up": remaining_seconds <= 0,
        "is_warning": remaining_seconds <= 300 and remaining_seconds > 0  # 5 min warning
    }

# Keep legacy endpoint for backward compatibility
@app.post("/analyze")
async def analyze_audio_legacy(file: UploadFile = File(...)):
    """Legacy endpoint - creates a temporary session"""
    # Create a quick session
    session_result = start_interview(InterviewSession(topic="general"))
    session_id = session_result["session_id"]
    
    # Process the audio
    result = await analyze_audio(session_id, file)
    
    return result