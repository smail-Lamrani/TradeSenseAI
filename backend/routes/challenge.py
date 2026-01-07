"""
Challenge Routes
Handles trading challenges CRUD and status
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Challenge, Plan, User
from services.challenge_engine import ChallengeEngine

challenge_bp = Blueprint('challenges', __name__, url_prefix='/api/challenges')


@challenge_bp.route('', methods=['GET'])
@jwt_required()
def get_challenges():
    """Get all challenges for current user"""
    user_id = get_jwt_identity()
    
    challenges = Challenge.query.filter_by(user_id=user_id).order_by(Challenge.created_at.desc()).all()
    
    return jsonify({
        'challenges': [c.to_dict() for c in challenges]
    }), 200


@challenge_bp.route('/active', methods=['GET'])
@jwt_required()
def get_active_challenge():
    """Get current active challenge for user"""
    user_id = get_jwt_identity()
    
    challenge = Challenge.query.filter_by(user_id=user_id, status='active').first()
    
    if not challenge:
        return jsonify({'challenge': None, 'message': 'No active challenge'}), 200
    
    # Recalculate equity
    engine = ChallengeEngine(challenge)
    current_equity = engine.calculate_equity()
    
    result = challenge.to_dict()
    result['equity'] = float(current_equity)
    result['profit_pct'] = round(((float(current_equity) - float(challenge.initial_balance)) / float(challenge.initial_balance)) * 100, 2)
    
    return jsonify({'challenge': result}), 200


@challenge_bp.route('/<int:challenge_id>', methods=['GET'])
@jwt_required()
def get_challenge(challenge_id):
    """Get specific challenge by ID"""
    user_id = get_jwt_identity()
    
    challenge = Challenge.query.filter_by(id=challenge_id, user_id=user_id).first()
    
    if not challenge:
        return jsonify({'error': 'Challenge not found'}), 404
    
    return jsonify({'challenge': challenge.to_dict()}), 200


@challenge_bp.route('/<int:challenge_id>/status', methods=['GET'])
@jwt_required()
def get_challenge_status(challenge_id):
    """Get challenge status with detailed metrics"""
    user_id = get_jwt_identity()
    
    challenge = Challenge.query.filter_by(id=challenge_id, user_id=user_id).first()
    
    if not challenge:
        return jsonify({'error': 'Challenge not found'}), 404
    
    engine = ChallengeEngine(challenge)
    current_equity = engine.calculate_equity()
    
    initial = float(challenge.initial_balance)
    daily_start = float(challenge.daily_start_equity)
    equity = float(current_equity)
    
    # Calculate metrics
    total_pnl = equity - initial
    total_pnl_pct = (total_pnl / initial) * 100
    daily_pnl = equity - daily_start
    daily_pnl_pct = (daily_pnl / daily_start) * 100 if daily_start > 0 else 0
    
    # Thresholds
    max_daily_loss = float(challenge.plan.max_daily_loss_pct)
    max_total_loss = float(challenge.plan.max_total_loss_pct)
    profit_target = float(challenge.plan.profit_target_pct)
    
    return jsonify({
        'challenge_id': challenge.id,
        'status': challenge.status,
        'initial_balance': initial,
        'current_equity': equity,
        'daily_start_equity': daily_start,
        'metrics': {
            'total_pnl': round(total_pnl, 2),
            'total_pnl_pct': round(total_pnl_pct, 2),
            'daily_pnl': round(daily_pnl, 2),
            'daily_pnl_pct': round(daily_pnl_pct, 2)
        },
        'thresholds': {
            'max_daily_loss_pct': max_daily_loss,
            'max_total_loss_pct': max_total_loss,
            'profit_target_pct': profit_target
        },
        'progress': {
            'to_profit_target': round(profit_target - total_pnl_pct, 2),
            'daily_loss_remaining': round(max_daily_loss + daily_pnl_pct, 2),
            'total_loss_remaining': round(max_total_loss + total_pnl_pct, 2)
        }
    }), 200


@challenge_bp.route('/<int:challenge_id>/evaluate', methods=['POST'])
@jwt_required()
def evaluate_challenge(challenge_id):
    """Manually trigger challenge evaluation"""
    user_id = get_jwt_identity()
    
    challenge = Challenge.query.filter_by(id=challenge_id, user_id=user_id).first()
    
    if not challenge:
        return jsonify({'error': 'Challenge not found'}), 404
    
    engine = ChallengeEngine(challenge)
    result = engine.evaluate()
    
    return jsonify(result), 200


@challenge_bp.route('/plans', methods=['GET'])
def get_plans():
    """Get all available challenge plans (public)"""
    plans = Plan.query.all()
    return jsonify({
        'plans': [p.to_dict() for p in plans]
    }), 200
