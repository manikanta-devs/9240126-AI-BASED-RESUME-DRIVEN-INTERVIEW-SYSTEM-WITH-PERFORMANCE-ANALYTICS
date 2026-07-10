import json
import logging
import re
from typing import Optional, List
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

class CoachingResponse(BaseModel):
    overall_score: float = Field(default=5.0, ge=0, le=10)
    confidence_score: int = Field(default=5, ge=0, le=10)
    communication_score: int = Field(default=5, ge=0, le=10)
    technical_score: int = Field(default=5, ge=0, le=10)
    hr_first_impression: str = Field(default="")
    what_hr_expected: str = Field(default="")
    strengths: List[str] = Field(default_factory=list)
    mistakes: List[str] = Field(default_factory=list)
    missing_points: List[str] = Field(default_factory=list)
    interview_psychology: str = Field(default="")
    better_structure: List[str] = Field(default_factory=list)
    personalized_answer: str = Field(default="")
    why_this_answer_works: str = Field(default="")
    speaking_tips: List[str] = Field(default_factory=list)
    practice_again: str = Field(default="")
    follow_up_questions: List[str] = Field(default_factory=list)

SYSTEM_PROMPT = """You are InterviewCoach AI.

You are a Senior HR Manager with 20+ years of interviewing experience at multinational companies including Amazon, Google, Microsoft, Deloitte, Accenture, TCS, Infosys and Wipro.

Your job is NOT to simply score candidates.

Your primary responsibility is to transform average candidates into confident interview performers.

Never give generic feedback.

Every response must be personalized using:
- Candidate Resume
- Job Role
- Company
- Experience Level
- Candidate Answer
- Interview Question

Always think like a recruiter.
Explain WHY something is wrong.
Explain WHAT recruiters expect.
Teach HOW to improve.

Never insult the candidate.
Always encourage improvement.

If the answer is weak, teach.
If the answer is average, improve.
If the answer is excellent, explain why it is excellent.

Never say only "Improve communication." Instead explain exactly how.

Interview Rules:
Rule 1: Never start with 10th marks.
Rule 2: Mention projects.
Rule 3: Support claims with examples.
Rule 4: Keep introduction below 90 seconds.
Rule 5: Don't say "I'm hardworking." Prove it.
Rule 6: Always end with career goal.
Rule 7: Use STAR method (Situation, Task, Action, Result) for behavioral questions.
Rule 8: Quantify achievements with numbers and metrics.
Rule 9: Research the company before the interview.
Rule 10: Prepare 2-3 thoughtful questions to ask the interviewer.

Always return valid JSON matching the requested schema. Do not output any markdown wrapper or explanation."""

class InterviewCoach:
    def __init__(self):
        from ai.gemini_service import GeminiService
        self.ai = GeminiService()

    def get_coaching(self, question: str, answer: str, role: str = "software_engineer",
                     resume_summary: str = "", company: str = "General",
                     experience_level: str = "entry",
                     evaluation_scores: dict = None) -> dict:
        """Get detailed coaching feedback for a candidate's answer."""
        if not evaluation_scores:
            evaluation_scores = {}
            
        try:
            user_prompt = self._build_user_prompt(question, answer, role, resume_summary,
                                                   company, experience_level, evaluation_scores)
            
            result = self.ai.generate_json_with_system(
                system_prompt=SYSTEM_PROMPT,
                user_prompt=user_prompt,
                temperature=0.4,
                max_tokens=2048
            )
            
            if result:
                import sys
                print(f"RAW COACHING RESPONSE: {result}", file=sys.stderr, flush=True)
                
                # Check if it matches our schema keys or needs translation
                has_schema_keys = any(k in result for k in ["hr_first_impression", "personalized_answer", "better_structure"])
                
                if not has_schema_keys:
                    print("DEBUG: Schema mismatch detected. Translating keys...", file=sys.stderr, flush=True)
                    result = self._sanitize_raw_result(result)
                    
                try:
                    coaching = CoachingResponse(**result)
                    return coaching.model_dump()
                except Exception as e:
                    import traceback
                    print(f"Coaching response validation failed: {e}", file=sys.stderr, flush=True)
                    traceback.print_exc(file=sys.stderr)
                    return self._sanitize_raw_result(result)
            
            logger.warning("AI coaching returned None. Using fallback.")
            return self._fallback_coaching(question, answer, role, evaluation_scores)
            
        except Exception as e:
            import sys, traceback
            print(f"INTERVIEW COACHING EXCEPTION: {e}", file=sys.stderr, flush=True)
            traceback.print_exc(file=sys.stderr)
            return self._fallback_coaching(question, answer, role, evaluation_scores)

    def _build_user_prompt(self, question: str, answer: str, role: str, resume_summary: str,
                           company: str, experience_level: str, evaluation_scores: dict) -> str:
        return f"""Candidate Resume Summary:
{resume_summary or 'Not provided'}

Company: {company}
Role: {role.replace('_', ' ').title()}
Experience Level: {experience_level}

Previous Evaluation Scores:
- Overall: {evaluation_scores.get('overall', 'N/A')}/100
- Technical: {evaluation_scores.get('technical', 'N/A')}/100  
- Clarity: {evaluation_scores.get('clarity', 'N/A')}/100
- Relevance: {evaluation_scores.get('relevance', 'N/A')}/100

Interview Question:
{question}

Candidate Answer:
{answer}

Provide detailed coaching feedback. Return ONLY valid JSON matching the schema."""

    def _sanitize_raw_result(self, result: dict) -> dict:
        import sys
        print(f"DEBUG: Entering _sanitize_raw_result with: {list(result.keys())}", file=sys.stderr, flush=True)
        sanitized = {}
        defaults = CoachingResponse().model_dump()
        
        # 1. Direct copying for matching keys
        for k, v in defaults.items():
            if k in result:
                sanitized[k] = result[k]
                
        # 2. Key mapping translations
        # Case A: Groq/Llama structure (feedback, coaching, actionPlan, evaluation)
        if "evaluation" in result and isinstance(result["evaluation"], dict):
            eval_data = result["evaluation"]
            for score_key, target in [("overall", "overall_score"), ("technical", "technical_score"), 
                                      ("clarity", "confidence_score"), ("relevance", "communication_score"),
                                      ("score", "overall_score")]:
                if score_key in eval_data and target not in sanitized:
                    try:
                        val_str = str(eval_data[score_key])
                        nums = re.findall(r'\d+', val_str)
                        if nums:
                            score = float(nums[0])
                            sanitized[target] = round(score / 10.0, 1) if score > 10 else score
                    except Exception:
                        pass
            if "comment" in eval_data and "hr_first_impression" not in sanitized:
                sanitized["hr_first_impression"] = eval_data["comment"]
                
        if "feedback" in result and isinstance(result["feedback"], dict):
            fb = result["feedback"]
            if "overall" in fb:
                val = fb["overall"]
                if isinstance(val, str):
                    if "hr_first_impression" not in sanitized or not sanitized["hr_first_impression"]:
                        sanitized["hr_first_impression"] = val
                else:
                    # It's a number
                    try:
                        score = float(val)
                        if "overall_score" not in sanitized:
                            sanitized["overall_score"] = round(score / 10.0, 1) if score > 10 else score
                    except Exception:
                        pass
            
            # Map other feedback keys if they are strings/impressions or scores
            for key, target_field, target_score in [("technical", "what_hr_expected", "technical_score"),
                                                   ("clarity", None, "confidence_score"),
                                                   ("relevance", None, "communication_score")]:
                if key in fb:
                    val = fb[key]
                    if isinstance(val, str):
                        if target_field and (target_field not in sanitized or not sanitized[target_field]):
                            sanitized[target_field] = val
                    else:
                        try:
                            score = float(val)
                            if target_score not in sanitized:
                                sanitized[target_score] = round(score / 10.0, 1) if score > 10 else score
                        except Exception:
                            pass
            
            if "strengths" in fb and isinstance(fb["strengths"], list) and not sanitized.get("strengths"):
                sanitized["strengths"] = fb["strengths"]
            if "weaknesses" in fb and isinstance(fb["weaknesses"], list) and not sanitized.get("mistakes"):
                sanitized["mistakes"] = fb["weaknesses"]
            if "improvement_areas" in fb and isinstance(fb["improvement_areas"], list) and not sanitized.get("missing_points"):
                # extract titles/descriptions from improvement_areas
                improvements = []
                for imp in fb["improvement_areas"]:
                    if isinstance(imp, dict):
                        improvements.append(f"{imp.get('area', '')}: {imp.get('description', '')}")
                    else:
                        improvements.append(str(imp))
                sanitized["missing_points"] = improvements

        if "coaching" in result and isinstance(result["coaching"], dict):
            c = result["coaching"]
            if "improvement" in c and "what_hr_expected" not in sanitized:
                sanitized["what_hr_expected"] = c["improvement"]
            if "example" in c and "personalized_answer" not in sanitized:
                sanitized["personalized_answer"] = c["example"]
            if "research" in c and "why_this_answer_works" not in sanitized:
                sanitized["why_this_answer_works"] = c["research"]

        if "actionPlan" in result and isinstance(result["actionPlan"], dict):
            ap = result["actionPlan"]
            if "shortTerm" in ap and not sanitized.get("speaking_tips"):
                sanitized["speaking_tips"] = [ap["shortTerm"]]
            if "longTerm" in ap and not sanitized.get("better_structure"):
                sanitized["better_structure"] = [ap["longTerm"]]
                
        if "action_plan" in result and isinstance(result["action_plan"], list):
            # Extract tasks from Llama-style action plan
            ap_tasks = []
            for item in result["action_plan"]:
                if isinstance(item, dict) and "task" in item:
                    ap_tasks.append(item["task"])
                else:
                    ap_tasks.append(str(item))
            if ap_tasks and not sanitized.get("speaking_tips"):
                sanitized["speaking_tips"] = ap_tasks

        if "career_goal_alignment" in result and isinstance(result["career_goal_alignment"], str) and not sanitized.get("why_this_answer_works"):
            sanitized["why_this_answer_works"] = result["career_goal_alignment"]

        # 3. Apply defaults for any remaining missing keys
        for k, v in defaults.items():
            if k not in sanitized or sanitized[k] is None or sanitized[k] == "" or sanitized[k] == []:
                sanitized[k] = v
                
        return sanitized

    def _fallback_coaching(self, question: str, answer: str, role: str, evaluation_scores: dict) -> dict:
        overall = evaluation_scores.get('overall', 50)
        score_10 = round(overall / 10.0, 1)
        tech_10 = round(evaluation_scores.get('technical', overall) / 10.0)
        comm_10 = round(evaluation_scores.get('clarity', overall) / 10.0)
        conf_10 = round(overall / 10.0)

        # Basic fallback contents based on scores
        if overall < 45:
            impression = "The answer was too brief or lacked sufficient context. Recruiters look for structured explanations rather than single-sentence summaries."
            expected = "Recruiters expect a structured answer describing your role, the problem, your action, and the result (STAR method)."
            strengths = ["Attempted to answer directly"]
            mistakes = ["Answer was too short", "Did not explain the context or projects", "Lacks specific examples"]
            missing = ["No mention of tech stack or tools used", "No STAR structure", "No quantifiable metrics"]
            psychology = "A short answer signals a lack of interest, confidence, or experience. Recruiter psychology values candidates who show enthusiasm and elaborate on achievements."
            better_struct = ["Introduce the situation/context", "Describe your task/role", "Explain the action you took with specific tools", "Share the outcome/result"]
            tips = ["Speak in complete paragraphs, aiming for 60-90 seconds", "Maintain a confident pace of 120-140 WPM", "Elaborate with details about your projects"]
        elif overall < 70:
            impression = "A good start with relevant details, but it needs better structure and specific examples to show technical leadership."
            expected = "Recruiters expect you to support your claims with concrete project examples and explain the 'why' behind architectural choices."
            strengths = ["Demonstrated relevant domain knowledge", "Clear topic relevance"]
            mistakes = ["Missing quantifiable metrics of success", "Structure could be tighter"]
            missing = ["Explicit examples of solving team conflicts or complex bugs", "Tech stack tradeoffs"]
            psychology = "Recruiters evaluate problem-solving ability. Presenting structural trade-offs shows that you don't just write code, but understand system design."
            better_struct = ["Mention the project context and scope", "Highlight the key technical challenge", "Detail your specific implementation actions", "State the business or performance impact"]
            tips = ["Pause briefly after presenting key metrics to let them sink in", "Structure your thoughts using bullet points ('First...', 'Second...')", "Avoid filler words when transitioning between thoughts"]
        else:
            impression = "An excellent and well-detailed answer that highlights clear expertise and good technical alignment."
            expected = "Recruiters expect advanced candidate answers to show business alignment, technical mastery, and clear ownership."
            strengths = ["Strong structured response", "Good technical depth", "Clear communication"]
            mistakes = ["Slightly wordy in some explanations"]
            missing = ["None identified; the answer is solid"]
            psychology = "Confidence and clear articulation of outcomes show readiness for senior roles and ease recruiter concerns about team integration."
            better_struct = ["Keep doing what you are doing", "Refine the delivery speed for ultimate impact"]
            tips = ["Keep your posture upright and smile slightly during greetings", "End your answers with a clear wrap-up statement"]

        personalized = f"Based on your profile as a {role.replace('_', ' ').title()}, here is how you can pitch: 'In my past experience, I encountered a similar challenge where we needed to solve {question[:40]}... I leveraged my technical skills to optimize the throughput, which resulted in a better outcome.'"

        return {
            "overall_score": score_10,
            "confidence_score": conf_10,
            "communication_score": comm_10,
            "technical_score": tech_10,
            "hr_first_impression": impression,
            "what_hr_expected": expected,
            "strengths": strengths,
            "mistakes": mistakes,
            "missing_points": missing,
            "interview_psychology": psychology,
            "better_structure": better_struct,
            "personalized_answer": personalized,
            "why_this_answer_works": "This structured approach establishes technical capability, quantifies achievement, and matches exactly what senior interviewers are looking for.",
            "speaking_tips": tips,
            "practice_again": "Try re-answering this question using the STAR method, focusing on a specific project from your resume.",
            "follow_up_questions": [
                "Can you walk me through the system architecture of that project?",
                "What was the biggest technical blocker you faced, and how did you resolve it?"
            ]
        }
