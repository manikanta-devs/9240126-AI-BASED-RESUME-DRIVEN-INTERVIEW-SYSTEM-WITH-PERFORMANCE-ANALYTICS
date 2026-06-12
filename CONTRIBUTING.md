# Contributing to AI Interview System

Thank you for your interest in contributing! This document outlines our development guidelines and workflow.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Code Style](#code-style)
5. [Testing](#testing)
6. [Commit Guidelines](#commit-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Architecture](#architecture)

---

## Code of Conduct

Be respectful, inclusive, and professional. We're committed to providing a welcoming environment for all contributors.

---

## Getting Started

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/ai-interview-system.git`
3. **Create a branch**: `git checkout -b feature/your-feature-name`
4. **Make changes** following our guidelines
5. **Test** your changes thoroughly
6. **Push** to your fork
7. **Create a Pull Request**

---

## Development Setup

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Mac/Linux

# Install development dependencies
pip install -r requirements.txt
pip install pytest pytest-cov black flake8 isort mypy

# Download spaCy model
python -m spacy download en_core_web_sm

# Copy environment variables
cp .env.example .env
# Edit .env with your GEMINI_API_KEY

# Run tests
pytest

# Run with type checking
mypy backend/ --ignore-missing-imports

# Run linter
flake8 backend/ --max-line-length=100

# Format code
black backend/
isort backend/
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Run type checking (if using TypeScript)
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

---

## Code Style

### Backend (Python)

- **Style Guide**: PEP 8
- **Line Length**: 100 characters
- **Formatting**: Black
- **Imports**: isort (3 groups: stdlib, third-party, local)
- **Type Hints**: Use for function signatures
- **Docstrings**: Google-style docstrings

**Example**:
```python
def analyze_resume(file_path: str, job_role: str) -> dict:
    """Analyze a resume file and extract key information.
    
    Args:
        file_path: Path to the resume file
        job_role: Target job role for analysis
    
    Returns:
        Dictionary containing extracted resume data
    
    Raises:
        FileOperationError: If file cannot be read
        ValidationError: If job_role is invalid
    """
    pass
```

### Frontend (JavaScript/JSX)

- **Style Guide**: Airbnb JavaScript Style Guide
- **Formatting**: Prettier
- **Linter**: ESLint
- **Components**: Functional components with hooks
- **Naming**: camelCase for variables/functions, PascalCase for components

**Example**:
```jsx
export const InterviewCard = ({ title, score, date }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="card">
      <h3>{title}</h3>
      <span>{score}%</span>
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Hide' : 'Show'} Details
      </button>
    </div>
  );
};
```

---

## Testing

### Backend Testing

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_health.py

# Run with coverage
pytest --cov=backend tests/

# Run specific test
pytest tests/test_health.py::test_health_endpoint

# Run tests with markers
pytest -m "unit"
pytest -m "not integration"
```

### Test Requirements

- **Unit Tests**: Required for all new functions
- **Integration Tests**: For API endpoints and service interactions
- **Coverage Target**: 70% or higher
- **Test Organization**: Mimic source structure under `tests/`

**Example Backend Test**:
```python
import pytest
from backend.services.resume_service import parse_resume
from backend.exceptions import FileOperationError

@pytest.mark.unit
def test_parse_resume_valid_file(tmp_path):
    """Test parsing a valid resume file."""
    # Arrange
    test_file = tmp_path / "resume.txt"
    test_file.write_text("Python, 5 years experience")
    
    # Act
    result = parse_resume(str(test_file))
    
    # Assert
    assert result["skills"] is not None
    assert "Python" in result["skills"]

@pytest.mark.unit
def test_parse_resume_invalid_file():
    """Test parsing an invalid resume file."""
    with pytest.raises(FileOperationError):
        parse_resume("/nonexistent/file.pdf")
```

### Frontend Testing

```bash
# Run tests (if setup)
npm test

# Run with coverage
npm test -- --coverage
```

---

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring without feature changes
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Build, dependencies, tooling

### Scope

The scope specifies what part of the codebase is affected:
- `backend`: Backend code changes
- `frontend`: Frontend code changes
- `api`: API endpoint changes
- `config`: Configuration changes
- `docs`: Documentation changes
- `tests`: Test changes

### Examples

```
feat(api): add resume scoring endpoint

Implement POST /api/resume/score endpoint that evaluates
resume quality based on job role and experience level.

Closes #123
```

```
fix(backend): handle missing spacy model gracefully

Download spacy model on first run if not found, with
proper error handling and logging.

Fixes #456
```

```
docs: update API documentation with examples
```

---

## Pull Request Process

### Before Submitting

1. **Update your branch**: `git pull origin main`
2. **Run tests**: `pytest` (backend), `npm test` (frontend)
3. **Check code style**: `flake8 backend/`, `npm run lint`
4. **Format code**: `black backend/`, `npm run format`
5. **Update documentation** if needed
6. **Add tests** for new functionality

### PR Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #(issue number)

## Testing
Describe testing performed:
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No new warnings introduced
```

### Review Process

1. At least 1 approval required
2. All tests must pass
3. No merge conflicts
4. Code review feedback addressed

---

## Architecture

### Backend Structure

```
backend/
├── app.py              # Flask app factory
├── config.py           # Configuration management
├── exceptions.py       # Custom exceptions
├── validators.py       # Pydantic validation models
├── requirements.txt    # Dependencies
├── routes/             # API route blueprints
│   ├── __init__.py
│   ├── interview_routes.py
│   ├── resume_routes.py
│   ├── quiz_routes.py
│   └── analytics_routes.py
├── services/           # Business logic
│   ├── __init__.py
│   ├── interview_service.py
│   ├── resume_service.py
│   ├── quiz_service.py
│   └── analytics_service.py
├── ai/                 # AI/ML integrations
│   ├── __init__.py
│   ├── gemini_service.py
│   ├── answer_evaluator.py
│   └── question_generator.py
├── data/               # Data storage
│   ├── sessions.json
│   └── quizzes.json
└── uploads/            # User uploads directory
```

### Dependency Graph

```
Flask (HTTP)
    ↓
Routes (API endpoints)
    ↓
Services (Business logic)
    ↓
AI Services (Gemini, spaCy, Wikipedia)
    ↓
External APIs & Libraries
```

### Adding New Features

1. **Create service** in `services/` with business logic
2. **Create route** in `routes/` that uses the service
3. **Add validators** in `validators.py` for input validation
4. **Add tests** in `tests/` covering all scenarios
5. **Update documentation** (API_DOCS.md, README.md)

**Example: Add a new endpoint**

```python
# backend/services/new_service.py
from backend.exceptions import ValidationError

class NewService:
    def process_data(self, data: dict) -> dict:
        """Process input data."""
        if not data:
            raise ValidationError("Data cannot be empty")
        return {"result": "processed"}

# backend/routes/new_routes.py
from flask import Blueprint, jsonify, request
from backend.services.new_service import NewService
from backend.validators import NewDataValidator

new_bp = Blueprint('new', __name__)

@new_bp.route('/api/new-endpoint', methods=['POST'])
def create_new():
    try:
        # Validate input
        data = NewDataValidator(**request.json)
        
        # Process
        service = NewService()
        result = service.process_data(data.dict())
        
        return jsonify(result), 201
    except ValidationError as e:
        return jsonify({"error": e.message}), 422

# backend/app.py
from routes.new_routes import new_bp
app.register_blueprint(new_bp)

# tests/test_new_service.py
import pytest
from backend.services.new_service import NewService
from backend.exceptions import ValidationError

def test_process_data():
    service = NewService()
    result = service.process_data({"key": "value"})
    assert result["result"] == "processed"
```

---

## Questions?

- **Issues**: Open a GitHub issue
- **Discussions**: Start a discussion on GitHub
- **Email**: Contact maintainers (if available)

Thank you for contributing! 🚀
