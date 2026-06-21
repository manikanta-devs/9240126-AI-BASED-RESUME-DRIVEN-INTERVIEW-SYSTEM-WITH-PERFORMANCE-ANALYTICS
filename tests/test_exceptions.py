"""Tests for custom exceptions."""

import os
import sys


def setup_path():
    """Setup sys.path for imports."""
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    if root not in sys.path:
        sys.path.insert(0, root)
    backend_path = os.path.join(root, "backend")
    if backend_path not in sys.path:
        sys.path.insert(0, backend_path)


def test_api_error_base():
    """Test base APIError class."""
    setup_path()
    from backend.exceptions import APIError

    error = APIError("Test error", 400, {"field": "value"})
    assert error.message == "Test error"
    assert error.status_code == 400

    error_dict = error.to_dict()
    assert error_dict["error"] == "APIError"
    assert error_dict["message"] == "Test error"
    assert error_dict["field"] == "value"


def test_validation_error():
    """Test ValidationError."""
    setup_path()
    from backend.exceptions import ValidationError

    error = ValidationError("Invalid input", {"field": "email"})
    assert error.status_code == 422
    assert "field" in error.to_dict()


def test_not_found_error():
    """Test NotFoundError."""
    setup_path()
    from backend.exceptions import NotFoundError

    error = NotFoundError("User not found", {"user_id": "123"})
    assert error.status_code == 404
    assert error.message == "User not found"


def test_unauthorized_error():
    """Test UnauthorizedError."""
    setup_path()
    from backend.exceptions import UnauthorizedError

    error = UnauthorizedError()
    assert error.status_code == 401
    assert error.message == "Unauthorized"


def test_forbidden_error():
    """Test ForbiddenError."""
    setup_path()
    from backend.exceptions import ForbiddenError

    error = ForbiddenError()
    assert error.status_code == 403


def test_conflict_error():
    """Test ConflictError."""
    setup_path()
    from backend.exceptions import ConflictError

    error = ConflictError("Resource exists")
    assert error.status_code == 409


def test_external_service_error():
    """Test ExternalServiceError."""
    setup_path()
    from backend.exceptions import ExternalServiceError

    error = ExternalServiceError("Gemini", "API rate limited")
    assert error.status_code == 503
    assert "Gemini" in error.message


def test_file_operation_error():
    """Test FileOperationError."""
    setup_path()
    from backend.exceptions import FileOperationError

    error = FileOperationError("File upload failed")
    assert error.status_code == 400
