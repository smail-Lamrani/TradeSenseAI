"""
Admin Routes
SuperAdmin panel for PayPal configuration and platform management
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, PaypalConfig, Challenge, Payment, Plan

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


def admin_required(f):
    """Decorator to require admin privileges"""
    from functools import wraps
    
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        return f(*args, **kwargs)
    
    return decorated_function


@admin_bp.route('/paypal/config', methods=['GET'])
@admin_required
def get_paypal_config():
    """Get current PayPal configuration"""
    config = PaypalConfig.query.filter_by(is_active=True).first()
    
    if not config:
        return jsonify({
            'configured': False,
            'message': 'PayPal not configured'
        }), 200
    
    return jsonify({
        'configured': True,
        'config': config.to_dict()
    }), 200


@admin_bp.route('/paypal/config', methods=['POST'])
@admin_required
def update_paypal_config():
    """Update PayPal configuration"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    client_id = data.get('client_id')
    client_secret = data.get('client_secret')
    mode = data.get('mode', 'sandbox')
    
    if not client_id or not client_secret:
        return jsonify({'error': 'Client ID and Secret are required'}), 400
    
    # Deactivate existing configs
    PaypalConfig.query.update({'is_active': False})
    
    # Create new config
    config = PaypalConfig(
        client_id=client_id,
        client_secret=client_secret,
        mode=mode,
        is_active=True
    )
    db.session.add(config)
    db.session.commit()
    
    return jsonify({
        'message': 'PayPal configuration updated',
        'config': config.to_dict()
    }), 200


@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    """Get all users"""
    users = User.query.order_by(User.created_at.desc()).all()
    
    return jsonify({
        'users': [u.to_dict() for u in users],
        'total': len(users)
    }), 200


@admin_bp.route('/users/<int:user_id>/admin', methods=['POST'])
@admin_required
def toggle_admin(user_id):
    """Toggle admin status for a user"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user.is_admin = not user.is_admin
    db.session.commit()
    
    return jsonify({
        'message': f'Admin status {"granted" if user.is_admin else "revoked"}',
        'user': user.to_dict()
    }), 200


@admin_bp.route('/challenges', methods=['GET'])
@admin_required
def get_all_challenges():
    """Get all challenges"""
    status = request.args.get('status')
    
    query = Challenge.query
    
    if status:
        query = query.filter_by(status=status)
    
    challenges = query.order_by(Challenge.created_at.desc()).all()
    
    return jsonify({
        'challenges': [c.to_dict() for c in challenges],
        'total': len(challenges)
    }), 200


@admin_bp.route('/payments', methods=['GET'])
@admin_required
def get_all_payments():
    """Get all payments"""
    payments = Payment.query.order_by(Payment.created_at.desc()).all()
    
    total_revenue = sum(float(p.amount_dh) for p in payments if p.status == 'completed')
    
    return jsonify({
        'payments': [p.to_dict() for p in payments],
        'total': len(payments),
        'total_revenue': round(total_revenue, 2)
    }), 200


@admin_bp.route('/plans', methods=['GET'])
@admin_required
def get_plans():
    """Get all plans"""
    plans = Plan.query.all()
    return jsonify({
        'plans': [p.to_dict() for p in plans]
    }), 200


@admin_bp.route('/plans', methods=['POST'])
@admin_required
def create_plan():
    """Create a new plan"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    plan = Plan(
        name=data.get('name'),
        price_dh=data.get('price_dh'),
        initial_balance=data.get('initial_balance'),
        max_daily_loss_pct=data.get('max_daily_loss_pct', 5.00),
        max_total_loss_pct=data.get('max_total_loss_pct', 10.00),
        profit_target_pct=data.get('profit_target_pct', 10.00),
        description=data.get('description')
    )
    
    db.session.add(plan)
    db.session.commit()
    
    return jsonify({
        'message': 'Plan created',
        'plan': plan.to_dict()
    }), 201


@admin_bp.route('/plans/<int:plan_id>', methods=['PUT'])
@admin_required
def update_plan(plan_id):
    """Update a plan"""
    plan = Plan.query.get(plan_id)
    
    if not plan:
        return jsonify({'error': 'Plan not found'}), 404
    
    data = request.get_json()
    
    if 'name' in data:
        plan.name = data['name']
    if 'price_dh' in data:
        plan.price_dh = data['price_dh']
    if 'initial_balance' in data:
        plan.initial_balance = data['initial_balance']
    if 'description' in data:
        plan.description = data['description']
    if 'max_daily_loss_pct' in data:
        plan.max_daily_loss_pct = data['max_daily_loss_pct']
    if 'max_total_loss_pct' in data:
        plan.max_total_loss_pct = data['max_total_loss_pct']
    if 'profit_target_pct' in data:
        plan.profit_target_pct = data['profit_target_pct']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Plan updated',
        'plan': plan.to_dict()
    }), 200


@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def get_admin_dashboard():
    """Get admin dashboard statistics"""
    total_users = User.query.count()
    total_challenges = Challenge.query.count()
    active_challenges = Challenge.query.filter_by(status='active').count()
    passed_challenges = Challenge.query.filter_by(status='passed').count()
    failed_challenges = Challenge.query.filter_by(status='failed').count()
    
    total_payments = Payment.query.filter_by(status='completed').count()
    total_revenue = db.session.query(db.func.sum(Payment.amount_dh)).filter_by(status='completed').scalar() or 0
    
    return jsonify({
        'users': {
            'total': total_users,
            'admins': User.query.filter_by(is_admin=True).count()
        },
        'challenges': {
            'total': total_challenges,
            'active': active_challenges,
            'passed': passed_challenges,
            'failed': failed_challenges,
            'pass_rate': round((passed_challenges / (passed_challenges + failed_challenges) * 100) if (passed_challenges + failed_challenges) > 0 else 0, 1)
        },
        'revenue': {
            'total_payments': total_payments,
            'total_revenue_dh': float(total_revenue)
        }
    }), 200
