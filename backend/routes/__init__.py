# Routes package
from routes.auth import auth_bp
from routes.challenge import challenge_bp
from routes.trades import trades_bp
from routes.payments import payments_bp
from routes.market import market_bp
from routes.leaderboard import leaderboard_bp
from routes.admin import admin_bp

__all__ = [
    'auth_bp',
    'challenge_bp',
    'trades_bp',
    'payments_bp',
    'market_bp',
    'leaderboard_bp',
    'admin_bp'
]
