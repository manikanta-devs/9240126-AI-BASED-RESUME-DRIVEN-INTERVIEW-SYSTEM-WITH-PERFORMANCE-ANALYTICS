import os
import sys


def test_health_endpoint():
    """Smoke test for the /health endpoint."""
    # Ensure project root is on sys.path for imports when pytest is run from workspace root
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    if root not in sys.path:
        sys.path.insert(0, root)

    # Ensure backend package path is available (app imports top-level `routes` package)
    backend_path = os.path.join(root, "backend")
    if backend_path not in sys.path:
        sys.path.insert(0, backend_path)

    from backend.app import create_app

    app = create_app()
    client = app.test_client()
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data and data.get("status") == "ok"
    assert "ai_available" in data
