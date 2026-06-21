import os
import sys
import pytest


def test_auth_registration_and_login():
    """Test user registration and login endpoints."""
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    if root not in sys.path:
        sys.path.insert(0, root)
    backend_path = os.path.join(root, "backend")
    if backend_path not in sys.path:
        sys.path.insert(0, backend_path)

    from backend.app import create_app

    app = create_app()
    client = app.test_client()

    # Unique credentials for testing
    import uuid
    username = f"testuser_{uuid.uuid4().hex[:8]}"
    password = "securepassword123"

    # Test Registration: Missing parameters
    resp = client.post("/api/auth/register", json={})
    assert resp.status_code == 400

    # Test Registration: Short password
    resp = client.post("/api/auth/register", json={"username": username, "password": "123"})
    assert resp.status_code == 400

    # Test Registration: Success
    resp = client.post("/api/auth/register", json={"username": username, "password": password})
    assert resp.status_code == 201
    assert "User registered successfully" in resp.get_json()["message"]

    # Test Registration: Duplicate username
    resp = client.post("/api/auth/register", json={"username": username, "password": password})
    assert resp.status_code == 409

    # Test Login: Invalid password
    resp = client.post("/api/auth/login", json={"username": username, "password": "wrongpassword"})
    assert resp.status_code == 401

    # Test Login: Success
    resp = client.post("/api/auth/login", json={"username": username, "password": password})
    assert resp.status_code == 200
    data = resp.get_json()
    assert "Login successful" in data["message"]
    assert "token" in data
    assert data["user"]["username"] == username
