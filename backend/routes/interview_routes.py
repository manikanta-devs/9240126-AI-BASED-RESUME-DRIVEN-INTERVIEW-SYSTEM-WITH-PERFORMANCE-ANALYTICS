from flask import Blueprint, request, jsonify
import logging
import uuid

from services.interview_service import InterviewService
from ai.question_generator import QuestionGenerator
from ai.answer_evaluator import AnswerEvaluator

logger = logging.getLogger(__name__)
interview_bp = Blueprint("interview", __name__)
interview_service = InterviewService()
question_generator = QuestionGenerator()
answer_evaluator = AnswerEvaluator()


def safe_int(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


@interview_bp.route("/interview/generate-questions", methods=["POST"])
def generate_questions():
    """Generate interview questions from resume data or role"""
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "No data provided"}), 400

        resume_data = data.get("resume_data", {})
        role = data.get("role", "software_engineer")
        difficulty = data.get("difficulty", "medium")
        num_questions = min(safe_int(data.get("num_questions", 8), 8), 10)

        panel_mode = data.get("panel_mode", False)

        skills = resume_data.get("skills", {}).get("all", []) if isinstance(resume_data, dict) else []
        logger.info(
            f"Generating questions: role={role}, difficulty={difficulty}, skills={skills[:10]}, has_resume={'yes' if skills else 'no'}, panel_mode={panel_mode}"
        )

        questions = question_generator.generate(
            resume_data=resume_data,
            role=role,
            difficulty=difficulty,
            num_questions=num_questions,
            panel_mode=panel_mode,
        )

        return jsonify({"success": True, "questions": questions, "total": len(questions)}), 200

    except Exception as e:
        logger.error(f"Question generation error: {e}")
        return jsonify({"error": str(e)}), 500


@interview_bp.route("/interview/start", methods=["POST"])
def start_interview():
    """Start a new interview session"""
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "No data provided"}), 400

        session_id = str(uuid.uuid4())
        questions = data.get("questions", [])
        resume_data = data.get("resume_data", {})
        role = data.get("role", "software_engineer")
        candidate_name = data.get("candidate_name", "Candidate")
        interview_format = data.get("interview_format", "voice")
        difficulty = data.get("difficulty", "medium")
        panel_mode = data.get("panel_mode", False)

        if not questions:
            return jsonify({"error": "No questions provided"}), 400

        interview_service.create_session(
            session_id=session_id,
            questions=questions,
            resume_data=resume_data,
            role=role,
            candidate_name=candidate_name,
            interview_format=interview_format,
            difficulty=difficulty,
            panel_mode=panel_mode,
        )

        first_question = questions[0] if questions else None

        return (
            jsonify(
                {
                    "success": True,
                    "session_id": session_id,
                    "current_question": first_question,
                    "question_index": 0,
                    "total_questions": len(questions),
                    "candidate_name": candidate_name,
                    "interview_format": interview_format,
                }
            ),
            200,
        )

    except Exception as e:
        logger.error(f"Start interview error: {e}")
        return jsonify({"error": str(e)}), 500


@interview_bp.route("/interview/answer", methods=["POST"])
def submit_answer():
    """Submit an answer and get evaluation + next question"""
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "No data provided"}), 400

        session_id = data.get("session_id")
        answer = data.get("answer", "").strip()
        question_index = safe_int(data.get("question_index", 0), 0)
        voice_metrics = data.get("voice_metrics", {}) or {}
        emotion_metrics = data.get("emotion_metrics", {}) or {}

        if not session_id:
            return jsonify({"error": "Session ID required"}), 400

        session = interview_service.get_session(session_id)
        if not session:
            return jsonify({"error": "Session not found or expired"}), 404

        if not answer:
            return jsonify({"error": "Answer cannot be empty"}), 400

        if question_index < 0 or question_index >= len(session["questions"]):
            return jsonify({"error": "Question index out of range"}), 400

        current_question = session["questions"][question_index]

        # Collect previous scores for adaptive difficulty
        previous_scores = []
        for ans in session.get("answers", []):
            ev = ans.get("evaluation", {})
            if ev.get("overall_score"):
                previous_scores.append(ev["overall_score"])

        # Evaluate the answer with previous scores for adaptive difficulty
        evaluation = answer_evaluator.evaluate(
            question=current_question,
            answer=answer,
            role=session.get("role", "software_engineer"),
            voice_metrics=voice_metrics,
            emotion_metrics=emotion_metrics,
            previous_scores=previous_scores,
        )

        # Store the answer + evaluation
        interview_service.add_answer(
            session_id,
            {
                "question_index": question_index,
                "question": current_question,
                "answer": answer,
                "voice_metrics": voice_metrics,
                "emotion_metrics": emotion_metrics,
                "evaluation": evaluation,
            },
        )

        # Determine next question
        next_index = question_index + 1
        total = len(session["questions"])
        is_complete = next_index >= total

        difficulty_adjustment = evaluation.get("difficulty_adjustment", "maintain")
        if not is_complete and difficulty_adjustment != "maintain":
            diff_levels = ["easy", "medium", "hard"]
            current_diff = session.get("difficulty", "medium")
            try:
                curr_idx = diff_levels.index(current_diff)
                new_idx = curr_idx + 1 if difficulty_adjustment == "increase" else curr_idx - 1
                new_idx = max(0, min(2, new_idx))
                new_diff = diff_levels[new_idx]

                if new_diff != current_diff:
                    remaining_count = total - next_index
                    new_questions = question_generator.generate(
                        resume_data=session.get("resume_data", {}),
                        role=session.get("role", "software_engineer"),
                        difficulty=new_diff,
                        num_questions=remaining_count,
                        panel_mode=session.get("panel_mode", False),
                    )
                    if new_questions:
                        for i, nq in enumerate(new_questions):
                            nq["id"] = next_index + i + 1
                        session["questions"][next_index:] = new_questions
                        session["difficulty"] = new_diff
                        interview_service.save_session(session_id, session)
            except Exception as e:
                logger.error(f"Adaptive regeneration failed: {e}")

        next_question = session["questions"][next_index] if not is_complete else None

        return (
            jsonify(
                {
                    "success": True,
                    "evaluation": evaluation,
                    "next_question": next_question,
                    "next_index": next_index,
                    "is_complete": is_complete,
                    "progress": round((next_index / total) * 100),
                    "difficulty_adjustment": evaluation.get("difficulty_adjustment", "maintain"),
                    "updated_questions": (
                        session["questions"] if (not is_complete and difficulty_adjustment != "maintain") else None
                    ),
                }
            ),
            200,
        )

    except Exception as e:
        logger.error(f"Submit answer error: {e}")
        return jsonify({"error": str(e)}), 500


@interview_bp.route("/interview/follow-up", methods=["POST"])
def generate_follow_up():
    """Generate a personalized follow-up question based on the answer"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        session_id = data.get("session_id")
        question = data.get("question", {})
        answer = data.get("answer", "")
        evaluation = data.get("evaluation", {})

        if not session_id:
            return jsonify({"error": "Session ID required"}), 400

        session = interview_service.get_session(session_id)
        if not session:
            return jsonify({"error": "Session not found"}), 404

        follow_up = answer_evaluator.generate_follow_up(
            question=question, answer=answer, evaluation=evaluation, role=session.get("role", "software_engineer")
        )

        return jsonify({"success": True, "follow_up_question": follow_up}), 200

    except Exception as e:
        logger.error(f"Follow-up generation error: {e}")
        return jsonify({"error": str(e)}), 500


@interview_bp.route("/interview/complete", methods=["POST"])
def complete_interview():
    """Complete the interview and get full results"""
    try:
        data = request.get_json(silent=True) or {}
        session_id = data.get("session_id")

        if not session_id:
            return jsonify({"error": "Session ID required"}), 400

        session = interview_service.get_session(session_id)
        if not session:
            return jsonify({"error": "Session not found"}), 404

        results = interview_service.complete_session(session_id)

        return jsonify({"success": True, "results": results}), 200

    except Exception as e:
        logger.error(f"Complete interview error: {e}")
        return jsonify({"error": str(e)}), 500


@interview_bp.route("/interview/sessions", methods=["GET"])
def get_sessions():
    """Get all interview sessions"""
    try:
        sessions = interview_service.get_all_sessions()
        return jsonify({"success": True, "sessions": sessions}), 200
    except Exception as e:
        logger.error(f"Get sessions error: {e}")
        return jsonify({"error": str(e)}), 500


@interview_bp.route("/interview/session/<session_id>", methods=["GET"])
def get_session(session_id):
    """Get a specific interview session"""
    try:
        session = interview_service.get_session(session_id)
        if not session:
            return jsonify({"error": "Session not found"}), 404
        return jsonify({"success": True, "session": session}), 200
    except Exception as e:
        logger.error(f"Get session error: {e}")
        return jsonify({"error": str(e)}), 500


@interview_bp.route("/interview/session/<session_id>", methods=["DELETE"])
def delete_session(session_id):
    """Delete an interview session"""
    try:
        interview_service.delete_session(session_id)
        return jsonify({"success": True, "message": "Session deleted"}), 200
    except Exception as e:
        logger.error(f"Delete session error: {e}")
        return jsonify({"error": str(e)}), 500
