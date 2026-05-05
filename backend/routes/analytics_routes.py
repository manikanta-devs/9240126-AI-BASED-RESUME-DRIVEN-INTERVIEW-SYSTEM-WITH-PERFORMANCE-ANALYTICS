from flask import Blueprint, request, jsonify
import logging

from services.analytics_service import AnalyticsService

logger = logging.getLogger(__name__)
analytics_bp = Blueprint('analytics', __name__)
analytics_service = AnalyticsService()


@analytics_bp.route('/analytics/summary', methods=['GET'])
def get_summary():
    """Get overall performance summary"""
    try:
        summary = analytics_service.get_summary()
        return jsonify({'success': True, 'summary': summary}), 200
    except Exception as e:
        logger.error(f"Analytics summary error: {e}")
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/analytics/sessions', methods=['GET'])
def get_sessions():
    """Get all completed sessions with scores"""
    try:
        limit = int(request.args.get('limit', 20))
        sessions = analytics_service.get_all_sessions(limit=limit)
        return jsonify({'success': True, 'sessions': sessions}), 200
    except Exception as e:
        logger.error(f"Analytics sessions error: {e}")
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/analytics/session/<session_id>', methods=['GET'])
def get_session(session_id):
    """Get detailed analytics for a specific session"""
    try:
        session = analytics_service.get_session_details(session_id)
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        return jsonify({'success': True, 'session': session}), 200
    except Exception as e:
        logger.error(f"Analytics session error: {e}")
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/analytics/performance-trend', methods=['GET'])
def performance_trend():
    """Get performance trend over time"""
    try:
        trend = analytics_service.get_performance_trend()
        return jsonify({'success': True, 'trend': trend}), 200
    except Exception as e:
        logger.error(f"Performance trend error: {e}")
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/analytics/weak-areas', methods=['GET'])
def weak_areas():
    """Get identified weak areas across all sessions"""
    try:
        areas = analytics_service.get_weak_areas()
        return jsonify({'success': True, 'weak_areas': areas}), 200
    except Exception as e:
        logger.error(f"Weak areas error: {e}")
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/analytics/skill-breakdown', methods=['GET'])
def skill_breakdown():
    """Get skill-wise performance breakdown"""
    try:
        breakdown = analytics_service.get_skill_breakdown()
        return jsonify({'success': True, 'breakdown': breakdown}), 200
    except Exception as e:
        logger.error(f"Skill breakdown error: {e}")
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/analytics/study-plan', methods=['GET'])
def study_plan():
    """Get a personalized weekly practice plan."""
    try:
        plan = analytics_service.get_study_plan()
        return jsonify({'success': True, 'study_plan': plan}), 200
    except Exception as e:
        logger.error(f"Study plan error: {e}")
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/analytics/communication-coach', methods=['GET'])
def communication_coach():
    """Get a communication-first coaching plan."""
    try:
        coach = analytics_service.get_communication_coach()
        return jsonify({'success': True, 'communication_coach': coach}), 200
    except Exception as e:
        logger.error(f"Communication coach error: {e}")
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/analytics/clear', methods=['DELETE'])
def clear_analytics():
    """Clear all analytics data"""
    try:
        analytics_service.clear_all()
        return jsonify({'success': True, 'message': 'All analytics data cleared'}), 200
    except Exception as e:
        logger.error(f"Clear analytics error: {e}")
        return jsonify({'error': str(e)}), 500
