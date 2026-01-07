"""
TradeSense AI - Prop Trading Platform
Main Flask Application Entry Point
"""

import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime

from config import config
from models import db, init_db
from routes import (
    auth_bp,
    challenge_bp,
    trades_bp,
    payments_bp,
    market_bp,
    leaderboard_bp,
    admin_bp
)
from services.challenge_engine import reset_daily_equity


def create_app(config_name=None):
    """Application factory"""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    CORS(app, origins=app.config.get('CORS_ORIGINS', ['*']))
    JWTManager(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(challenge_bp)
    app.register_blueprint(trades_bp)
    app.register_blueprint(payments_bp)
    app.register_blueprint(market_bp)
    app.register_blueprint(leaderboard_bp)
    app.register_blueprint(admin_bp)
    
    # Root route
    @app.route('/')
    def index():
        return jsonify({
            'name': 'TradeSense AI API',
            'version': '1.0.0',
            'status': 'running',
            'endpoints': {
                'auth': '/api/auth',
                'challenges': '/api/challenges',
                'trades': '/api/trades',
                'payments': '/api/payments',
                'market': '/api/market',
                'leaderboard': '/api/leaderboard',
                'admin': '/api/admin'
            }
        })
    
    # Health check
    @app.route('/health')
    def health():
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat()
        })
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'error': 'Internal server error'}), 500
    
    # Initialize database
    with app.app_context():
        init_db(app)
    
    return app


def setup_scheduler(app):
    """Setup background scheduler for daily tasks"""
    scheduler = BackgroundScheduler()
    
    # Reset daily equity at market open (9:30 AM)
    @scheduler.scheduled_job('cron', hour=9, minute=30)
    def daily_reset():
        with app.app_context():
            result = reset_daily_equity()
            print(f"Daily equity reset: {result}")
    
    scheduler.start()
    return scheduler


# Create application instance
app = create_app()

if __name__ == '__main__':
    # Setup scheduler in production
    if os.getenv('FLASK_ENV') == 'production':
        scheduler = setup_scheduler(app)
    
    # Run development server
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
