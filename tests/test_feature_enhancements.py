import os
import sys
import pytest

def setup_path():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    if root not in sys.path:
        sys.path.insert(0, root)
    backend_path = os.path.join(root, "backend")
    if backend_path not in sys.path:
        sys.path.insert(0, backend_path)

setup_path()

from ai.star_analyzer import StarAnalyzer
from ai.company_presets import CompanyPresetEngine, COMPANY_PRESETS
from ai.system_design_evaluator import SystemDesignEvaluator, SYSTEM_DESIGN_PROMPTS


@pytest.fixture
def client():
    from backend.app import create_app
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def auth_headers(client):
    reg_data = {"username": "testuser_enhancements", "password": "password123", "full_name": "Test User"}
    client.post("/api/auth/register", json=reg_data)
    login_res = client.post("/api/auth/login", json={"username": "testuser_enhancements", "password": "password123"})
    token = login_res.get_json().get("token")
    return {"Authorization": f"Bearer {token}"}


def test_star_analyzer_basic():
    analyzer = StarAnalyzer()
    res = analyzer.analyze(
        question="Tell me about a time you handled a crisis.",
        answer="Our database crashed on Black Friday. My task was to restore services within 30 minutes. I failed over to the replica and optimized queries. As a result, downtime was kept under 15 minutes and we recovered 99.9% of transactions."
    )
    assert res["situation_score"] >= 0
    assert res["result_score"] >= 0
    assert res["has_quantitative_metrics"] is True
    assert len(res["sentence_breakdown"]) > 0


def test_company_preset_engine():
    engine = CompanyPresetEngine()
    companies = engine.get_companies()
    assert len(companies) >= 6

    amazon = engine.get_company("amazon")
    assert amazon is not None
    assert "Customer Obsession" in amazon["principles"]

    questions = engine.generate_company_questions("amazon", "Software Engineer", 3)
    assert len(questions) == 3
    assert "company" in questions[0]


def test_system_design_evaluator():
    evaluator = SystemDesignEvaluator()
    prompts = evaluator.get_prompts()
    assert len(prompts) >= 4

    res = evaluator.evaluate(
        problem_id="rate-limiter",
        candidate_solution="I will place an API Gateway in front of Redis cluster to implement sliding window rate limiting. Nginx load balancer distributes traffic."
    )
    assert res["architecture_score"] >= 0
    assert res["overall_design_score"] >= 0
    assert "single_points_of_failure" in res
    assert "recommended_mermaid_diagram" in res


def test_star_endpoint(client, auth_headers):
    response = client.post(
        "/api/interview/evaluate-star",
        json={
            "question": "Describe a difficult bug you fixed.",
            "answer": "There was a memory leak in our WebSocket server. I used heap snapshots to trace it to an unclosed listener and fixed it. Reduced RAM usage by 40%."
        },
        headers=auth_headers
    )
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True
    assert "analysis" in json_data


def test_companies_endpoint(client):
    response = client.get("/api/interview/companies")
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True
    assert len(json_data["companies"]) >= 6


def test_company_questions_endpoint(client, auth_headers):
    response = client.post(
        "/api/interview/company-questions",
        json={"company_id": "google", "role": "Site Reliability Engineer", "num_questions": 4},
        headers=auth_headers
    )
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True
    assert len(json_data["questions"]) == 4


def test_system_design_prompts_endpoint(client):
    response = client.get("/api/interview/system-design/prompts")
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True
    assert len(json_data["prompts"]) >= 4


def test_system_design_evaluate_endpoint(client, auth_headers):
    response = client.post(
        "/api/interview/system-design/evaluate",
        json={
            "problem_id": "url-shortener",
            "solution": "We use Base62 encoding with a pre-generated Key Generation Service (KGS) and Cassandra for storage, cached by Redis."
        },
        headers=auth_headers
    )
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True
    assert "evaluation" in json_data
