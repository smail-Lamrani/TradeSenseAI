"""
Leaderboard Routes
Top traders ranking based on profit percentage
"""

from flask import Blueprint, jsonify
from models import db, Challenge, User

leaderboard_bp = Blueprint('leaderboard', __name__, url_prefix='/api/leaderboard')


@leaderboard_bp.route('', methods=['GET'])
def get_leaderboard():
    """
    Get Top 10 Traders of the Month
    Sorted by profit percentage from passed challenges
    """
    # Query for top performers
    results = db.session.query(
        User.id,
        User.username,
        User.email,
        Challenge.id.label('challenge_id'),
        Challenge.initial_balance,
        Challenge.equity,
        Challenge.status,
        Challenge.start_date,
        Challenge.end_date
    ).join(
        Challenge, User.id == Challenge.user_id
    ).filter(
        Challenge.status == 'passed'
    ).order_by(
        ((Challenge.equity - Challenge.initial_balance) / Challenge.initial_balance).desc()
    ).limit(10).all()
    
    leaderboard = []
    for i, row in enumerate(results):
        profit = float(row.equity) - float(row.initial_balance)
        profit_pct = (profit / float(row.initial_balance)) * 100
        
        leaderboard.append({
            'rank': i + 1,
            'user_id': row.id,
            'username': row.username or row.email.split('@')[0],
            'challenge_id': row.challenge_id,
            'initial_balance': float(row.initial_balance),
            'final_equity': float(row.equity),
            'profit': round(profit, 2),
            'profit_pct': round(profit_pct, 2),
            'start_date': row.start_date.isoformat() if row.start_date else None,
            'end_date': row.end_date.isoformat() if row.end_date else None
        })
    
    return jsonify({
        'leaderboard': leaderboard,
        'total_funded_traders': len(leaderboard)
    }), 200


@leaderboard_bp.route('/all', methods=['GET'])
def get_all_rankings():
    """
    Get all rankings including active challenges
    """
    # Get all challenges with performance data
    results = db.session.query(
        User.id,
        User.username,
        User.email,
        Challenge.id.label('challenge_id'),
        Challenge.initial_balance,
        Challenge.equity,
        Challenge.status,
        Challenge.start_date
    ).join(
        Challenge, User.id == Challenge.user_id
    ).order_by(
        ((Challenge.equity - Challenge.initial_balance) / Challenge.initial_balance).desc()
    ).limit(50).all()
    
    rankings = []
    for i, row in enumerate(results):
        profit = float(row.equity) - float(row.initial_balance)
        profit_pct = (profit / float(row.initial_balance)) * 100
        
        rankings.append({
            'rank': i + 1,
            'user_id': row.id,
            'username': row.username or row.email.split('@')[0],
            'challenge_id': row.challenge_id,
            'profit_pct': round(profit_pct, 2),
            'status': row.status
        })
    
    return jsonify({
        'rankings': rankings
    }), 200


@leaderboard_bp.route('/stats', methods=['GET'])
def get_platform_stats():
    """Get platform statistics"""
    total_challenges = Challenge.query.count()
    passed_challenges = Challenge.query.filter_by(status='passed').count()
    failed_challenges = Challenge.query.filter_by(status='failed').count()
    active_challenges = Challenge.query.filter_by(status='active').count()
    
    # Calculate pass rate
    completed = passed_challenges + failed_challenges
    pass_rate = (passed_challenges / completed * 100) if completed > 0 else 0
    
    # Total profit from passed challenges
    passed = Challenge.query.filter_by(status='passed').all()
    total_profit = sum(float(c.equity) - float(c.initial_balance) for c in passed)
    
    return jsonify({
        'total_challenges': total_challenges,
        'active_challenges': active_challenges,
        'passed_challenges': passed_challenges,
        'failed_challenges': failed_challenges,
        'pass_rate': round(pass_rate, 1),
        'total_profit': round(total_profit, 2)
    }), 200
