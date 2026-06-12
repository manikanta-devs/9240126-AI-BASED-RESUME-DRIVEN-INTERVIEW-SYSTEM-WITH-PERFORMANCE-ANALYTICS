# Backend Development Guide

Complete guide for developing, testing, and deploying the Flask backend.

## Quick Start

```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Setup environment
cp .env.example .env
# Edit .env with your GEMINI_API_KEY

# Run tests
pytest

# Start development server
python app.py
```

## Project Structure

```
backend/
├── app.py                    # Flask app factory
├── config.py                 # Configuration management
├── exceptions.py             # Custom exception classes
├── validators.py             # Pydantic validation schemas
├── requirements.txt          # Production dependencies
├── .env.example              # Environment template
├── .env                      # (git-ignored) Local config
├── Dockerfile                # Production container
│
├── routes/
│   ├── __init__.py
│   ├── resume_routes.py      # Resume endpoints
│   ├── interview_routes.py   # Interview endpoints
│   ├── quiz_routes.py        # Quiz endpoints
│   └── analytics_routes.py   # Analytics endpoints
│
├── services/
│   ├── __init__.py
│   ├── resume_service.py     # Resume processing
│   ├── interview_service.py  # Interview logic
│   ├── quiz_service.py       # Quiz logic
│   └── analytics_service.py  # Analytics aggregation
│
├── ai/
│   ├── __init__.py
│   ├── gemini_service.py     # Gemini API wrapper
│   ├── question_generator.py # Question generation
│   ├── answer_evaluator.py   # Answer evaluation
│   ├── local_llm.py          # Local LLM fallback
│   └── wiki_service.py       # Wikipedia knowledge
│
├── data/
│   ├── sessions.json         # Interview sessions
│   └── quizzes.json          # Quiz results
│
└── uploads/                  # User uploaded files
```

## Architecture

### Request Flow

```
Client Request
    ↓
CORS Middleware
    ↓
Rate Limiter
    ↓
Security Headers
    ↓
Route Handler
    ↓
Request Logger
    ↓
Validators (Pydantic)
    ↓
Services
    ↓
AI Services / Database
    ↓
Response
    ↓
Error Handler (if exception)
```

### Key Components

#### 1. Configuration (`config.py`)

```python
from backend.config import get_config, DevelopmentConfig, ProductionConfig

config = get_config()  # Auto-detects FLASK_ENV
print(config.DEBUG)
```

#### 2. Custom Exceptions (`exceptions.py`)

```python
from backend.exceptions import (
    APIError, ValidationError, NotFoundError, ExternalServiceError
)

# Raise custom exceptions
raise ValidationError("Invalid input", {"field": "email"})

# Exception handlers in app.py automatically convert to JSON responses
```

#### 3. Validators (`validators.py`)

```python
from backend.validators import InterviewRequest
from pydantic import ValidationError

try:
    request = InterviewRequest(
        job_role="Engineer",
        num_questions=5
    )
except ValidationError as e:
    # Handle validation errors
    print(e.errors())
```

## Adding New Endpoints

### 1. Create Validator (validators.py)

```python
from pydantic import BaseModel, Field, validator

class MyRequest(BaseModel):
    """Validation schema for my endpoint."""
    field1: str = Field(..., min_length=1, max_length=100)
    field2: int = Field(default=10, ge=1, le=100)
    
    @validator('field1')
    def validate_field1(cls, v):
        if not v.strip():
            raise ValueError("Cannot be empty")
        return v.strip()
```

### 2. Create Service (services/my_service.py)

```python
from backend.exceptions import ValidationError, ExternalServiceError

class MyService:
    """Business logic for my feature."""
    
    def process_data(self, data: dict) -> dict:
        """Process request data.
        
        Args:
            data: Validated request data
        
        Returns:
            Processed result
        
        Raises:
            ValidationError: If processing fails
            ExternalServiceError: If external service fails
        """
        try:
            # Process data
            result = {"status": "success"}
            return result
        except Exception as e:
            raise ValidationError(f"Processing failed: {e}")
```

### 3. Create Route (routes/my_routes.py)

```python
from flask import Blueprint, request, jsonify
from backend.validators import MyRequest
from backend.services.my_service import MyService
from backend.exceptions import APIError

my_bp = Blueprint('my', __name__)

@my_bp.route('/my-endpoint', methods=['POST'])
def create_my_endpoint():
    """Create/process something.
    
    Request body:
        {
            "field1": "value",
            "field2": 5
        }
    
    Returns:
        {
            "status": "success",
            "data": {...}
        }
    """
    try:
        # 1. Validate input
        req_data = MyRequest(**request.get_json())
        
        # 2. Process with service
        service = MyService()
        result = service.process_data(req_data.dict())
        
        # 3. Return response
        return jsonify(result), 200
        
    except APIError as e:
        return jsonify(e.to_dict()), e.status_code
    except Exception as e:
        import logging
        logging.error(f"Unhandled error: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500
```

### 4. Register Route (app.py)

```python
from routes.my_routes import my_bp
app.register_blueprint(my_bp, url_prefix="/api")
```

## Error Handling

### Exception Hierarchy

```
Exception (Python base)
    ↓
APIError (base)
    ├── ValidationError (422)
    ├── NotFoundError (404)
    ├── UnauthorizedError (401)
    ├── ForbiddenError (403)
    ├── ConflictError (409)
    ├── ExternalServiceError (503)
    └── FileOperationError (400)
```

### Usage

```python
from backend.exceptions import NotFoundError, ExternalServiceError

# Not found
raise NotFoundError("User not found", {"user_id": "123"})

# External service error
try:
    result = call_external_api()
except Exception as e:
    raise ExternalServiceError("Gemini", "API rate limited")

# In route: exception automatically converted to JSON response
@app.errorhandler(APIError)
def handle_api_error(e):
    return jsonify(e.to_dict()), e.status_code
```

## Testing

### Unit Tests (services)

```python
# tests/test_my_service.py
import pytest
from backend.services.my_service import MyService
from backend.exceptions import ValidationError

class TestMyService:
    """Test suite for MyService."""
    
    def test_process_data_valid(self):
        """Test processing valid data."""
        service = MyService()
        result = service.process_data({"field1": "value"})
        assert result["status"] == "success"
    
    def test_process_data_invalid(self):
        """Test processing invalid data."""
        service = MyService()
        with pytest.raises(ValidationError):
            service.process_data({})
```

### Integration Tests (endpoints)

```python
# tests/test_api_endpoints.py
import pytest
from backend.app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    return app.test_client()

def test_my_endpoint(client):
    """Test /api/my-endpoint POST."""
    response = client.post('/api/my-endpoint', json={
        "field1": "value",
        "field2": 5
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=backend tests/

# Run specific file
pytest tests/test_my_service.py

# Run with verbose output
pytest -v

# Run tests matching pattern
pytest -k "validation"

# Run tests with markers
pytest -m "unit"
```

## Logging

### Configuration

```python
import logging

logger = logging.getLogger(__name__)

# Already configured in app.py
# Format: "2025-01-15 10:30:45,123 - module_name - INFO - message"
```

### Usage

```python
logger.debug("Debug message")        # Development only
logger.info("User logged in")        # Important events
logger.warning("Deprecated call")    # Warnings
logger.error("Database error", exc_info=True)  # Errors with traceback
```

### Log Levels

- **DEBUG**: Detailed info, only in development
- **INFO**: Important events (API calls, user actions)
- **WARNING**: Something unexpected but recoverable
- **ERROR**: Something failed, but app continues
- **CRITICAL**: System down, immediate attention needed

## Configuration Management

### Environment Variables

```bash
# In .env file
FLASK_ENV=development
DEBUG=true
GEMINI_API_KEY=sk-xxx
SECRET_KEY=your-secret-key
ALLOWED_ORIGINS=http://localhost:5173
RATE_LIMIT_ENABLED=true
```

### Access in Code

```python
import os
from backend.config import get_config

config = get_config()
api_key = os.getenv("GEMINI_API_KEY")
debug = config.DEBUG
```

## Database Integration (Future)

### Planned Migration

```python
# Current: JSON files
# Future: PostgreSQL with SQLAlchemy

# Setup (when ready):
pip install flask-sqlalchemy alembic psycopg2

# Create models
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy(app)

class Interview(db.Model):
    id = db.Column(db.String, primary_key=True)
    job_role = db.Column(db.String)
    score = db.Column(db.Float)
```

## Performance Tuning

### Database Queries
- Use indexing on frequently queried fields
- Implement query caching where applicable
- Batch operations when possible

### API Optimization
- Cache expensive computations (spaCy parsing)
- Use pagination for large datasets
- Compress responses (gzip)

### Monitoring
```bash
# Monitor slow requests (> 2000ms by default)
docker logs backend | grep SLOW

# Check memory usage
docker stats backend

# Profile with cProfile
python -m cProfile -s cumulative app.py
```

## Deployment

### Docker

```bash
# Build image
docker build -t ai-interview-backend:latest .

# Run container
docker run -e GEMINI_API_KEY=xxx -p 5000:5000 ai-interview-backend

# Check logs
docker logs <container_id>
```

### Production Environment

```env
FLASK_ENV=production
DEBUG=false
SECRET_KEY=<generate-with-secrets.token_urlsafe(32)>
GEMINI_API_KEY=<your-key>
ALLOWED_ORIGINS=https://yourdomain.com
```

### Security Checklist

- [ ] SECRET_KEY is random (32+ chars)
- [ ] DEBUG is false
- [ ] ALLOWED_ORIGINS is specific (not *)
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info
- [ ] HTTPS enforced (HSTS header)
- [ ] Security headers configured
- [ ] Logging captures all errors

## Troubleshooting

### Port Already In Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### spaCy Model Not Found
```bash
# Download model
python -m spacy download en_core_web_sm
```

### API Key Issues
```bash
# Check .env file exists
cat .env | grep GEMINI_API_KEY

# Verify key is valid
curl -H "Authorization: Bearer $GEMINI_API_KEY" https://api.example.com/test
```

### Memory Leaks
```bash
# Monitor memory usage
docker stats

# Check for circular imports
python -c "import backend.app"

# Profile memory
pip install memory_profiler
python -m memory_profiler app.py
```

## Best Practices

✅ **Do:**
- Use type hints in function signatures
- Document public functions with docstrings
- Create custom exceptions for different error cases
- Validate all user input with Pydantic
- Log important events and errors
- Write tests for all new features
- Use git branches for features
- Keep functions small and focused
- Use environment variables for configuration

❌ **Don't:**
- Use bare `except:` clauses
- Print debug info to stdout (use logging)
- Store secrets in code or .env (use env vars)
- Create large monolithic services
- Ignore error responses from external APIs
- Leave TODOs in production code
- Commit .env files
- Make breaking API changes without versioning
- Trust user input without validation

## Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [spaCy Documentation](https://spacy.io/)
- [Google Gemini API](https://ai.google.dev/)

---

Happy coding! 🚀
