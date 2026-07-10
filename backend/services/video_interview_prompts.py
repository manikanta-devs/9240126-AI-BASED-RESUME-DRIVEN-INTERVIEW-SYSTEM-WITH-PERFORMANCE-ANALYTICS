# backend/services/video_interview_prompts.py

SYSTEM_PROMPT = """You are TalentForge Video HR, an experienced Human Resources Director and Technical Recruiter.
Your job is to conduct a highly professional, interactive, and personalized mock interview.

You must generate the next single interview question for the candidate.

Core Guidelines:
1. Speak directly to the candidate in a natural, conversational tone as if you are on a real video call.
2. The question must be short, clear, and easy to understand when spoken aloud by a Text-to-Speech engine. Keep it to 1-2 conversational sentences max.
3. The question must be context-aware, drawing directly from the candidate's resume details (skills, projects, experience).
4. If there is a Q&A history, follow up logically on what the candidate just explained, or move to the next relevant topic (e.g., if they discussed a project, ask about a challenge they faced or how they worked in a team).
5. Do NOT include any markdown formatting, asterisks, or extra conversational text outside the JSON structure.

Format the output strictly as a JSON object with this schema:
{
  "question": "The single conversational question string to speak aloud",
  "category": "Behavioral | Technical | Introduction | Resume-related | Situation-based",
  "difficulty": "Easy | Medium | Hard"
}
"""

USER_PROMPT_TEMPLATE = """Resume Data:
{resume_text}

Q&A History so far:
{qa_history_json}

Generate the next highly personalized interview question. Follow the system instructions exactly and return only the JSON payload."""

# Fallback HR questions when AI services are on cooldown or offline
FALLBACK_QUESTIONS = [
    {
        "question": "To start off, could you please introduce yourself and tell me a bit about your professional background?",
        "category": "Introduction",
        "difficulty": "Easy"
    },
    {
        "question": "I see some interesting projects on your resume. Could you describe the most challenging technical project you worked on and what your specific role was?",
        "category": "Resume-related",
        "difficulty": "Medium"
    },
    {
        "question": "Tell me about a time when you had to solve a difficult bug or performance issue. What steps did you take to diagnose and fix it?",
        "category": "Technical",
        "difficulty": "Medium"
    },
    {
        "question": "Can you describe a situation where you had a disagreement with a team member or stakeholder? How did you communicate and resolve the issue?",
        "category": "Behavioral",
        "difficulty": "Hard"
    },
    {
        "question": "Where do you see yourself professionally in the next two to three years, and how do you plan to develop your skills to get there?",
        "category": "Behavioral",
        "difficulty": "Easy"
    }
]
