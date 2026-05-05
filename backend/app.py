from flask import Flask, jsonify, request as flask_request
from flask_cors import CORS
from dotenv import load_dotenv
import os
import time
import logging

load_dotenv()
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def create_app():
    app = Flask(__name__)
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file
    app.config['UPLOAD_FOLDER'] = 'uploads'
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-prod')

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs('data', exist_ok=True)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # ─── Request timing middleware ────────────────────────────
    @app.before_request
    def start_timer():
        flask_request._start_time = time.time()

    @app.after_request
    def log_request(response):
        elapsed = round((time.time() - getattr(flask_request, '_start_time', time.time())) * 1000, 1)
        if elapsed > 2000:
            logger.info(f"[SLOW] {flask_request.method} {flask_request.path} — {elapsed}ms ({response.status_code})")
        return response

    # ─── Register blueprints ─────────────────────────────────
    from routes.resume_routes import resume_bp
    from routes.interview_routes import interview_bp
    from routes.analytics_routes import analytics_bp
    from routes.quiz_routes import quiz_bp

    app.register_blueprint(resume_bp, url_prefix='/api')
    app.register_blueprint(interview_bp, url_prefix='/api')
    app.register_blueprint(analytics_bp, url_prefix='/api')
    app.register_blueprint(quiz_bp, url_prefix='/api')

    # ─── Health endpoint ─────────────────────────────────────
    @app.route('/health')
    def health():
        from ai.gemini_service import GeminiService
        gemini = GeminiService()
        return jsonify({
            'status': 'ok',
            'message': 'AI Interview Coach — Backend API',
            'version': '3.0.0',
            'ai_available': gemini.is_available(),
            'ai_model': gemini.MODEL_NAME,
            'features': [
                'resume-analysis',
                'ai-interview',
                'communication-coach',
                'performance-analytics',
                'quiz-practice',
            ]
        })

    # ─── Error handlers ──────────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Endpoint not found'}), 404

    @app.errorhandler(413)
    def too_large(e):
        return jsonify({'error': 'File too large. Maximum size is 16MB'}), 413

    @app.errorhandler(500)
    def server_error(e):
        logger.error(f"Server error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

    return app


if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'true').lower() == 'true'
    logger.info(f"Starting AI Interview Coach v3.0 on port {port}")
    app.run(debug=debug, port=port, host='0.0.0.0')
