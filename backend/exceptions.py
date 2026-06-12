"""Custom exception classes for the application."""
from flask import jsonify
from typing import Optional


class APIError(Exception):
    """Base API error class."""
    
    def __init__(self, message: str, status_code: int = 400, payload: Optional[dict] = None):
        """Initialize API error.
        
        Args:
            message: Error message
            status_code: HTTP status code
            payload: Additional error data
        """
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.payload = payload or {}
    
    def to_dict(self) -> dict:
        """Convert error to dictionary."""
        return {
            "error": self.__class__.__name__,
            "message": self.message,
            **self.payload
        }


class ValidationError(APIError):
    """Raised when input validation fails."""
    
    def __init__(self, message: str, payload: Optional[dict] = None):
        super().__init__(message, status_code=422, payload=payload)


class NotFoundError(APIError):
    """Raised when resource is not found."""
    
    def __init__(self, message: str, payload: Optional[dict] = None):
        super().__init__(message, status_code=404, payload=payload)


class UnauthorizedError(APIError):
    """Raised when authentication is required."""
    
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, status_code=401)


class ForbiddenError(APIError):
    """Raised when access is forbidden."""
    
    def __init__(self, message: str = "Forbidden"):
        super().__init__(message, status_code=403)


class ConflictError(APIError):
    """Raised when resource already exists."""
    
    def __init__(self, message: str, payload: Optional[dict] = None):
        super().__init__(message, status_code=409, payload=payload)


class ExternalServiceError(APIError):
    """Raised when external service fails."""
    
    def __init__(self, service: str, message: str = "Service unavailable"):
        full_message = f"{service}: {message}"
        super().__init__(full_message, status_code=503, payload={"service": service})


class FileOperationError(APIError):
    """Raised when file operation fails."""
    
    def __init__(self, message: str, payload: Optional[dict] = None):
        super().__init__(message, status_code=400, payload=payload)
