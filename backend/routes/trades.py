"""
Trade Routes
Handles trade execution and history
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from decimal import Decimal
from models import db, Trade, Position, Challenge
from services.challenge_engine import evaluate_challenge
from services.market_data import MarketDataService

trades_bp = Blueprint('trades', __name__, url_prefix='/api/trades')


@trades_bp.route('', methods=['POST'])
@jwt_required()
def execute_trade():
    """Execute a new trade (buy or sell)"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Get active challenge
    challenge = Challenge.query.filter_by(user_id=user_id, status='active').first()
    
    if not challenge:
        return jsonify({'error': 'No active challenge. Please start a challenge first.'}), 400
    
    # Validate trade data
    symbol = data.get('symbol', '').upper()
    side = data.get('side', '').lower()  # buy or sell
    quantity = data.get('quantity')
    
    if not symbol or not side or not quantity:
        return jsonify({'error': 'Symbol, side (buy/sell), and quantity are required'}), 400
    
    if side not in ['buy', 'sell']:
        return jsonify({'error': 'Side must be "buy" or "sell"'}), 400
    
    try:
        quantity = Decimal(str(quantity))
        if quantity <= 0:
            raise ValueError()
    except:
        return jsonify({'error': 'Quantity must be a positive number'}), 400
    
    # Get current market price
    price_data = MarketDataService.get_price(symbol)
    if not price_data:
        return jsonify({'error': f'Could not fetch price for {symbol}'}), 400
    
    current_price = Decimal(str(price_data['price']))
    trade_value = current_price * quantity
    
    # Check if user has enough balance for buy
    if side == 'buy':
        if trade_value > Decimal(str(challenge.current_balance)):
            return jsonify({'error': 'Insufficient balance for this trade'}), 400
    
    # Execute trade
    if side == 'buy':
        result = _execute_buy(challenge, symbol, quantity, current_price)
    else:
        result = _execute_sell(challenge, symbol, quantity, current_price)
    
    if 'error' in result:
        return jsonify(result), 400
    
    # Evaluate challenge rules after trade
    eval_result = evaluate_challenge(challenge.id)
    
    return jsonify({
        'message': f'{side.capitalize()} order executed',
        'trade': result['trade'],
        'position': result.get('position'),
        'challenge_status': eval_result
    }), 201


def _execute_buy(challenge, symbol, quantity, price):
    """Execute a buy order"""
    trade_value = price * quantity
    
    # Deduct from balance
    challenge.current_balance = Decimal(str(challenge.current_balance)) - trade_value
    
    # Create trade record
    trade = Trade(
        challenge_id=challenge.id,
        symbol=symbol,
        side='buy',
        quantity=quantity,
        entry_price=price,
        status='open'
    )
    db.session.add(trade)
    
    # Update or create position
    position = Position.query.filter_by(challenge_id=challenge.id, symbol=symbol).first()
    
    if position:
        # Average down/up
        total_quantity = Decimal(str(position.quantity)) + quantity
        total_cost = (Decimal(str(position.avg_entry_price)) * Decimal(str(position.quantity))) + (price * quantity)
        position.avg_entry_price = total_cost / total_quantity
        position.quantity = total_quantity
        position.current_price = price
    else:
        position = Position(
            challenge_id=challenge.id,
            symbol=symbol,
            quantity=quantity,
            avg_entry_price=price,
            current_price=price
        )
        db.session.add(position)
    
    db.session.commit()
    
    return {
        'trade': trade.to_dict(),
        'position': position.to_dict()
    }


def _execute_sell(challenge, symbol, quantity, price):
    """Execute a sell order (close position)"""
    # Find existing position
    position = Position.query.filter_by(challenge_id=challenge.id, symbol=symbol).first()
    
    if not position:
        return {'error': f'No open position for {symbol}'}
    
    if quantity > Decimal(str(position.quantity)):
        return {'error': f'Cannot sell more than position size ({position.quantity})'}
    
    # Calculate P&L
    entry_price = Decimal(str(position.avg_entry_price))
    pnl = (price - entry_price) * quantity
    
    # Create trade record
    trade = Trade(
        challenge_id=challenge.id,
        symbol=symbol,
        side='sell',
        quantity=quantity,
        entry_price=entry_price,
        exit_price=price,
        pnl=pnl,
        status='closed',
        closed_at=datetime.utcnow()
    )
    db.session.add(trade)
    
    # Update position
    position.quantity = Decimal(str(position.quantity)) - quantity
    
    if position.quantity <= 0:
        db.session.delete(position)
        position_dict = None
    else:
        position.current_price = price
        position_dict = position.to_dict()
    
    # Add proceeds to balance
    sale_proceeds = price * quantity
    challenge.current_balance = Decimal(str(challenge.current_balance)) + sale_proceeds
    
    db.session.commit()
    
    return {
        'trade': trade.to_dict(),
        'position': position_dict,
        'realized_pnl': float(pnl)
    }


@trades_bp.route('', methods=['GET'])
@jwt_required()
def get_trades():
    """Get trade history for active challenge"""
    user_id = int(get_jwt_identity())
    
    challenge = Challenge.query.filter_by(user_id=user_id, status='active').first()
    
    if not challenge:
        return jsonify({'trades': [], 'message': 'No active challenge'}), 200
    
    trades = Trade.query.filter_by(challenge_id=challenge.id).order_by(Trade.opened_at.desc()).all()
    
    return jsonify({
        'trades': [t.to_dict() for t in trades]
    }), 200


@trades_bp.route('/positions', methods=['GET'])
@jwt_required()
def get_positions():
    """Get open positions for active challenge"""
    user_id = int(get_jwt_identity())
    
    challenge = Challenge.query.filter_by(user_id=user_id, status='active').first()
    
    if not challenge:
        return jsonify({'positions': [], 'message': 'No active challenge'}), 200
    
    positions = Position.query.filter_by(challenge_id=challenge.id).all()
    
    # Update unrealized P&L with current prices
    for pos in positions:
        price_data = MarketDataService.get_price(pos.symbol)
        if price_data:
            current_price = Decimal(str(price_data['price']))
            pos.current_price = current_price
            pos.unrealized_pnl = (current_price - Decimal(str(pos.avg_entry_price))) * Decimal(str(pos.quantity))
    
    db.session.commit()
    
    return jsonify({
        'positions': [p.to_dict() for p in positions]
    }), 200


@trades_bp.route('/history/<int:challenge_id>', methods=['GET'])
@jwt_required()
def get_challenge_trades(challenge_id):
    """Get all trades for a specific challenge"""
    user_id = int(get_jwt_identity())
    
    challenge = Challenge.query.filter_by(id=challenge_id, user_id=user_id).first()
    
    if not challenge:
        return jsonify({'error': 'Challenge not found'}), 404
    
    trades = Trade.query.filter_by(challenge_id=challenge_id).order_by(Trade.opened_at.desc()).all()
    
    return jsonify({
        'trades': [t.to_dict() for t in trades]
    }), 200
