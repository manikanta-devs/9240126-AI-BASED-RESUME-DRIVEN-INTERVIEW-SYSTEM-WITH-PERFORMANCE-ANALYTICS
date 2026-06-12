from flask import Flask, jsonify, request as flask_request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import os
import time
import logging
import traceback

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def create_app():
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB max file
    app.config["UPLOAD_FOLDER"] = "uploads"
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key-change-in-prod")
    app.config["ENV"] = os.getenv("FLASK_ENV", "development")

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    os.makedirs("data", exist_ok=True)

    # ─── CORS Configuration ──────────────────────────────────
    allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    CORS(app, resources={
        r"/api/*": {
            "origins": allowed_origins,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "max_age": 3600
        }
    })
    
    # ─── Rate Limiting ──────────────────────────────────────
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=["200 per day", "50 per hour"],
        storage_uri="memory://"
    )
    
    # ─── Security Headers ───────────────────────────────────
    @app.after_request
    def add_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        if app.config["ENV"] == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        return response

    # ─── Request timing middleware ────────────────────────────
    @app.before_request
    def start_timer():
        flask_request._start_time = time.time()

    @app.after_request
    def log_request(response):
        elapsed = round((time.time() - getattr(flask_request, "_start_time", time.time())) * 1000, 1)
        if elapsed > 2000:
            logger.info(f"[SLOW] {flask_request.method} {flask_request.path} — {elapsed}ms ({response.status_code})")
        return response

    # ─── Register blueprints ─────────────────────────────────
    from routes.resume_routes import resume_bp
    from routes.interview_routes import interview_bp
    from routes.analytics_routes import analytics_bp
    from routes.quiz_routes import quiz_bp

    app.register_blueprint(resume_bp, url_prefix="/api")
    app.register_blueprint(interview_bp, url_prefix="/api")
    app.register_blueprint(analytics_bp, url_prefix="/api")
    app.register_blueprint(quiz_bp, url_prefix="/api")

    # ─── Health endpoint ─────────────────────────────────────
    @app.route("/health")
    def health():
        from ai.gemini_service import GeminiService

        gemini = GeminiService()
        provider = gemini.provider_status()
        return jsonify(
            {
                "status": "ok",
                "message": "AstraPrep AI Backend API",
                "version": "3.1.0",
                "ai_available": gemini.is_available(),
                "ai_model": provider["active_provider"],
                "provider_status": provider,
                "free_stack": [
                    "Browser SpeechRecognition for transcript capture",
                    "MediaRecorder and getUserMedia for mic/camera recording",
                    "Canvas frame sampling for local presence signals",
                    "spaCy/PyPDF2/python-docx resume parsing",
                    "Rule-based fallback question and answer scoring",
                    "Optional Hugging Face free inference token",
                ],
                "features": [
                    "resume-analysis",
                    "ai-interview",
                    "2d-ai-interviewer",
                    "voice-video-capture",
                    "communication-coach",
                    "performance-analytics",
                    "quiz-practice",
                ],
            }
        )

    # ─── Error handlers ──────────────────────────────────────
    @app.errorhandler(400)
    def bad_request(e):
        logger.warning(f"Bad request: {e}")
        return jsonify({"error": "Bad request", "message": str(e)}), 400

    @app.errorhandler(404)
    def not_found(e):
        logger.warning(f"Not found: {flask_request.path}")
        return jsonify({"error": "Endpoint not found", "path": flask_request.path}), 404

    @app.errorhandler(413)
    def too_large(e):
        return jsonify({"error": "File too large. Maximum size is 16MB"}), 413

    @app.errorhandler(429)
    def rate_limit_exceeded(e):
        return jsonify({"error": "Rate limit exceeded", "message": "Too many requests"}), 429

    @app.errorhandler(500)
    def server_error(e):
        logger.error(f"Server error: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

    @app.errorhandler(Exception)
    def handle_exception(e):
        logger.error(f"Unhandled exception: {e}", exc_info=True)
        return jsonify({"error": "Internal server error", "message": str(e) if app.config["ENV"] == "development" else "An error occurred"}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("DEBUG", "true").lower() == "true"
    logger.info(f"Starting AI Interview Coach v3.0 on port {port}")
    app.run(debug=debug, port=port, host="0.0.0.0")

