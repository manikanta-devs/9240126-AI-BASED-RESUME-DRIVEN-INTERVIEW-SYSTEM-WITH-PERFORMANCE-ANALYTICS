# Deployment Guide

This guide covers production deployment of the AI Interview System using Docker, Docker Compose, and various hosting platforms.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Docker Deployment](#local-docker-deployment)
3. [Docker Compose Full Stack](#docker-compose-full-stack)
4. [Cloud Deployment](#cloud-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Scaling & Performance](#scaling--performance)
7. [Monitoring & Logging](#monitoring--logging)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Docker & Docker Compose (or local Python 3.11+ and Node.js 18+)
- Gemini API key (https://makersuite.google.com/app/apikey)
- For cloud: AWS, GCP, or Heroku account (optional)

---

## Local Docker Deployment

### 1. Build and Run Backend

```bash
cd backend

# Build the Docker image
docker build -t ai-interview-backend:latest .

# Run the container
docker run -d \
  --name ai-backend \
  -p 5000:5000 \
  -e FLASK_ENV=production \
  -e GEMINI_API_KEY=your-key-here \
  -e SECRET_KEY=your-secret-key \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/data:/app/data \
  ai-interview-backend:latest

# Check logs
docker logs ai-backend
```

### 2. Build and Run Frontend

```bash
cd frontend

# Build the Docker image (multi-stage build)
docker build -t ai-interview-frontend:latest .

# Run the container
docker run -d \
  --name ai-frontend \
  -p 80:80 \
  ai-interview-frontend:latest

# Access at http://localhost
```

---

## Docker Compose Full Stack

The simplest way to deploy the entire application:

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### docker-compose.yml Configuration

The provided `docker-compose.yml` includes:

- **Backend**: Flask API on port 5000 (internal), exposed via nginx
- **Frontend**: React app served via nginx on port 80
- **Nginx**: Reverse proxy, handles CORS, SSL termination (optional)
- **Volumes**: Persistent storage for uploads and data

### Environment Variables

Create a `.env` file for Docker Compose:

```env
FLASK_ENV=production
DEBUG=false
SECRET_KEY=your-very-secure-random-key-here
GEMINI_API_KEY=your-gemini-api-key
ALLOWED_ORIGINS=https://yourdomain.com
```

---

## Cloud Deployment

### AWS ECS (Recommended)

```bash
# 1. Create ECR repositories
aws ecr create-repository --repository-name ai-interview-backend
aws ecr create-repository --repository-name ai-interview-frontend

# 2. Build and push images
docker build -t ai-interview-backend:latest backend/
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag ai-interview-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/ai-interview-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/ai-interview-backend:latest

# 3. Create ECS Cluster and Task Definition (via AWS Console)
# 4. Deploy services
```

### Heroku Deployment

```bash
# 1. Install Heroku CLI and login
heroku login

# 2. Create Heroku app
heroku create ai-interview-app

# 3. Set environment variables
heroku config:set FLASK_ENV=production
heroku config:set GEMINI_API_KEY=your-key
heroku config:set SECRET_KEY=your-secret

# 4. Deploy
git push heroku main

# 5. Scale dynos
heroku ps:scale web=2
heroku ps:scale worker=1
```

### Google Cloud Run

```bash
# 1. Build and push to GCR
gcloud builds submit --tag gcr.io/YOUR_PROJECT/ai-interview-backend backend/

# 2. Deploy to Cloud Run
gcloud run deploy ai-interview-backend \
  --image gcr.io/YOUR_PROJECT/ai-interview-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars FLASK_ENV=production,GEMINI_API_KEY=your-key

# 3. Deploy frontend similarly
gcloud run deploy ai-interview-frontend \
  --image gcr.io/YOUR_PROJECT/ai-interview-frontend \
  --platform managed \
  --region us-central1
```

---

## Environment Configuration

### Security Best Practices

1. **Never commit secrets** - Use environment variables or secret management
2. **Use strong SECRET_KEY** - At least 32 random characters
3. **Enable HTTPS** - Always use HTTPS in production
4. **Configure CORS properly** - Specify exact allowed origins
5. **Use secure cookies** - Set httponly, secure, samesite flags
6. **Rate limiting** - Enabled by default, adjust as needed

### Production Environment Variables

```env
# Server
FLASK_ENV=production
DEBUG=false
PORT=5000

# Security
SECRET_KEY=<generate-with-secrets.token_urlsafe(32)>

# API Keys
GEMINI_API_KEY=<get-from-makersuite>

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT_ENABLED=true

# Logging
LOG_LEVEL=INFO
```

---

## Scaling & Performance

### Horizontal Scaling

1. **Load Balancing**: Use AWS ALB, GCP Load Balancer, or nginx
2. **Multiple Instances**: Run 2-4 backend instances
3. **Stateless Design**: All data stored in JSON (prepare for database)

### Performance Optimization

1. **Enable Caching**:
   ```python
   from flask_caching import Cache
   cache = Cache(app, config={'CACHE_TYPE': 'simple'})
   ```

2. **CDN for Frontend**: CloudFront, Cloudflare, or Vercel
3. **Database**: Migrate from JSON to PostgreSQL
4. **Celery**: For long-running tasks (AI generation)

### Resource Limits

```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

---

## Monitoring & Logging

### Application Logs

```python
# Backend logs automatically go to stdout
# View with: docker logs ai-backend
# For persistent logging, use:
# - ELK Stack (Elasticsearch, Logstash, Kibana)
# - Datadog
# - CloudWatch
```

### Health Checks

```bash
# Check backend health
curl http://localhost:5000/health

# Check frontend
curl http://localhost
```

### Metrics to Monitor

- **Response time** (target: < 200ms)
- **Error rate** (target: < 0.1%)
- **CPU usage** (target: < 70%)
- **Memory usage** (target: < 80%)
- **Requests/sec** (baseline: 100 req/s per instance)

---

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
docker logs ai-backend

# Common issues:
# - Missing GEMINI_API_KEY
# - Port already in use (change PORT env var)
# - Missing spacy model (downloads on first run)
```

### Frontend Shows Blank Page

```bash
# Check logs
docker logs ai-frontend

# Check network tab in browser DevTools
# Verify API endpoint in frontend/.env
# Check CORS headers: curl -I http://localhost:5000/health
```

### High Memory Usage

```bash
# Check container memory
docker stats

# Solutions:
# - Reduce gunicorn workers in backend/Dockerfile
# - Increase memory limit in docker-compose.yml
# - Cache spacy model in image
```

### Database Connection Issues

```bash
# If using external database (future):
docker exec ai-backend python -m pytest -v
```

---

## Database Migration (Future)

When ready to migrate from JSON to PostgreSQL:

```bash
# 1. Install database packages
pip install flask-sqlalchemy psycopg2-binary alembic

# 2. Update config.py with DATABASE_URL
DATABASE_URL=postgresql://user:pass@host:5432/aiinterview

# 3. Create migrations
flask db init
flask db migrate
flask db upgrade

# 4. Update services to use SQLAlchemy
```

---

## Support

- **Documentation**: See [README.md](../README.md) and [API_DOCS.md](./API_DOCS.md)
- **Issues**: Check logs first with `docker-compose logs`
- **Performance**: Profile with `docker stats`
