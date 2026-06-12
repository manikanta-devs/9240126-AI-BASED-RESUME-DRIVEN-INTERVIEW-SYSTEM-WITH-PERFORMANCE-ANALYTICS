"""Tests for validators module."""
import os
import sys
import pytest


def setup_path():
    """Setup sys.path for imports."""
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    if root not in sys.path:
        sys.path.insert(0, root)
    backend_path = os.path.join(root, "backend")
    if backend_path not in sys.path:
        sys.path.insert(0, backend_path)


def test_resume_upload_valid():
    """Test valid resume upload request."""
    setup_path()
    from backend.validators import ResumeUploadRequest
    
    req = ResumeUploadRequest(job_role="Software Engineer")
    assert req.job_role == "Software Engineer"
    assert req.experience_level == "mid"


def test_resume_upload_empty_role():
    """Test resume upload with empty role."""
    setup_path()
    from backend.validators import ResumeUploadRequest
    from pydantic import ValidationError
    
    with pytest.raises(ValidationError):
        ResumeUploadRequest(job_role="")


def test_interview_request_valid():
    """Test valid interview request."""
    setup_path()
    from backend.validators import InterviewRequest
    
    req = InterviewRequest(
        job_role="Data Scientist",
        num_questions=7
    )
    assert req.job_role == "Data Scientist"
    assert req.num_questions == 7
    assert req.interview_type == "text"


def test_interview_request_invalid_questions():
    """Test interview request with invalid question count."""
    setup_path()
    from backend.validators import InterviewRequest
    from pydantic import ValidationError
    
    with pytest.raises(ValidationError):
        InterviewRequest(job_role="Engineer", num_questions=15)


def test_interview_request_invalid_type():
    """Test interview request with invalid type."""
    setup_path()
    from backend.validators import InterviewRequest
    from pydantic import ValidationError
    
    with pytest.raises(ValidationError):
        InterviewRequest(job_role="Engineer", interview_type="invalid")


def test_question_request_valid():
    """Test valid question request."""
    setup_path()
    from backend.validators import QuestionRequest
    
    req = QuestionRequest(job_role="DevOps")
    assert req.job_role == "DevOps"
    assert req.num_questions == 3


def test_answer_evaluation_request_valid():
    """Test valid answer evaluation request."""
    setup_path()
    from backend.validators import AnswerEvaluationRequest
    
    req = AnswerEvaluationRequest(
        question="What is Python?",
        answer="Python is a programming language.",
        job_role="Engineer"
    )
    assert req.job_role == "Engineer"


def test_quiz_request_valid():
    """Test valid quiz request."""
    setup_path()
    from backend.validators import QuizRequest
    
    req = QuizRequest(
        topic="Python Basics",
        difficulty="easy",
        num_questions=20
    )
    assert req.topic == "Python Basics"
    assert req.difficulty == "easy"


def test_quiz_request_invalid_difficulty():
    """Test quiz request with invalid difficulty."""
    setup_path()
    from backend.validators import QuizRequest
    from pydantic import ValidationError
    
    with pytest.raises(ValidationError):
        QuizRequest(topic="Python", difficulty="super_hard")


def test_analytics_query_request_valid():
    """Test valid analytics query request."""
    setup_path()
    from backend.validators import AnalyticsQueryRequest
    
    req = AnalyticsQueryRequest(
        limit=50
    )
    assert req.limit == 50


def test_analytics_query_request_invalid_limit():
    """Test analytics query with invalid limit."""
    setup_path()
    from backend.validators import AnalyticsQueryRequest
    from pydantic import ValidationError
    
    with pytest.raises(ValidationError):
        AnalyticsQueryRequest(limit=5000)
