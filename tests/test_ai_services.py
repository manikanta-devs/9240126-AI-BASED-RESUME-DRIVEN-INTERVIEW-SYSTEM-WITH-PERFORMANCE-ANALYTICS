"""Tests for AI services including QuestionGenerator and AnswerEvaluator."""

import os
import sys
from unittest.mock import MagicMock, patch
import pytest


def setup_path():
    """Setup sys.path for imports."""
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    if root not in sys.path:
        sys.path.insert(0, root)
    backend_path = os.path.join(root, "backend")
    if backend_path not in sys.path:
        sys.path.insert(0, backend_path)


setup_path()
from backend.ai.question_generator import QuestionGenerator  # noqa: E402
from backend.ai.answer_evaluator import AnswerEvaluator  # noqa: E402


@pytest.fixture
def mock_gemini_service():
    """Mock GeminiService to prevent real API calls."""
    with patch("backend.ai.question_generator.GeminiService") as mock_q_gemini, patch(
        "backend.ai.answer_evaluator.GeminiService"
    ) as mock_ae_gemini:
        # Create instances that will be returned
        q_gemini_inst = MagicMock()
        ae_gemini_inst = MagicMock()

        mock_q_gemini.return_value = q_gemini_inst
        mock_ae_gemini.return_value = ae_gemini_inst

        yield q_gemini_inst, ae_gemini_inst


def test_question_generator_fallback_offline():
    """Test QuestionGenerator fallback questions when Gemini is unavailable."""
    with patch("backend.ai.question_generator.GeminiService") as mock_gemini:
        gemini_inst = MagicMock()
        gemini_inst.is_available.return_value = False
        mock_gemini.return_value = gemini_inst

        generator = QuestionGenerator()
        resume_data = {
            "skills": {"all": ["Python", "Flask", "React"]},
            "experience": {
                "years": 2,
                "level": "junior",
                "titles": ["Frontend Developer"],
            },
            "education": ["BS in Computer Science"],
        }

        # Test generation without panel mode
        questions = generator.generate(
            resume_data=resume_data,
            role="software_engineer",
            difficulty="medium",
            num_questions=5,
            panel_mode=False,
        )

        assert len(questions) == 5
        for q in questions:
            assert "id" in q
            assert "text" in q
            assert "category" in q
            assert "difficulty" in q
            assert "type" in q
            assert "persona_id" not in q or q["persona_id"] is None

        # Test generation with panel mode (should assign personas)
        questions_panel = generator.generate(
            resume_data=resume_data,
            role="software_engineer",
            difficulty="medium",
            num_questions=5,
            panel_mode=True,
        )

        assert len(questions_panel) == 5
        for q in questions_panel:
            assert "persona_id" in q
            assert q["persona_id"] in ["technical_lead", "hr_manager", "strict_manager"]


def test_question_generator_with_gemini():
    """Test QuestionGenerator when Gemini is available and returns valid data."""
    with patch("backend.ai.question_generator.GeminiService") as mock_gemini:
        gemini_inst = MagicMock()
        gemini_inst.is_available.return_value = True
        mock_questions = [
            {
                "id": 1,
                "text": "What is Python's GIL?",
                "category": "Python",
                "difficulty": "medium",
                "type": "technical",
            },
            {
                "id": 2,
                "text": "Explain a time you resolved a conflict.",
                "category": "Behavioral",
                "difficulty": "easy",
                "type": "behavioral",
            },
        ]
        gemini_inst.generate_json.return_value = mock_questions
        mock_gemini.return_value = gemini_inst

        generator = QuestionGenerator()
        resume_data = {"skills": {"all": ["Python"]}}
        questions = generator.generate(
            resume_data=resume_data,
            role="software_engineer",
            difficulty="medium",
            num_questions=2,
        )

        assert len(questions) == 2
        assert questions[0]["text"] == "What is Python's GIL?"
        assert questions[1]["category"] == "Behavioral"


def test_answer_evaluator_fallback_offline():
    """Test AnswerEvaluator smart fallback when Gemini is unavailable."""
    with patch("backend.ai.answer_evaluator.GeminiService") as mock_gemini:
        gemini_inst = MagicMock()
        gemini_inst.is_available.return_value = False
        mock_gemini.return_value = gemini_inst

        evaluator = AnswerEvaluator()
        question = {
            "text": "Explain the difference between shallow copy and deep copy.",
            "category": "Core Concepts",
            "type": "technical",
        }

        # Short answer evaluation
        short_ans = "A shallow copy copies reference, deep copy copies values."
        result_short = evaluator.evaluate(question, short_ans, role="software_engineer")

        assert result_short["overall_score"] < 60
        assert "brief" in result_short["feedback"].lower()
        assert len(result_short["live_tips"]) > 0

        # Long answer evaluation with quality signals
        long_ans = (
            "First, a shallow copy constructs a new compound object and then inserts "
            "references into it to the objects found in the original. "
            "For example, in Python using copy.copy(). "
            "Second, a deep copy constructs a new compound object and then, recursively, "
            "inserts copies into it of the objects found in the original. "
            "However, the trade-off is higher memory usage and execution time. "
            "In my previous project, we achieved a 20% performance improvement by using shallow copy "
            "when modifying outer properties only, which reduced garbage collection cycles."
        )

        result_long = evaluator.evaluate(question, long_ans, role="software_engineer")
        assert result_long["overall_score"] > 60
        assert "Uses real examples" in result_long["strong_areas"]
        assert "Well-structured response" in result_long["strong_areas"]
        assert "Quantified impact" in result_long["strong_areas"]


def test_answer_evaluator_with_gemini():
    """Test AnswerEvaluator validation and normalization when Gemini is available."""
    with patch("backend.ai.answer_evaluator.GeminiService") as mock_gemini:
        gemini_inst = MagicMock()
        gemini_inst.is_available.return_value = True

        mock_eval = {
            "technical_score": 85,
            "clarity_score": 90,
            "completeness_score": 80,
            "overall_score": 85,
            "topic": "Python",
            "strong_areas": ["Clear concepts", "Used examples"],
            "weak_areas": ["No metrics"],
            "feedback": "Great explanation of shallow vs deep copy.",
            "difficulty_adjustment": "increase",
            "speaking_pace_wpm": 130,
            "filler_word_count": 2,
        }
        gemini_inst.generate_json.return_value = mock_eval
        mock_gemini.return_value = gemini_inst

        evaluator = AnswerEvaluator()
        question = {"text": "Explain shallow vs deep copy."}
        result = evaluator.evaluate(question, "Some answer text")

        assert result["technical_score"] == 85
        assert result["clarity_score"] == 90
        assert result["overall_score"] == 85
        assert result["speaking_pace_wpm"] == 130
        assert result["filler_word_count"] == 2
        assert result["difficulty_adjustment"] == "increase"
        assert len(result["strong_areas"]) == 2
        assert "No metrics" in result["weak_areas"]


def test_answer_evaluator_follow_up():
    """Test follow-up question generation for both Gemini and fallback paths."""
    with patch("backend.ai.answer_evaluator.GeminiService") as mock_gemini:
        gemini_inst = MagicMock()
        mock_gemini.return_value = gemini_inst

        evaluator = AnswerEvaluator()
        question = {"text": "Explain React hooks."}
        answer = "They let you use state without writing a class."
        evaluation = {"topic": "React Hooks", "overall_score": 75, "weak_areas": ["Custom hooks"]}

        # 1. Fallback path
        gemini_inst.is_available.return_value = False
        follow_up_fb = evaluator.generate_follow_up(question, answer, evaluation)
        assert follow_up_fb["is_follow_up"] is True
        assert "parent_question" in follow_up_fb

        # 2. Gemini path
        gemini_inst.is_available.return_value = True
        mock_follow_up = {
            "text": "How do you build a custom Hook to share logic?",
            "category": "React Hooks",
            "type": "technical",
            "difficulty": "hard",
        }
        gemini_inst.generate_json.return_value = mock_follow_up
        follow_up_gem = evaluator.generate_follow_up(question, answer, evaluation)

        assert follow_up_gem["text"] == "How do you build a custom Hook to share logic?"
        assert follow_up_gem["is_follow_up"] is True


def test_question_generator_with_company():
    """Test QuestionGenerator when company and company_context are provided."""
    with patch("backend.ai.question_generator.GeminiService") as mock_gemini:
        gemini_inst = MagicMock()
        gemini_inst.is_available.return_value = True
        mock_questions = [
            {
                "id": 1,
                "text": "Tell me about a time you applied Amazon's Customer Obsession principle.",
                "category": "Behavioral",
                "difficulty": "medium",
                "type": "behavioral",
            }
        ]
        gemini_inst.generate_json.return_value = mock_questions
        mock_gemini.return_value = gemini_inst

        generator = QuestionGenerator()
        resume_data = {"skills": {"all": ["Python"]}}
        questions = generator.generate(
            resume_data=resume_data,
            role="software_engineer",
            difficulty="medium",
            num_questions=1,
            company="Amazon",
            company_context="AWS S3 team",
        )

        assert len(questions) == 1
        assert "Customer Obsession" in questions[0]["text"]
        called_args = gemini_inst.generate_json.call_args[0][0]
        assert "Amazon" in called_args
        assert "AWS S3" in called_args


def test_quiz_service_dynamic_generation():
    """Test QuizService dynamic question generation using Gemini."""
    from backend.services.quiz_service import QuizService

    with patch("backend.services.quiz_service.GeminiService") as mock_gemini:
        gemini_inst = MagicMock()
        gemini_inst.is_available.return_value = True
        mock_mcq = [
            {
                "question": "What is the output of print(2 ** 3)?",
                "options": ["6", "8", "9", "12"],
                "correct_index": 1,
                "explanation": "2 raised to power 3 is 8.",
                "option_feedback": ["Incorrect", "Correct", "Incorrect", "Incorrect"]
            }
        ]
        gemini_inst.generate_json.return_value = mock_mcq
        mock_gemini.return_value = gemini_inst

        service = QuizService()
        questions = service.build_questions(topic="Python", difficulty="medium", num_questions=1)

        assert len(questions) == 1
        assert questions[0]["question"] == "What is the output of print(2 ** 3)?"
        assert questions[0]["correct_index"] == 1
        assert questions[0]["options"] == ["6", "8", "9", "12"]
        assert questions[0]["explanation"] == "2 raised to power 3 is 8."


def test_quiz_service_fallback():
    """Test QuizService fallback when Gemini is offline."""
    from backend.services.quiz_service import QuizService

    with patch("backend.services.quiz_service.GeminiService") as mock_gemini:
        gemini_inst = MagicMock()
        gemini_inst.is_available.return_value = False
        mock_gemini.return_value = gemini_inst

        service = QuizService()
        questions = service.build_questions(topic="python", difficulty="medium", num_questions=2)

        assert len(questions) == 2
        for q in questions:
            assert q["topic"] == "python"
            assert q["difficulty"] == "medium"
