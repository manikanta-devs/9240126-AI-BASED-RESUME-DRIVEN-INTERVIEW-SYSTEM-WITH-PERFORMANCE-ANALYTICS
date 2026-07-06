from flask import Blueprint, request, jsonify, current_app
import logging

from services.analytics_service import AnalyticsService
from utils.auth_utils import token_required
from ai.gemini_service import GeminiService

logger = logging.getLogger(__name__)
analytics_bp = Blueprint("analytics", __name__)
analytics_service = AnalyticsService()
gemini_service = GeminiService()


@analytics_bp.route("/analytics/summary", methods=["GET"])
@token_required
def get_summary():
    """Get overall performance summary"""
    try:
        summary = analytics_service.get_summary(username=request.username)
        return jsonify({"success": True, "summary": summary}), 200
    except Exception as e:
        logger.error(f"Analytics summary error: {e}")
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/analytics/sessions", methods=["GET"])
@token_required
def get_sessions():
    """Get all completed sessions with scores"""
    try:
        limit = int(request.args.get("limit", 20))
        sessions = analytics_service.get_all_sessions(limit=limit, username=request.username)
        return jsonify({"success": True, "sessions": sessions}), 200
    except Exception as e:
        logger.error(f"Analytics sessions error: {e}")
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/analytics/session/<session_id>", methods=["GET"])
@token_required
def get_session(session_id):
    """Get detailed analytics for a specific session"""
    try:
        session = analytics_service.get_session_details(session_id)
        if not session:
            return jsonify({"error": "Session not found"}), 404
        if session.get("username") and session.get("username") != request.username:
            return jsonify({"error": "Forbidden"}), 403
        return jsonify({"success": True, "session": session}), 200
    except Exception as e:
        logger.error(f"Analytics session error: {e}")
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/analytics/performance-trend", methods=["GET"])
@token_required
def performance_trend():
    """Get performance trend over time"""
    try:
        trend = analytics_service.get_performance_trend(username=request.username)
        return jsonify({"success": True, "trend": trend}), 200
    except Exception as e:
        logger.error(f"Performance trend error: {e}")
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/analytics/weak-areas", methods=["GET"])
@token_required
def weak_areas():
    """Get identified weak areas across all sessions"""
    try:
        areas = analytics_service.get_weak_areas(username=request.username)
        return jsonify({"success": True, "weak_areas": areas}), 200
    except Exception as e:
        logger.error(f"Weak areas error: {e}")
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/analytics/skill-breakdown", methods=["GET"])
@token_required
def skill_breakdown():
    """Get skill-wise performance breakdown"""
    try:
        breakdown = analytics_service.get_skill_breakdown(username=request.username)
        return jsonify({"success": True, "breakdown": breakdown}), 200
    except Exception as e:
        logger.error(f"Skill breakdown error: {e}")
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/analytics/study-plan", methods=["GET"])
@token_required
def study_plan():
    """Get a personalized weekly practice plan."""
    try:
        plan = analytics_service.get_study_plan(username=request.username)
        return jsonify({"success": True, "study_plan": plan}), 200
    except Exception as e:
        logger.error(f"Study plan error: {e}")
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/analytics/communication-coach", methods=["GET"])
@token_required
def communication_coach():
    """Get a communication-first coaching plan."""
    try:
        coach = analytics_service.get_communication_coach(username=request.username)
        return jsonify({"success": True, "communication_coach": coach}), 200
    except Exception as e:
        logger.error(f"Communication coach error: {e}")
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/analytics/clear", methods=["DELETE"])
@token_required
def clear_analytics():
    """Clear all analytics data"""
    if current_app.config.get("ENV") == "production":
        return jsonify({"error": "Developer tools are disabled in production"}), 403
    try:
        analytics_service.clear_all()
        return jsonify({"success": True, "message": "All analytics data cleared"}), 200
    except Exception as e:
        logger.error(f"Clear analytics error: {e}")
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/developer/mock-session", methods=["POST"])
@token_required
def mock_session():
    """Inject a pre-computed completed mock session for demos."""
    if current_app.config.get("ENV") == "production":
        return jsonify({"error": "Developer tools are disabled in production"}), 403
    try:
        import uuid
        from datetime import datetime, timezone
        from services import database as db
        
        data = request.get_json() or {}
        session_type = data.get("type", "perfect")
        session_id = f"mock_{session_type}_{uuid.uuid4().hex[:8]}"
        
        if session_type == "perfect":
            overall_score = 98
            tech_score = 98
            clarity = 97
            completeness = 98
            pacing = 125
            fillers = 1
            emotion = "focused"
            posture = 96
            posture_label = "Good"
            eye_contact = 97
            grade = "A+"
            strong_areas = ["System Design Trade-offs", "React Hooks Optimization", "Asynchronous JavaScript"]
            weak_areas = ["Rambling slightly under pressure"]
            q_text = "How would you design a highly scalable caching strategy using Redis?"
            ans_text = "I would place a Redis cache layer in front of our main SQLite/SQL database to handle the top 20% most active read traffic. I'd configure a Cache-Aside pattern where the server checks Redis first. If it's a cache miss, we read from the database, write back to Redis, and return. To ensure memory is optimized, I'd apply an LRU eviction policy and set a 1-hour TTL on keys."
            eval_feedback = "Your description of the Cache-Aside pattern, LRU eviction, and TTL limits was technically outstanding and direct."
        else:
            overall_score = 55
            tech_score = 50
            clarity = 55
            completeness = 60
            pacing = 205
            fillers = 12
            emotion = "disengaged"
            posture = 38
            posture_label = "Slouched"
            eye_contact = 25
            grade = "C"
            strong_areas = ["Understands database replication concepts"]
            weak_areas = ["Pacing rate too high (rushing)", "Poor eye contact (not looking at lens)", "Slouched body posture"]
            q_text = "Describe a memory leak you spent a long time debugging in production."
            ans_text = "Um, like, basically we had this, uh, really bad server crash on Fridays, and so, um, I like, went into the code and basically, like, restarted it every week. And so, um, actually, we didn't really, uh, fix it, but basically it kept running, like, after restarting."
            eval_feedback = "Your answer was extremely short, utilized high amounts of filler words, and lacked any description of debugging tools, profiling heap dumps, or root-cause resolutions. Pacing was rushed."

        # Questions
        questions = [{
            "id": 1,
            "text": q_text,
            "category": "Architecture & Debugging",
            "difficulty": "medium",
            "type": "technical"
        }]

        # Evaluation & Voice / Video sub-metrics
        evaluation = {
            "overall_score": overall_score,
            "technical_score": tech_score,
            "clarity_score": clarity,
            "completeness_score": completeness,
            "relevance_score": overall_score,
            "depth_score": tech_score,
            "feedback": eval_feedback,
            "strong_points": strong_areas,
            "improvements": ["Use complete silence instead of um/like" if session_type == "weak" else "Keep doing what you are doing"],
            "topic": "Architecture & Debugging",
            "star_rubric": {
                "situation": 95 if session_type == "perfect" else 50,
                "task": 98 if session_type == "perfect" else 55,
                "action": 96 if session_type == "perfect" else 45,
                "result": 98 if session_type == "perfect" else 35
            }
        }

        answers = [{
            "question_index": 0,
            "question": questions[0],
            "answer": ans_text,
            "voice_metrics": {
                "speaking_rate_wpm": pacing,
                "filler_word_count": fillers,
                "filler_word_ratio": round((fillers / 40) * 100, 1) if session_type == "weak" else 1.2,
                "tremor_score": 18 if session_type == "weak" else 5,
                "voice_delivery_score": tech_score - 10 if session_type == "weak" else tech_score
            },
            "emotion_metrics": {
                "eye_contact_score": eye_contact,
                "posture_score": posture,
                "posture_label": posture_label,
                "primary_emotion": emotion,
                "emotion_label": emotion.capitalize(),
                "confidence": eye_contact
            },
            "evaluation": evaluation,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }]

        results = {
            "candidate_name": "Demo Presenter",
            "role": "software_engineer",
            "interview_format": "video",
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "duration_minutes": 1,
            "grade": grade,
            "scores": {
                "overall": overall_score,
                "technical": tech_score,
                "clarity": clarity,
                "completeness": completeness
            },
            "voice": {
                "delivery": tech_score - 10 if session_type == "weak" else tech_score,
                "speaking_pace_wpm": pacing,
                "filler_word_count": fillers,
                "filler_word_ratio": round((fillers / 40) * 100, 1) if session_type == "weak" else 1.2,
                "tremor_score": 18 if session_type == "weak" else 5
            },
            "video": {
                "engagement_score": overall_score,
                "eye_contact_score": eye_contact,
                "posture_score": posture,
                "posture_label": posture_label,
                "primary_emotion": emotion,
                "emotion_label": emotion.capitalize()
            },
            "strong_areas": strong_areas,
            "weak_areas": weak_areas,
            "answers": answers
        }

        session = {
            "id": session_id,
            "candidate_name": "Demo Presenter",
            "role": "software_engineer",
            "interview_format": "video",
            "difficulty": "medium",
            "panel_mode": False,
            "status": "completed",
            "started_at": datetime.now(timezone.utc).isoformat(),
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "resume_data": {},
            "questions": questions,
            "answers": answers,
            "results": results
        }

        db.save_session(session)
        return jsonify({"success": True, "session_id": session_id, "results": results}), 200
    except Exception as e:
        logger.error(f"Developer mock session generation error: {e}")
        return jsonify({"error": str(e)}), 500


def clean_llm_json(raw_text: str) -> str:
    if not raw_text:
        return ""
    text = raw_text.strip()
    first_brace = text.find('{')
    last_brace = text.rfind('}')
    if first_brace != -1 and last_brace != -1:
        return text[first_brace:last_brace+1]
    return text


@analytics_bp.route("/coach/ask", methods=["POST"])
@token_required
def coach_ask():
    """Ask the AI Career Mentor a question"""
    try:
        data = request.get_json() or {}
        question = data.get("question", "").strip()
        if not question:
            return jsonify({"error": "Question is required"}), 400

        prompt = f"""You are a 24/7 senior tech and career mentor. Provide a structured, helpful explanation for the query: "{question}"
        IMPORTANT: Explain the topic in extremely simple, friendly, and easy-to-understand language, as if you are explaining it to a 10-year-old child or a complete beginner. Use vivid, simple analogies.
        Format your response strictly as a JSON object with the following keys:
        - definition: A very simple, friendly 1-2 sentence definition (simple enough for a kid to understand).
        - analogy: A creative, extremely easy-to-understand real-world analogy.
        - example: A technical example showing structure, data payloads, or code snippets (keep it basic and clear).
        - model_answer: A premium mock answer the candidate can speak out loud in an interview to impress the interviewer.
        - follow_ups: A list of 3 expected follow-up questions they'll ask next.
        
        CRITICAL RULES:
        1. All values for definition, analogy, example, and model_answer MUST be plain, flat strings. Do NOT wrap them in nested objects, dicts, or lists of objects (e.g. do NOT use {{"text": "...", "description": "..."}}).
        2. The value for follow_ups MUST be a list of plain strings, NOT a list of objects.
        3. Do not include comments, descriptions, or explanation fields inside the JSON keys.
        Ensure the output is valid JSON and nothing else."""

        raw_response = gemini_service.generate_content(prompt)
        if not raw_response:
            return jsonify({"error": "AI Mentor is temporarily unavailable"}), 503

        # Clean and parse JSON
        parsed = None
        cleaned = clean_llm_json(raw_response)

        try:
            import json
            parsed = json.loads(cleaned)
        except Exception as e:
            logger.error(f"Failed to parse mentor response: {e}. Raw: {raw_response}")
            # Fallback structure
            parsed = {
                "definition": "Could not parse structured definition.",
                "analogy": "Could not parse structured analogy.",
                "example": "Could not parse structured example.",
                "model_answer": raw_response,
                "follow_ups": ["What are the core benefits of this approach?", "How does this scale?", "What are the common pitfalls?"]
            }

        return jsonify({"success": True, "data": parsed}), 200
    except Exception as e:
        logger.error(f"Coach ask error: {e}")
        return jsonify({"error": str(e)}), 500


def normalize_roadmap(parsed_json: dict) -> dict:
    default_roadmap = {
        "target_role": "Software Engineer",
        "target_company": "Google",
        "readiness_score": 72,
        "est_days": 18,
        "difficulty": "Intermediate",
        "summary": "We generated this targeted learning roadmap focusing on DBMS, SQL queries, and core system design concepts.",
        "strengths": ["Python", "HTML/CSS", "React Frameworks", "Communication Clarity"],
        "weaknesses": [
            {"name": "SQL & Queries", "mastery": "68%", "priority": "High", "est_improvement": "+15%"},
            {"name": "DBMS Indexes", "mastery": "50%", "priority": "High", "est_improvement": "+25%"},
            {"name": "System Design", "mastery": "40%", "priority": "Medium", "est_improvement": "+20%"},
            {"name": "OS Networks", "mastery": "55%", "priority": "Medium", "est_improvement": "+15%"}
        ],
        "phases": [
            {
                "phase_num": 1,
                "title": "DBMS Fundamentals",
                "status": "Completed",
                "progress": 100,
                "why_matters": "Understanding relational algebra, database models, and transactions is a requirement for core backend questions.",
                "est_study_time": "4 Hours",
                "difficulty": "Easy",
                "learning_outcome": "Define 1NF/2NF/3NF normal forms and draw clear Entity Relationship diagrams.",
                "importance": "Critical",
                "resources": [
                    {"name": "freeCodeCamp DBMS Tutorial", "type": "Video", "url": "https://www.youtube.com/watch?v=ztHopE5Wnpc"},
                    {"name": "GeeksforGeeks DBMS Guide", "type": "Documentation", "url": "https://www.geeksforgeeks.org/dbms/"}
                ]
            },
            {
                "phase_num": 2,
                "title": "SQL Query Optimization",
                "status": "Current",
                "progress": 68,
                "why_matters": "Companies test candidates on writing complex nested JOINs and subqueries under timed pressure.",
                "est_study_time": "8 Hours",
                "difficulty": "Medium",
                "learning_outcome": "Write optimization routines using indexes and trace query latency factors.",
                "importance": "Critical",
                "resources": [
                    {"name": "SQLBolt Practice lessons", "type": "Practice", "url": "https://sqlbolt.com/"},
                    {"name": "Kudvenkat SQL Tutorials", "type": "Video", "url": "https://www.youtube.com/user/kudvenkat"}
                ]
            },
            {
                "phase_num": 3,
                "title": "Normalization & Transactions",
                "status": "Locked",
                "progress": 0,
                "why_matters": "ACID properties ensure secure concurrency flow in real-world application backends.",
                "est_study_time": "6 Hours",
                "difficulty": "Hard",
                "learning_outcome": "Audit write-ahead logs and design locking mechanisms for concurrent DB operations.",
                "importance": "High",
                "resources": [
                    {"name": "Microsoft Transact-SQL Docs", "type": "Documentation", "url": "https://learn.microsoft.com/"},
                    {"name": "Gate Smashers Normalization lecture", "type": "Video", "url": "https://www.youtube.com/c/GateSmashers"}
                ]
            },
            {
                "phase_num": 4,
                "title": "Database Mini Mock Interview",
                "status": "Locked",
                "progress": 0,
                "why_matters": "Simulating spoken technical questions prevents freezing during real interview drills.",
                "est_study_time": "3 Hours",
                "difficulty": "Hard",
                "learning_outcome": "Explain transaction isolation levels orally using structural STAR methodology.",
                "importance": "Critical",
                "resources": [
                    {"name": "LeetCode Database problems", "type": "Practice", "url": "https://leetcode.com/problemset/database/"},
                    {"name": "AstraPrep SQL Practice Room", "type": "Quiz", "url": "https://localhost:5173/dashboard/quiz"}
                ]
            }
        ],
        "pipeline": ["Learn Concept", "Watch Video", "Practice Problems", "Take Quiz", "Mock Interview"],
        "progress_metrics": {
            "topics_completed": "4/12 Topics",
            "est_readiness": "82%",
            "days_remaining": "14 Days",
            "current_streak": "5 Days",
            "completion_pct": 66
        }
    }
    if not parsed_json or not isinstance(parsed_json, dict):
        return default_roadmap
    normalized = {}
    for key, default_val in default_roadmap.items():
        found_key = None
        for k in parsed_json.keys():
            if k.lower() == key.lower():
                found_key = k
                break
        if not found_key:
            if key == "strengths" and "strong_points" in parsed_json:
                found_key = "strong_points"
            elif key == "weaknesses" and "needs_improvement" in parsed_json:
                found_key = "needs_improvement"
            elif key == "weaknesses" and "improvement_areas" in parsed_json:
                found_key = "improvement_areas"
        if found_key:
            normalized[key] = parsed_json[found_key]
        else:
            normalized[key] = default_val
    if not isinstance(normalized.get("strengths"), list):
        normalized["strengths"] = default_roadmap["strengths"]
    if not isinstance(normalized.get("weaknesses"), list):
        normalized["weaknesses"] = default_roadmap["weaknesses"]
    else:
        for item in normalized["weaknesses"]:
            if not isinstance(item, dict):
                normalized["weaknesses"] = default_roadmap["weaknesses"]
                break
            if "name" not in item:
                item["name"] = item.get("skill", "General Concept")
            if "mastery" not in item:
                item["mastery"] = "50%"
            if "priority" not in item:
                item["priority"] = "Medium"
            if "est_improvement" not in item:
                item["est_improvement"] = "+10%"
    if not isinstance(normalized.get("phases"), list):
        normalized["phases"] = default_roadmap["phases"]
    else:
        for phase in normalized["phases"]:
            if not isinstance(phase, dict):
                normalized["phases"] = default_roadmap["phases"]
                break
            if "phase_num" not in phase:
                phase["phase_num"] = 1
            if "title" not in phase:
                phase["title"] = "Preparation Phase"
            if "status" not in phase:
                phase["status"] = "Locked"
            if "progress" not in phase:
                phase["progress"] = 0
            if "why_matters" not in phase:
                phase["why_matters"] = "Key topic for tech interviews."
            if "est_study_time" not in phase:
                phase["est_study_time"] = "4 Hours"
            if "difficulty" not in phase:
                phase["difficulty"] = "Medium"
            if "learning_outcome" not in phase:
                phase["learning_outcome"] = "Core skills acquisition."
            if "importance" not in phase:
                phase["importance"] = "Medium"
            if "resources" not in phase or not isinstance(phase["resources"], list):
                phase["resources"] = default_roadmap["phases"][0]["resources"]
            else:
                for res in phase["resources"]:
                    if not isinstance(res, dict):
                        phase["resources"] = default_roadmap["phases"][0]["resources"]
                        break
                    if "name" not in res:
                        res["name"] = "Learning resource"
                    if "type" not in res:
                        res["type"] = "Documentation"
                    if "url" not in res:
                        res["url"] = "https://techdevguide.withgoogle.com/"
    if not isinstance(normalized.get("progress_metrics"), dict):
        normalized["progress_metrics"] = default_roadmap["progress_metrics"]
    else:
        pm = normalized["progress_metrics"]
        for pk, pv in default_roadmap["progress_metrics"].items():
            if pk not in pm:
                pm[pk] = pv
    return normalized


PREBUILT_ROADMAPS = {
    "dbms": {
        "target_role": "Backend Engineer (Databases)",
        "target_company": "Oracle",
        "readiness_score": 65,
        "est_days": 14,
        "difficulty": "Intermediate",
        "summary": "Focuses on relational databases, transaction levels, database design, normalization, query optimizations, and indexes.",
        "strengths": ["SQL Basics", "Table Creation", "Primary Keys"],
        "weaknesses": [
            {"name": "Transaction Isolation", "mastery": "50%", "priority": "High", "est_improvement": "+25%"},
            {"name": "Query Optimization", "mastery": "45%", "priority": "High", "est_improvement": "+30%"},
            {"name": "Database Sharding", "mastery": "30%", "priority": "Medium", "est_improvement": "+20%"}
        ],
        "phases": [
            {
                "phase_num": 1,
                "title": "DBMS Fundamentals & Normalization",
                "status": "Completed",
                "progress": 100,
                "why_matters": "Core theory tested extensively in backend engineer rounds.",
                "est_study_time": "4 Hours",
                "difficulty": "Easy",
                "learning_outcome": "Identify 1NF, 2NF, 3NF schemas and write schema scripts.",
                "importance": "Critical",
                "resources": [
                    {"name": "GeeksforGeeks DBMS Tutorial", "type": "Documentation", "url": "https://www.geeksforgeeks.org/dbms/"},
                    {"name": "Gate Smashers Normalization", "type": "Video", "url": "https://www.youtube.com/c/GateSmashers"}
                ]
            },
            {
                "phase_num": 2,
                "title": "Indexes and Execution Plans",
                "status": "Current",
                "progress": 45,
                "why_matters": "Enables writing production-grade sub-millisecond query responses.",
                "est_study_time": "6 Hours",
                "difficulty": "Medium",
                "learning_outcome": "Use EXPLAIN ANALYZE to locate bottlenecks and optimize query speed.",
                "importance": "Critical",
                "resources": [
                    {"name": "Use The Index, Luke!", "type": "Documentation", "url": "https://use-the-index-luke.com/"},
                    {"name": "Hussein Nasser Database Course", "type": "Video", "url": "https://www.youtube.com/@hnasr"}
                ]
            },
            {
                "phase_num": 3,
                "title": "ACID Properties & Isolation Levels",
                "status": "Locked",
                "progress": 0,
                "why_matters": "Necessary for understanding race conditions and data corruption risks.",
                "est_study_time": "5 Hours",
                "difficulty": "Hard",
                "learning_outcome": "Contrast Dirty Read, Non-Repeatable Read, and Phantom Read isolation levels.",
                "importance": "High",
                "resources": [
                    {"name": "PostgreSQL Transaction Isolation Docs", "type": "Documentation", "url": "https://www.postgresql.org/docs/"}
                ]
            },
            {
                "phase_num": 4,
                "title": "Database Schema Design Board",
                "status": "Locked",
                "progress": 0,
                "why_matters": "Tests systems design and architectural decisions under pressure.",
                "est_study_time": "4 Hours",
                "difficulty": "Hard",
                "learning_outcome": "Design a relational schema for a collaborative workspace like Notion.",
                "importance": "Critical",
                "resources": [
                    {"name": "ByteByteGo Database Choices", "type": "Video", "url": "https://bytebytego.com/"}
                ]
            }
        ],
        "pipeline": ["Learn Concept", "Watch Video", "Practice Problems", "Take Quiz", "Mock Interview"],
        "progress_metrics": {
            "topics_completed": "4/12 Topics",
            "est_readiness": "65%",
            "days_remaining": "14 Days",
            "current_streak": "5 Days",
            "completion_pct": 25
        }
    },
    "python": {
        "target_role": "Python/Backend Engineer",
        "target_company": "Netflix",
        "readiness_score": 78,
        "est_days": 12,
        "difficulty": "Intermediate",
        "summary": "Covers Python memory model, decorators, generators, multi-threading vs multi-processing, and Flask/Django web frameworks.",
        "strengths": ["Basic Syntax", "Object Oriented Concepts", "Scripting"],
        "weaknesses": [
            {"name": "Generators & Iterators", "mastery": "55%", "priority": "High", "est_improvement": "+15%"},
            {"name": "Decorators & Closures", "mastery": "45%", "priority": "High", "est_improvement": "+25%"},
            {"name": "GIL & Concurrency", "mastery": "35%", "priority": "Medium", "est_improvement": "+20%"}
        ],
        "phases": [
            {
                "phase_num": 1,
                "title": "Advanced OOP & Memory Management",
                "status": "Completed",
                "progress": 100,
                "why_matters": "Important for structuring large clean backend python repositories.",
                "est_study_time": "3 Hours",
                "difficulty": "Easy",
                "learning_outcome": "Master dunder methods, garbage collection, and variable references.",
                "importance": "High",
                "resources": [
                    {"name": "Real Python OOP Guide", "type": "Documentation", "url": "https://realpython.com/"}
                ]
            },
            {
                "phase_num": 2,
                "title": "Closures, Decorators & Generators",
                "status": "Current",
                "progress": 55,
                "why_matters": "Enables writing highly reuseable, clean, and memory-efficient functions.",
                "est_study_time": "5 Hours",
                "difficulty": "Medium",
                "learning_outcome": "Write custom timing/caching decorators and lazy list data pipelines.",
                "importance": "Critical",
                "resources": [
                    {"name": "Corey Schafer Decorators", "type": "Video", "url": "https://www.youtube.com/user/schafer5"}
                ]
            },
            {
                "phase_num": 3,
                "title": "GIL & Concurrent Processing",
                "status": "Locked",
                "progress": 0,
                "why_matters": "GIL restricts CPU concurrency, requiring distinct multiprocessing paradigms.",
                "est_study_time": "6 Hours",
                "difficulty": "Hard",
                "learning_outcome": "Implement ThreadPoolExecutor and ProcessPoolExecutor routines correctly.",
                "importance": "Critical",
                "resources": [
                    {"name": "Python Concurrency Docs", "type": "Documentation", "url": "https://docs.python.org/3/library/concurrency.html"}
                ]
            },
            {
                "phase_num": 4,
                "title": "Python Backend Simulation Mock",
                "status": "Locked",
                "progress": 0,
                "why_matters": "Simulates custom oral coding interviews.",
                "est_study_time": "3 Hours",
                "difficulty": "Hard",
                "learning_outcome": "Design a rate limiter middleware for Flask/FastAPI.",
                "importance": "High",
                "resources": [
                    {"name": "FastAPI Tutorial Docs", "type": "Documentation", "url": "https://fastapi.tiangolo.com/"}
                ]
            }
        ],
        "pipeline": ["Learn Concept", "Watch Video", "Practice Problems", "Take Quiz", "Mock Interview"],
        "progress_metrics": {
            "topics_completed": "6/12 Topics",
            "est_readiness": "78%",
            "days_remaining": "12 Days",
            "current_streak": "6 Days",
            "completion_pct": 50
        }
    },
    "dsa": {
        "target_role": "Software Engineer (Core Algorithmic)",
        "target_company": "Google",
        "readiness_score": 50,
        "est_days": 30,
        "difficulty": "Advanced",
        "summary": "Focuses on linear and non-linear data structures, dynamic programming recursion, graph traversals, and complexity boundaries.",
        "strengths": ["Arrays", "HashMaps", "String Matching"],
        "weaknesses": [
            {"name": "Dynamic Programming", "mastery": "30%", "priority": "High", "est_improvement": "+35%"},
            {"name": "Graphs & BFS/DFS", "mastery": "40%", "priority": "High", "est_improvement": "+25%"},
            {"name": "Backtracking", "mastery": "45%", "priority": "Medium", "est_improvement": "+15%"}
        ],
        "phases": [
            {
                "phase_num": 1,
                "title": "Linear Structures & Sorting Algorithms",
                "status": "Completed",
                "progress": 100,
                "why_matters": "Foundation for understanding data storage layout performance.",
                "est_study_time": "8 Hours",
                "difficulty": "Easy",
                "learning_outcome": "Implement queues, stacks, merge sort, and binary search safely.",
                "importance": "Critical",
                "resources": [
                    {"name": "NeetCode Roadmap", "type": "Practice", "url": "https://neetcode.io/"}
                ]
            },
            {
                "phase_num": 2,
                "title": "Non-Linear Structures: Trees & Graphs",
                "status": "Current",
                "progress": 40,
                "why_matters": "Vital for routing algorithms, social networks, and database indexing structures.",
                "est_study_time": "12 Hours",
                "difficulty": "Medium",
                "learning_outcome": "Write BFS/DFS traversal and find cycles in directed/undirected graphs.",
                "importance": "Critical",
                "resources": [
                    {"name": "Abdul Bari Algorithms", "type": "Video", "url": "https://www.youtube.com/@abdul_bari"}
                ]
            },
            {
                "phase_num": 3,
                "title": "Dynamic Programming Optimizations",
                "status": "Locked",
                "progress": 0,
                "why_matters": "DP questions are standard for filtering candidates at top companies.",
                "est_study_time": "15 Hours",
                "difficulty": "Hard",
                "learning_outcome": "Transition dynamic formulations from top-down memoization to bottom-up tabulation.",
                "importance": "Critical",
                "resources": [
                    {"name": "MIT Intro to Algorithms", "type": "Video", "url": "https://ocw.mit.edu/"}
                ]
            },
            {
                "phase_num": 4,
                "title": "DSA Mock Board Simulation",
                "status": "Locked",
                "progress": 0,
                "why_matters": "Explaining complex algorithmic thoughts orally is a key interview skill.",
                "est_study_time": "5 Hours",
                "difficulty": "Hard",
                "learning_outcome": "Solve and explain a Hard Graph problem in 40 minutes.",
                "importance": "High",
                "resources": [
                    {"name": "LeetCode Problems Set", "type": "Practice", "url": "https://leetcode.com/"}
                ]
            }
        ],
        "pipeline": ["Learn Concept", "Watch Video", "Practice Problems", "Take Quiz", "Mock Interview"],
        "progress_metrics": {
            "topics_completed": "3/15 Topics",
            "est_readiness": "50%",
            "days_remaining": "30 Days",
            "current_streak": "8 Days",
            "completion_pct": 20
        }
    },
    "web_dev": {
        "target_role": "Frontend Developer / Full Stack",
        "target_company": "Vercel",
        "readiness_score": 72,
        "est_days": 20,
        "difficulty": "Intermediate",
        "summary": "Emphasizes JavaScript execution model, DOM optimizations, React rendering lifecycles, and REST/GraphQL APIs.",
        "strengths": ["HTML & CSS Layouts", "React Basics", "Git Versioning"],
        "weaknesses": [
            {"name": "JS Event Loop", "mastery": "60%", "priority": "High", "est_improvement": "+20%"},
            {"name": "React Rendering Tuning", "mastery": "50%", "priority": "High", "est_improvement": "+25%"},
            {"name": "State Management (Redux/Zustand)", "mastery": "45%", "priority": "Medium", "est_improvement": "+20%"}
        ],
        "phases": [
            {
                "phase_num": 1,
                "title": "Modern JavaScript & Event Loop",
                "status": "Completed",
                "progress": 100,
                "why_matters": "Enables writing performant asynchronous non-blocking frontend logic.",
                "est_study_time": "6 Hours",
                "difficulty": "Easy",
                "learning_outcome": "Explain event loop, task queue, microtask queue, and closure bindings.",
                "importance": "Critical",
                "resources": [
                    {"name": "JavaScript.info tutorial", "type": "Documentation", "url": "https://javascript.info/"}
                ]
            },
            {
                "phase_num": 2,
                "title": "React Render Lifecycle & hooks",
                "status": "Current",
                "progress": 50,
                "why_matters": "Crucial for preventing memory leaks and unnecessary rerenders.",
                "est_study_time": "8 Hours",
                "difficulty": "Medium",
                "learning_outcome": "Build custom hooks and optimize component tree using useMemo and memo.",
                "importance": "Critical",
                "resources": [
                    {"name": "Official React Documentation", "type": "Documentation", "url": "https://react.dev/"}
                ]
            },
            {
                "phase_num": 3,
                "title": "State Architecture & REST/GraphQL",
                "status": "Locked",
                "progress": 0,
                "why_matters": "Large applications require robust data syncing patterns.",
                "est_study_time": "8 Hours",
                "difficulty": "Hard",
                "learning_outcome": "Design clean state store schemas and integrate optimized API fetching policies.",
                "importance": "High",
                "resources": [
                    {"name": "Zustand State Guide", "type": "Documentation", "url": "https://zustand-demo.pmnd.rs/"}
                ]
            },
            {
                "phase_num": 4,
                "title": "Full Stack Dev Mock Practice",
                "status": "Locked",
                "progress": 0,
                "why_matters": "Live coding tests require clean organization and speed.",
                "est_study_time": "4 Hours",
                "difficulty": "Hard",
                "learning_outcome": "Create a fully functional search dashboard with debouncing and pagination.",
                "importance": "Critical",
                "resources": [
                    {"name": "Frontend Practice boards", "type": "Practice", "url": "https://www.frontendpractice.com/"}
                ]
            }
        ],
        "pipeline": ["Learn Concept", "Watch Video", "Practice Problems", "Take Quiz", "Mock Interview"],
        "progress_metrics": {
            "topics_completed": "5/12 Topics",
            "est_readiness": "72%",
            "days_remaining": "20 Days",
            "current_streak": "4 Days",
            "completion_pct": 40
        }
    },
    "aptitude": {
        "target_role": "Quantitative Analyst",
        "target_company": "Jane Street",
        "readiness_score": 55,
        "est_days": 25,
        "difficulty": "Advanced",
        "summary": "Focuses on logical reasoning, probability, permutation combinations, time-speed-distance, and data interpretation puzzles.",
        "strengths": ["Basic Arithmetic", "Ratio and Proportion", "Puzzles"],
        "weaknesses": [
            {"name": "Probability & Combinatorics", "mastery": "40%", "priority": "High", "est_improvement": "+30%"},
            {"name": "Speed-Time-Distance Problems", "mastery": "45%", "priority": "High", "est_improvement": "+25%"},
            {"name": "Data Sufficiency", "mastery": "50%", "priority": "Medium", "est_improvement": "+15%"}
        ],
        "phases": [
            {
                "phase_num": 1,
                "title": "Speed Arithmetic & Ratios",
                "status": "Completed",
                "progress": 100,
                "why_matters": "Speeds up numerical evaluation during mental arithmetic rounds.",
                "est_study_time": "5 Hours",
                "difficulty": "Easy",
                "learning_outcome": "Solve division and fractional ratios under 15 seconds.",
                "importance": "High",
                "resources": [
                    {"name": "Khan Academy Algebra", "type": "Practice", "url": "https://www.khanacademy.org/"}
                ]
            },
            {
                "phase_num": 2,
                "title": "Probability & Combinatorics",
                "status": "Current",
                "progress": 40,
                "why_matters": "Fundamental math needed for finance modeling and algorithm optimization analysis.",
                "est_study_time": "8 Hours",
                "difficulty": "Medium",
                "learning_outcome": "Calculate permutations of repeated sets and conditional probabilities.",
                "importance": "Critical",
                "resources": [
                    {"name": "Brilliant.org Probability Course", "type": "Practice", "url": "https://brilliant.org/"}
                ]
            },
            {
                "phase_num": 3,
                "title": "Analytical Puzzles & Reasoning",
                "status": "Locked",
                "progress": 0,
                "why_matters": "Tests pure logic and ability to think clearly under stress.",
                "est_study_time": "6 Hours",
                "difficulty": "Hard",
                "learning_outcome": "Resolve network flow logic problems and grid relation puzzles.",
                "importance": "High",
                "resources": [
                    {"name": "Ted-Ed Riddles", "type": "Video", "url": "https://ed.ted.com/"}
                ]
            },
            {
                "phase_num": 4,
                "title": "Citadel/Jane Street Mock Practice",
                "status": "Locked",
                "progress": 0,
                "why_matters": "Prepares for high-stakes trading mental math rounds.",
                "est_study_time": "4 Hours",
                "difficulty": "Hard",
                "learning_outcome": "Solve 80 mental math equations in 8 minutes with 90%+ accuracy.",
                "importance": "Critical",
                "resources": [
                    {"name": "Tradermath Prep Portal", "type": "Practice", "url": "https://www.tradermath.org/"}
                ]
            }
        ],
        "pipeline": ["Learn Concept", "Watch Video", "Practice Problems", "Take Quiz", "Mock Interview"],
        "progress_metrics": {
            "topics_completed": "4/15 Topics",
            "est_readiness": "55%",
            "days_remaining": "25 Days",
            "current_streak": "7 Days",
            "completion_pct": 26
        }
    },
    "hr": {
        "target_role": "Tech Lead / Product Manager",
        "target_company": "Apple",
        "readiness_score": 85,
        "est_days": 8,
        "difficulty": "Easy",
        "summary": "Focuses on the STAR method (Situation, Task, Action, Result) for explaining leadership, conflict resolution, and career progression goals.",
        "strengths": ["Speaking Pacing", "Voice Clarity", "Professional Tone"],
        "weaknesses": [
            {"name": "Explaining Failures (STAR)", "mastery": "70%", "priority": "High", "est_improvement": "+15%"},
            {"name": "Conflict Resolution Examples", "mastery": "65%", "priority": "High", "est_improvement": "+20%"},
            {"name": "Salary Negotiation", "mastery": "60%", "priority": "Medium", "est_improvement": "+15%"}
        ],
        "phases": [
            {
                "phase_num": 1,
                "title": "Self Introduction & Storytelling",
                "status": "Completed",
                "progress": 100,
                "why_matters": "First impressions shape the entire interview direction.",
                "est_study_time": "2 Hours",
                "difficulty": "Easy",
                "learning_outcome": "Deliver a concise 90-second professional summary answering 'Tell me about yourself'.",
                "importance": "Critical",
                "resources": [
                    {"name": "Harvard Business Review Intro", "type": "Documentation", "url": "https://hbr.org/"}
                ]
            },
            {
                "phase_num": 2,
                "title": "STAR Method & Behavioral Banks",
                "status": "Current",
                "progress": 80,
                "why_matters": "Standard methodology expected by all major Tech recruiters.",
                "est_study_time": "3 Hours",
                "difficulty": "Medium",
                "learning_outcome": "Outline stories for conflict, leadership, failure, and collaboration using STAR.",
                "importance": "Critical",
                "resources": [
                    {"name": "Dan Croitor STAR Interview Videos", "type": "Video", "url": "https://www.youtube.com/c/DanCroitor"}
                ]
            },
            {
                "phase_num": 3,
                "title": "Executive Presence & Handling Failure",
                "status": "Locked",
                "progress": 0,
                "why_matters": "Evaluates maturity, self-awareness, and resilience.",
                "est_study_time": "2 Hours",
                "difficulty": "Medium",
                "learning_outcome": "Answer 'What is your greatest weakness' without sounding rehearsed or artificial.",
                "importance": "High",
                "resources": [
                    {"name": "Google Tech Lead Prep Guide", "type": "Documentation", "url": "https://careers.google.com/"}
                ]
            },
            {
                "phase_num": 4,
                "title": "Behavioral Panel Mock Drill",
                "status": "Locked",
                "progress": 0,
                "why_matters": "Prepares you to handle follow-up probing questions calmly.",
                "est_study_time": "2 Hours",
                "difficulty": "Hard",
                "learning_outcome": "Maintain strong eye contact, body language, and structuring during tough behavioral drills.",
                "importance": "Critical",
                "resources": [
                    {"name": "Exponent Behavioral Course", "type": "Video", "url": "https://www.tryexponent.com/"}
                ]
            }
        ],
        "pipeline": ["Learn Concept", "Watch Video", "Practice Problems", "Take Quiz", "Mock Interview"],
        "progress_metrics": {
            "topics_completed": "4/8 Topics",
            "est_readiness": "85%",
            "days_remaining": "8 Days",
            "current_streak": "5 Days",
            "completion_pct": 50
        }
    }
}


@analytics_bp.route("/coach/generate-roadmap", methods=["POST"])
@token_required
def coach_roadmap():
    """Generate a personalized study roadmap"""
    try:
        data = request.get_json() or {}
        custom_topic = data.get("custom_topic", "").strip()

        # Check if they have sessions to identify weak areas
        sessions = analytics_service.get_all_sessions(username=request.username)
        weak_areas = []
        if sessions:
            # Load weak areas
            weak_res = analytics_service.get_weak_areas(username=request.username)
            if weak_res and isinstance(weak_res, list):
                weak_areas = weak_res

        topic_context = custom_topic if custom_topic else "General Software Engineering"
        topic_lower = topic_context.lower()

        # Cache check for instant response path
        matched_key = None
        for key in PREBUILT_ROADMAPS.keys():
            if key in topic_lower:
                matched_key = key
                break
        
        # Fallback to default dbms if empty/default request
        if not custom_topic:
            matched_key = "dbms"

        if matched_key:
            import copy
            parsed = copy.deepcopy(PREBUILT_ROADMAPS[matched_key])
            # Customize target role to match selected profile if sessions exist
            if sessions:
                last_sess = sessions[0]
                if last_sess.get("role"):
                    parsed["target_role"] = last_sess["role"].replace("_", " ").title()
            return jsonify({"success": True, "roadmap": parsed}), 200

        prompt = f"""You are a personalized study guide planner and tech mentor.
        Generate a comprehensive, premium AI Study Roadmap for the following topic: "{topic_context}".
        
        The response MUST be a single valid JSON object containing exactly the following keys:
        1. "target_role": A realistic role name (e.g. "Frontend Engineer", "Full Stack Developer", "Software Engineer").
        2. "target_company": A top tech company name (e.g. "Google", "Microsoft", "Amazon", "Netflix").
        3. "readiness_score": An integer (e.g. 72).
        4. "est_days": An integer representing study time (e.g. 18).
        5. "difficulty": e.g. "Intermediate" or "Advanced".
        6. "summary": A brief, highly professional AI assessment message.
        7. "strengths": A list of 3-4 skills the user is likely strong in (flat strings).
        8. "weaknesses": A list of 3-4 object entities, each with:
           - "name": e.g. "SQL" or "DBMS" or "System Design"
           - "mastery": e.g. "45%" or "60%"
           - "priority": "High" or "Medium" or "Low"
           - "est_improvement": e.g. "+15%" or "+20%"
        9. "phases": A list of exactly 4 study phase objects, each with:
           - "phase_num": e.g. 1, 2, 3, 4
           - "title": e.g. "DBMS Fundamentals" or "Advanced SQL Queries"
           - "status": "Completed" or "Current" or "Locked"
           - "progress": e.g. 100 or 68 or 0
           - "why_matters": "Why this topic is vital for interviews."
           - "est_study_time": e.g. "6 Hours" or "10 Hours"
           - "difficulty": "Easy" or "Medium" or "Hard"
           - "learning_outcome": "What the user will be able to do after studying."
           - "importance": "High" or "Medium" or "Critical"
           - "resources": A list of objects representing free learning platforms (YouTube, GeeksforGeeks, MDN, Microsoft Learn, roadmap.sh). Each resource must have:
             - "name": e.g. "YouTube Tutorials" or "GeeksforGeeks DBMS Guide"
             - "type": "Video" or "Documentation" or "Quiz" or "Practice"
             - "url": A valid domain URL (never use placeholder links, e.g. 'https://youtube.com' or 'https://geeksforgeeks.org').
        10. "pipeline": A list of exactly 5 step names showing the practice pipeline (e.g. ["Learn Concept", "Watch Video", "Practice Problems", "Take Quiz", "Mock Interview"]).
        11. "progress_metrics": A JSON object with the following flat keys:
           - "topics_completed": e.g. "4/12 Topics"
           - "est_readiness": "82%"
           - "days_remaining": "14 Days"
           - "current_streak": "5 Days"
           - "completion_pct": 66
        
        Ensure all output is strictly valid JSON and nothing else."""

        raw_response = gemini_service.generate_content(prompt)
        if not raw_response:
            return jsonify({"error": "AI Mentor is temporarily unavailable"}), 503

        # Clean and parse JSON
        parsed = None
        cleaned = clean_llm_json(raw_response)

        try:
            import json
            parsed = json.loads(cleaned)
            parsed = normalize_roadmap(parsed)
        except Exception as e:
            logger.error(f"Failed to parse premium roadmap response: {e}. Raw: {raw_response}")
            # Dynamic matching local fallback matching the requested structure
            parsed = {
                "target_role": "Software Engineer",
                "target_company": "Google",
                "readiness_score": 72,
                "est_days": 18,
                "difficulty": "Intermediate",
                "summary": "Based on your quiz performance, we generated this targeted learning roadmap focusing on DBMS, SQL queries, and core system design concepts.",
                "strengths": ["Python", "HTML/CSS", "React Frameworks", "Communication Clarity"],
                "weaknesses": [
                    {"name": "SQL & Queries", "mastery": "68%", "priority": "High", "est_improvement": "+15%"},
                    {"name": "DBMS Indexes", "mastery": "50%", "priority": "High", "est_improvement": "+25%"},
                    {"name": "System Design", "mastery": "40%", "priority": "Medium", "est_improvement": "+20%"},
                    {"name": "OS Networks", "mastery": "55%", "priority": "Medium", "est_improvement": "+15%"}
                ],
                "phases": [
                    {
                        "phase_num": 1,
                        "title": "DBMS Fundamentals",
                        "status": "Completed",
                        "progress": 100,
                        "why_matters": "Understanding relational algebra, database models, and transactions is a requirement for core backend questions.",
                        "est_study_time": "4 Hours",
                        "difficulty": "Easy",
                        "learning_outcome": "Define 1NF/2NF/3NF normal forms and draw clear Entity Relationship diagrams.",
                        "importance": "Critical",
                        "resources": [
                            {"name": "freeCodeCamp DBMS Tutorial", "type": "Video", "url": "https://www.youtube.com/watch?v=ztHopE5Wnpc"},
                            {"name": "GeeksforGeeks DBMS Guide", "type": "Documentation", "url": "https://www.geeksforgeeks.org/dbms/"}
                        ]
                    },
                    {
                        "phase_num": 2,
                        "title": "SQL Query Optimization",
                        "status": "Current",
                        "progress": 68,
                        "why_matters": "Companies test candidates on writing complex nested JOINs and subqueries under timed pressure.",
                        "est_study_time": "8 Hours",
                        "difficulty": "Medium",
                        "learning_outcome": "Write optimization routines using indexes and trace query latency factors.",
                        "importance": "Critical",
                        "resources": [
                            {"name": "SQLBolt Practice lessons", "type": "Practice", "url": "https://sqlbolt.com/"},
                            {"name": "Kudvenkat SQL Tutorials", "type": "Video", "url": "https://www.youtube.com/user/kudvenkat"}
                        ]
                    },
                    {
                        "phase_num": 3,
                        "title": "Normalization & Transactions",
                        "status": "Locked",
                        "progress": 0,
                        "why_matters": "ACID properties ensure secure concurrency flow in real-world application backends.",
                        "est_study_time": "6 Hours",
                        "difficulty": "Hard",
                        "learning_outcome": "Audit write-ahead logs and design locking mechanisms for concurrent DB operations.",
                        "importance": "High",
                        "resources": [
                            {"name": "Microsoft Transact-SQL Docs", "type": "Documentation", "url": "https://learn.microsoft.com/"},
                            {"name": "Gate Smashers Normalization lecture", "type": "Video", "url": "https://www.youtube.com/c/GateSmashers"}
                        ]
                    },
                    {
                        "phase_num": 4,
                        "title": "Database Mini Mock Interview",
                        "status": "Locked",
                        "progress": 0,
                        "why_matters": "Simulating spoken technical questions prevents freezing during real interview drills.",
                        "est_study_time": "3 Hours",
                        "difficulty": "Hard",
                        "learning_outcome": "Explain transaction isolation levels orally using structural STAR methodology.",
                        "importance": "Critical",
                        "resources": [
                            {"name": "LeetCode Database problems", "type": "Practice", "url": "https://leetcode.com/problemset/database/"},
                            {"name": "AstraPrep SQL Practice Room", "type": "Quiz", "url": "https://localhost:5173/dashboard/quiz"}
                        ]
                    }
                ],
                "pipeline": ["Learn Concept", "Watch Video", "Read Notes", "Practice Problems", "Take Quiz", "Explain Concept", "Mini Mock Interview"],
                "progress_metrics": {
                    "topics_completed": "4/12 Topics",
                    "est_readiness": "82%",
                    "days_remaining": "14 Days",
                    "current_streak": "5 Days",
                    "completion_pct": 66
                }
            }

        return jsonify({"success": True, "roadmap": parsed}), 200
    except Exception as e:
        logger.error(f"Coach roadmap error: {e}")
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        logger.error(f"Coach roadmap error: {e}")
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/coach/critique-speech", methods=["POST"])
@token_required
def coach_critique():
    """Critique candidate spoken speech sandbox style"""
    try:
        data = request.get_json() or {}
        prompt_text = data.get("prompt", "").strip()
        transcript = data.get("transcript", "").strip()
        wpm = data.get("wpm", 0)
        fillers = data.get("fillers", 0)

        if not transcript:
            return jsonify({"error": "Speech transcript is required"}), 400

        prompt = f"""You are a senior speaking and communication coach.
        Review the candidate's spoken response to the prompt: "{prompt_text}".
        Spoken Transcript: "{transcript}"
        Pacing rate: {wpm} WPM.
        Filler word count: {fillers}.

        Format your critique strictly as a JSON object with the following keys:
        - score: A number from 40 to 100 indicating performance.
        - headline: A short encouraging feedback title (e.g., 'Excellent Pacing, Needs Structure').
        - pacing_critique: Specific advice on their pacing rate (too fast, too slow, or ideal).
        - fillers_critique: Review of their filler word usage with ways to replace them with silent pauses.
        - structural_critique: Did they structure the answer logically? For project/behavioral prompts, check if they used STAR elements.
        - keywords_used: List of technical keywords detected in their speech.
        - tips: List of 3 actionable, bulleted tips for their next practice.
        Ensure the output is valid JSON and nothing else."""

        raw_response = gemini_service.generate_content(prompt)
        if not raw_response:
            return jsonify({"error": "AI Coach is temporarily unavailable"}), 503

        # Clean and parse JSON
        parsed = None
        cleaned = clean_llm_json(raw_response)

        try:
            import json
            parsed = json.loads(cleaned)
        except Exception as e:
            logger.error(f"Failed to parse critique response: {e}. Raw: {raw_response}")
            parsed = {
                "score": 75,
                "headline": "Solid effort - keep practicing",
                "pacing_critique": f"Your pacing of {wpm} WPM is within bounds, but could be cleaner.",
                "fillers_critique": f"Filler word count: {fillers}. Focus on pausing in complete silence.",
                "structural_critique": "Try to structure your answer using the STAR method.",
                "keywords_used": [],
                "tips": ["Record another attempt", "Focus on technical naming", "Pace yourself deliberately"]
            }

        return jsonify({"success": True, "critique": parsed}), 200
    except Exception as e:
        logger.error(f"Coach critique error: {e}")
        return jsonify({"error": str(e)}), 500
