# API Documentation

## Overview

The AI Interview System API provides endpoints for resume analysis, interview management, and performance analytics. All endpoints require proper request validation and return standardized responses.

### Base URL
```
http://localhost:5000/api
```

### Authentication
Currently, the API does not require authentication. Production deployments should implement API key authentication.

### Rate Limiting
- **Default**: 200 requests per day, 50 per hour per IP
- **Rate Limit Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Health & Status

### GET /health
Check API health and provider status.

**Response (200 OK)**:
```json
{
  "status": "ok",
  "message": "AstraPrep AI Backend API",
  "version": "3.1.0",
  "ai_available": true,
  "ai_model": "gemini-pro",
  "provider_status": {
    "gemini": "available",
    "local_llm": "not_configured"
  }
}
```

---

## Resume Endpoints

### POST /resume/upload
Upload and analyze a resume.

**Request**:
- **Headers**: `Content-Type: multipart/form-data`
- **Body**:
  - `file` (File, required): PDF, DOCX, or TXT resume
  - `job_role` (string, required): Target job role (1-100 chars)
  - `experience_level` (string, optional): "junior", "mid", "senior" (default: "mid")

**Response (200 OK)**:
```json
{
  "success": true,
  "resume_id": "uuid-string",
  "extracted_data": {
    "skills": ["Python", "Flask", "React"],
    "experience_years": 5,
    "education": ["B.S. Computer Science"],
    "job_titles": ["Software Engineer"]
  },
  "score": {
    "overall": 75,
    "skills_match": 85,
    "education": 70,
    "experience": 80
  }
}
```

**Errors**:
- `400`: Invalid job role format
- `413`: File exceeds 16MB limit
- `422`: Validation error (unsupported file type)

---

## Interview Endpoints

### POST /interview/start
Start a new interview session.

**Request**:
```json
{
  "job_role": "Software Engineer",
  "num_questions": 5,
  "duration_minutes": 30,
  "interview_type": "text"
}
```

**Response (200 OK)**:
```json
{
  "session_id": "uuid-string",
  "job_role": "Software Engineer",
  "questions": [
    {
      "id": 1,
      "question": "Tell me about your experience with Python...",
      "category": "technical"
    }
  ],
  "duration_minutes": 30,
  "started_at": "2025-01-15T10:30:00Z"
}
```

**Errors**:
- `422`: Invalid interview parameters

### POST /interview/submit-answer
Submit an answer to an interview question.

**Request**:
```json
{
  "session_id": "uuid-string",
  "question_id": 1,
  "answer": "I have 5 years of experience with Python..."
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "feedback": {
    "clarity_score": 85,
    "technical_accuracy": 90,
    "completeness": 75,
    "confidence": 80,
    "comments": "Good technical depth, could improve structure"
  }
}
```

### GET /interview/session/:session_id
Retrieve interview session details.

**Response (200 OK)**:
```json
{
  "session_id": "uuid-string",
  "job_role": "Software Engineer",
  "status": "completed",
  "total_score": 82,
  "answers": [...],
  "completed_at": "2025-01-15T11:00:00Z"
}
```

---

## Quiz Endpoints

### GET /quiz/topics
List available quiz topics.

**Response (200 OK)**:
```json
{
  "topics": [
    {"name": "Python Basics", "difficulty": "easy", "num_questions": 10},
    {"name": "SQL Fundamentals", "difficulty": "medium", "num_questions": 15}
  ]
}
```

### POST /quiz/start
Start a quiz session.

**Request**:
```json
{
  "topic": "Python Basics",
  "difficulty": "easy",
  "num_questions": 10
}
```

**Response (200 OK)**:
```json
{
  "quiz_id": "uuid-string",
  "topic": "Python Basics",
  "questions": [
    {
      "id": 1,
      "question": "What is Python?",
      "options": ["A", "B", "C", "D"]
    }
  ]
}
```

### POST /quiz/submit-answer
Submit a quiz answer.

**Request**:
```json
{
  "quiz_id": "uuid-string",
  "question_id": 1,
  "selected_option": "A"
}
```

**Response (200 OK)**:
```json
{
  "correct": true,
  "explanation": "Python is indeed a high-level programming language..."
}
```

---

## Analytics Endpoints

### GET /analytics/sessions
Get user's interview sessions with optional filtering.

**Query Parameters**:
- `start_date` (ISO 8601): Filter sessions after this date
- `end_date` (ISO 8601): Filter sessions before this date
- `limit` (integer): Max results (default: 100, max: 1000)

**Response (200 OK)**:
```json
{
  "sessions": [
    {
      "session_id": "uuid",
      "job_role": "Software Engineer",
      "score": 82,
      "date": "2025-01-15T10:30:00Z",
      "duration_minutes": 30
    }
  ],
  "total": 42
}
```

### GET /analytics/dashboard
Get overall performance dashboard data.

**Response (200 OK)**:
```json
{
  "average_score": 78,
  "total_sessions": 42,
  "improvement_trend": 2.5,
  "weak_areas": ["System Design", "Behavioral"],
  "strong_areas": ["Data Structures", "Algorithms"],
  "scores_by_role": {
    "Software Engineer": 82,
    "Data Scientist": 75
  }
}
```

---

## Communication Coach Endpoints

### GET /communication-coach/daily-drill
Get today's communication drill.

**Response (200 OK)**:
```json
{
  "drill_id": "uuid",
  "topic": "Speaking Clarity",
  "prompt": "Explain a complex technical concept in simple terms...",
  "focus_areas": ["pace", "filler_words", "clarity"]
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "ErrorType",
  "message": "Human-readable error message",
  "details": {
    "field": "error_details"
  }
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (invalid input) |
| 401 | Unauthorized |
| 404 | Resource not found |
| 422 | Validation error |
| 429 | Rate limit exceeded |
| 500 | Server error |
| 503 | Service unavailable (external service down) |

---

## Best Practices

1. **Always validate input** - Use the provided validation schemas
2. **Handle rate limiting** - Check `X-RateLimit-Remaining` header
3. **Retry on 5XX** - Use exponential backoff for transient failures
4. **Stream large files** - Use streaming for resume uploads when possible
5. **Cache responses** - Results are immutable, safe to cache

---

## Examples

### Python (requests library)
```python
import requests

BASE_URL = "http://localhost:5000/api"

# Health check
response = requests.get(f"{BASE_URL}/health")
print(response.json())

# Start interview
data = {
    "job_role": "Software Engineer",
    "num_questions": 5,
    "interview_type": "text"
}
response = requests.post(f"{BASE_URL}/interview/start", json=data)
session_id = response.json()["session_id"]
```

### JavaScript (fetch API)
```javascript
const BASE_URL = "http://localhost:5000/api";

// Health check
const response = await fetch(`${BASE_URL}/health`);
const data = await response.json();
console.log(data);

// Start interview
const interviewData = {
    job_role: "Software Engineer",
    num_questions: 5,
    interview_type: "text"
};
const response = await fetch(`${BASE_URL}/interview/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(interviewData)
});
```

---

## Support

For issues or questions:
1. Check the [README.md](../README.md)
2. Review [Deployment Guide](./DEPLOYMENT.md)
3. Open an issue on GitHub
