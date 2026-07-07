import os
import sys
import pytest
from unittest.mock import patch, MagicMock

# Setup path for imports
root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root not in sys.path:
    sys.path.insert(0, root)
backend_path = os.path.join(root, "backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from backend.services.analytics_service import AnalyticsService
from backend.app import create_app

@pytest.fixture
def test_client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

# Sample Mock Data
MOCK_COMPLETED_SESSIONS = [
    {
        "id": "sess_1",
        "candidate_name": "Test Candidate",
        "role": "software_engineer",
        "interview_format": "voice",
        "status": "completed",
        "completed_at": "2026-06-15T12:00:00Z",
        "questions": [
            {"id": 1, "text": "What is clean code?", "category": "General", "difficulty": "easy", "type": "behavioral", "persona_id": None}
        ],
        "answers": [
            {
                "question_index": 0,
                "answer": "Clean code is readable and maintainable.",
                "voice_metrics": {"speaking_pace_wpm": 120, "word_count": 8},
                "emotion_metrics": {},
                "evaluation": {
                    "topic": "Clean Code",
                    "technical_score": 85,
                    "clarity_score": 90,
                    "voice_delivery_score": 88,
                    "confidence_score": 92,
                    "structure_score": 85,
                    "filler_word_count": 2,
                    "weak_areas": ["brevity"]
                }
            }
        ],
        "results": {
            "scores": {
                "overall": 85,
                "technical": 80,
                "clarity": 90
            },
            "weak_areas": ["brevity"],
            "strong_areas": ["clarity"],
            "grade": "B+",
            "total_questions": 1,
            "answered_questions": 1,
            "duration_minutes": 5
        }
    },
    {
        "id": "sess_2",
        "candidate_name": "Test Candidate",
        "role": "software_engineer",
        "interview_format": "voice",
        "status": "completed",
        "completed_at": "2026-06-16T12:00:00Z",
        "questions": [
            {"id": 1, "text": "Describe dependency injection.", "category": "Design", "difficulty": "medium", "type": "technical", "persona_id": None}
        ],
        "answers": [
            {
                "question_index": 0,
                "answer": "Dependency injection is passing dependencies to a class.",
                "voice_metrics": {"speaking_pace_wpm": 140, "word_count": 12},
                "emotion_metrics": {},
                "evaluation": {
                    "topic": "Architecture",
                    "technical_score": 95,
                    "clarity_score": 80,
                    "voice_delivery_score": 82,
                    "confidence_score": 85,
                    "structure_score": 90,
                    "filler_word_count": 0,
                    "weak_areas": ["examples"]
                }
            }
        ],
        "results": {
            "scores": {
                "overall": 90,
                "technical": 95,
                "clarity": 80
            },
            "weak_areas": ["examples"],
            "strong_areas": ["technical depth"],
            "grade": "A",
            "total_questions": 1,
            "answered_questions": 1,
            "duration_minutes": 6
        }
    }
]

def test_get_summary_empty():
    """Test analytics summary calculation when there are no sessions."""
    service = AnalyticsService()
    with patch("services.database.get_all_sessions", return_value=[]):
        summary = service.get_summary()
        assert summary["total_sessions"] == 0
        assert summary["avg_overall"] == 0
        assert summary["avg_technical"] == 0
        assert summary["avg_clarity"] == 0
        assert summary["best_score"] == 0

def test_get_summary_calculations():
    """Test analytics summary calculation logic with mock sessions."""
    service = AnalyticsService()
    with patch("services.database.get_all_sessions", return_value=MOCK_COMPLETED_SESSIONS):
        summary = service.get_summary()
        assert summary["total_sessions"] == 2
        assert summary["avg_overall"] == 87.5
        assert summary["avg_technical"] == 87.5
        assert summary["avg_clarity"] == 85.0
        assert summary["best_score"] == 90
        assert summary["worst_score"] == 85
        assert summary["most_common_role"] == "software_engineer"

def test_get_performance_trend():
    """Test trend list extraction logic."""
    service = AnalyticsService()
    with patch("services.database.get_all_sessions", return_value=MOCK_COMPLETED_SESSIONS):
        trend = service.get_performance_trend()
        assert len(trend) == 2
        assert trend[0]["overall"] == 85
        assert trend[1]["overall"] == 90
        assert trend[0]["date"] == "2026-06-15"

def test_get_weak_areas():
    """Test aggregation of weak areas."""
    service = AnalyticsService()
    with patch("services.database.get_all_sessions", return_value=MOCK_COMPLETED_SESSIONS):
        weak = service.get_weak_areas()
        assert len(weak) == 2
        assert any(w["area"] == "brevity" for w in weak)
        assert any(w["area"] == "examples" for w in weak)

def test_get_skill_breakdown():
    """Test skill-wise category breakdown scores."""
    service = AnalyticsService()
    with patch("services.database.get_all_sessions", return_value=MOCK_COMPLETED_SESSIONS):
        breakdown = service.get_skill_breakdown()
        assert len(breakdown) == 2
        assert breakdown[0]["skill"] in ["Architecture", "Clean Code"]
        assert breakdown[0]["avg_score"] in [85.0, 95.0]

def test_get_study_plan_generation():
    """Test study plan algorithm behaves correctly."""
    service = AnalyticsService()
    with patch("services.database.get_all_sessions", return_value=MOCK_COMPLETED_SESSIONS):
        plan = service.get_study_plan()
        assert "plan_title" in plan
        assert "weekly_goal" in plan
        assert len(plan["days"]) == 7
        assert plan["avg_overall"] == 87.5


def test_get_dashboard_insights_generation():
    """Test production dashboard insights are derived from real sessions."""
    service = AnalyticsService()
    with patch("services.database.get_all_sessions", return_value=MOCK_COMPLETED_SESSIONS):
        insights = service.get_dashboard_insights()
        assert insights["has_data"] is True
        assert insights["practice_minutes"] == 11
        assert insights["trend_delta"] == 5
        assert insights["trend_direction"] == "up"
        assert insights["top_focus"] in ["brevity", "examples"]
        assert len(insights["heatmap_weeks"]) == 15
        assert len(insights["recent_sessions"]) == 2
def test_get_communication_coach_generation():
    """Test communication coach recommendations engine."""
    service = AnalyticsService()
    with patch("services.database.get_all_sessions", return_value=MOCK_COMPLETED_SESSIONS):
        coach = service.get_communication_coach()
        assert "headline" in coach
        assert "summary" in coach
        assert "clarity" in coach["summary"].lower()
        assert len(coach["focus_modes"]) > 0

# --- Route Tests ---

def test_route_summary(test_client):
    """Test Flask endpoint /api/analytics/summary"""
    with patch("services.database.get_all_sessions", return_value=MOCK_COMPLETED_SESSIONS):
        resp = test_client.get("/api/analytics/summary")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert data["summary"]["total_sessions"] == 2

def test_route_sessions(test_client):
    """Test Flask endpoint /api/analytics/sessions"""
    with patch("services.database.get_all_sessions", return_value=MOCK_COMPLETED_SESSIONS):
        resp = test_client.get("/api/analytics/sessions")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert len(data["sessions"]) == 2


def test_route_dashboard_insights(test_client):
    """Test Flask endpoint /api/analytics/dashboard-insights."""
    with patch("services.database.get_all_sessions", return_value=MOCK_COMPLETED_SESSIONS):
        resp = test_client.get("/api/analytics/dashboard-insights")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert data["insights"]["has_data"] is True
        assert data["insights"]["trend_direction"] == "up"
def test_route_performance_trend(test_client):
    """Test Flask endpoint /api/analytics/performance-trend"""
    with patch("services.database.get_all_sessions", return_value=MOCK_COMPLETED_SESSIONS):
        resp = test_client.get("/api/analytics/performance-trend")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert len(data["trend"]) == 2

def test_route_weak_areas(test_client):
    """Test Flask endpoint /api/analytics/weak-areas"""
    with patch("services.database.get_all_sessions", return_value=MOCK_COMPLETED_SESSIONS):
        resp = test_client.get("/api/analytics/weak-areas")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert len(data["weak_areas"]) == 2

def test_route_skill_breakdown(test_client):
    """Test Flask endpoint /api/analytics/skill-breakdown"""
    with patch("services.database.get_all_sessions", return_value=MOCK_COMPLETED_SESSIONS):
        resp = test_client.get("/api/analytics/skill-breakdown")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert len(data["breakdown"]) == 2

def test_route_study_plan(test_client):
    """Test Flask endpoint /api/analytics/study-plan"""
    with patch("services.database.get_all_sessions", return_value=MOCK_COMPLETED_SESSIONS):
        resp = test_client.get("/api/analytics/study-plan")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert "study_plan" in data

def test_route_communication_coach(test_client):
    """Test Flask endpoint /api/analytics/communication-coach"""
    with patch("services.database.get_all_sessions", return_value=MOCK_COMPLETED_SESSIONS):
        resp = test_client.get("/api/analytics/communication-coach")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert "communication_coach" in data
