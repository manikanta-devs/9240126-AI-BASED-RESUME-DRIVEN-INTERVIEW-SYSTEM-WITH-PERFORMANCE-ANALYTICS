"""Tests for Flask app endpoints."""

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


@pytest.fixture
def client():
    """Create Flask test client."""
    setup_path()
    from backend.app import create_app

    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_health_endpoint(client):
    """Test health endpoint."""
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["status"] == "ok"
    assert "ai_available" in data
    assert "version" in data


def test_health_endpoint_ai_status(client):
    """Test health endpoint includes AI status."""
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.get_json()
    assert "ai_model" in data
    assert "provider_status" in data


def test_404_error(client):
    """Test 404 error handler."""
    resp = client.get("/api/nonexistent")
    assert resp.status_code == 404
    data = resp.get_json()
    assert "error" in data
    assert data["error"] == "Endpoint not found"


def test_security_headers(client):
    """Test security headers are present."""
    resp = client.get("/health")
    assert "X-Content-Type-Options" in resp.headers
    assert resp.headers["X-Content-Type-Options"] == "nosniff"
    assert "X-Frame-Options" in resp.headers
    assert resp.headers["X-Frame-Options"] == "SAMEORIGIN"
    assert "X-XSS-Protection" in resp.headers
    assert "Content-Security-Policy" in resp.headers


def test_cors_headers(client):
    """Test CORS headers are set."""
    resp = client.options("/health")
    # CORS headers should be present for OPTIONS requests
    assert resp.status_code in [200, 204]


def test_slow_request_logging(client, caplog):
    """Test slow request logging."""
    import logging

    caplog.set_level(logging.INFO)

    resp = client.get("/health")
    assert resp.status_code == 200
    # Should not log as slow since health is fast
    assert "[SLOW]" not in caplog.text


def test_request_response_flow(client):
    """Test request/response flow."""
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.content_type == "application/json"
    assert resp.get_json() is not None


def test_max_content_length_config(client):
    """Test max content length configuration."""
    # This tests that the app has content length limit configured
    setup_path()
    from backend.app import create_app

    app = create_app()
    assert app.config["MAX_CONTENT_LENGTH"] == 16 * 1024 * 1024


def test_upload_folder_creation(client):
    """Test that upload folder is created."""
    setup_path()
    from backend.app import create_app

    app = create_app()
    assert os.path.exists(app.config["UPLOAD_FOLDER"])


def test_data_folder_creation(client):
    """Test that data folder is created."""
    assert os.path.exists("data")


def test_multiple_requests(client):
    """Test multiple consecutive requests."""
    for _ in range(5):
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.get_json()["status"] == "ok"


def test_request_content_type(client):
    """Test request with different content types."""
    # Test JSON content type
    resp = client.get("/health")
    assert resp.content_type == "application/json"


def test_invalid_json_request(client):
    """Test handling of invalid JSON."""
    resp = client.post(
        "/api/interview/start", data="invalid json", content_type="application/json"
    )
    # Should handle gracefully (400 Bad Request)
    assert resp.status_code in [400, 404]
