"""
Payment Routes
Handles mock payment gateway and PayPal integration
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from decimal import Decimal
import time
import uuid
from models import db, Payment, Plan, Challenge, User, PaypalConfig

payments_bp = Blueprint('payments', __name__, url_prefix='/api/payments')


@payments_bp.route('/checkout', methods=['POST'])
@jwt_required()
def checkout():
    """
    Mock payment gateway checkout
    Simulates payment processing and creates challenge on success
    """
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    plan_id = data.get('plan_id')
    payment_method = data.get('payment_method', 'mock_cmi')  # mock_cmi, mock_crypto, paypal
    
    if not plan_id:
        return jsonify({'error': 'Plan ID is required'}), 400
    
    # Get plan
    plan = Plan.query.get(plan_id)
    if not plan:
        return jsonify({'error': 'Plan not found'}), 404
    
    # Check if user already has an active challenge
    existing_challenge = Challenge.query.filter_by(user_id=user_id, status='active').first()
    if existing_challenge:
        return jsonify({'error': 'You already have an active challenge'}), 400
    
    # Simulate payment processing (1-2 seconds delay)
    time.sleep(1.5)
    
    # Generate mock transaction ID
    transaction_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
    
    # Create payment record
    payment = Payment(
        user_id=user_id,
        plan_id=plan_id,
        amount_dh=plan.price_dh,
        payment_method=payment_method,
        transaction_id=transaction_id,
        status='completed'
    )
    db.session.add(payment)
    
    # Create new challenge
    initial_balance = Decimal(str(plan.initial_balance))
    challenge = Challenge(
        user_id=user_id,
        plan_id=plan_id,
        initial_balance=initial_balance,
        current_balance=initial_balance,
        equity=initial_balance,
        daily_start_equity=initial_balance,
        status='active'
    )
    db.session.add(challenge)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Payment successful! Your challenge has been activated.',
        'payment': payment.to_dict(),
        'challenge': challenge.to_dict()
    }), 201


@payments_bp.route('/paypal/create', methods=['POST'])
@jwt_required()
def create_paypal_order():
    """Create PayPal order"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    plan_id = data.get('plan_id')
    
    if not plan_id:
        return jsonify({'error': 'Plan ID is required'}), 400
    
    plan = Plan.query.get(plan_id)
    if not plan:
        return jsonify({'error': 'Plan not found'}), 404
    
    # Get PayPal config
    paypal_config = PaypalConfig.query.filter_by(is_active=True).first()
    
    if not paypal_config or not paypal_config.client_id:
        return jsonify({'error': 'PayPal is not configured'}), 503
    
    # Convert MAD to USD (approximate rate)
    usd_amount = float(plan.price_dh) / 10.0  # Approximate conversion
    
    # Create PayPal order (mock for sandbox)
    order_id = f"PAYPAL-{uuid.uuid4().hex[:12].upper()}"
    
    return jsonify({
        'order_id': order_id,
        'plan_id': plan_id,
        'amount_usd': round(usd_amount, 2),
        'amount_dh': float(plan.price_dh)
    }), 200


@payments_bp.route('/paypal/capture', methods=['POST'])
@jwt_required()
def capture_paypal_order():
    """Capture PayPal order after approval"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    order_id = data.get('order_id')
    plan_id = data.get('plan_id')
    
    if not order_id or not plan_id:
        return jsonify({'error': 'Order ID and Plan ID are required'}), 400
    
    plan = Plan.query.get(plan_id)
    if not plan:
        return jsonify({'error': 'Plan not found'}), 404
    
    # Check for existing active challenge
    existing_challenge = Challenge.query.filter_by(user_id=user_id, status='active').first()
    if existing_challenge:
        return jsonify({'error': 'You already have an active challenge'}), 400
    
    # Create payment record
    payment = Payment(
        user_id=user_id,
        plan_id=plan_id,
        amount_dh=plan.price_dh,
        payment_method='paypal',
        transaction_id=order_id,
        status='completed'
    )
    db.session.add(payment)
    
    # Create challenge
    initial_balance = Decimal(str(plan.initial_balance))
    challenge = Challenge(
        user_id=user_id,
        plan_id=plan_id,
        initial_balance=initial_balance,
        current_balance=initial_balance,
        equity=initial_balance,
        daily_start_equity=initial_balance,
        status='active'
    )
    db.session.add(challenge)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'PayPal payment successful! Your challenge has been activated.',
        'payment': payment.to_dict(),
        'challenge': challenge.to_dict()
    }), 201


@payments_bp.route('/history', methods=['GET'])
@jwt_required()
def get_payment_history():
    """Get payment history for current user"""
    user_id = int(get_jwt_identity())
    
    payments = Payment.query.filter_by(user_id=user_id).order_by(Payment.created_at.desc()).all()
    
    return jsonify({
        'payments': [p.to_dict() for p in payments]
    }), 200


@payments_bp.route('/plans', methods=['GET'])
def get_pricing_plans():
    """Get all available pricing plans (public)"""
    plans = Plan.query.all()
    
    return jsonify({
        'plans': [p.to_dict() for p in plans]
    }), 200
