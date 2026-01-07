from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    username = db.Column(db.String(100))
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    challenges = db.relationship('Challenge', backref='user', lazy=True, cascade='all, delete-orphan')
    payments = db.relationship('Payment', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Plan(db.Model):
    __tablename__ = 'plans'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    price_dh = db.Column(db.Numeric(10, 2), nullable=False)
    initial_balance = db.Column(db.Numeric(15, 2), nullable=False)
    max_daily_loss_pct = db.Column(db.Numeric(5, 2), default=5.00)
    max_total_loss_pct = db.Column(db.Numeric(5, 2), default=10.00)
    profit_target_pct = db.Column(db.Numeric(5, 2), default=10.00)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'price_dh': float(self.price_dh),
            'initial_balance': float(self.initial_balance),
            'max_daily_loss_pct': float(self.max_daily_loss_pct),
            'max_total_loss_pct': float(self.max_total_loss_pct),
            'profit_target_pct': float(self.profit_target_pct),
            'description': self.description
        }


class Challenge(db.Model):
    __tablename__ = 'challenges'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    plan_id = db.Column(db.Integer, db.ForeignKey('plans.id'), nullable=False)
    initial_balance = db.Column(db.Numeric(15, 2), nullable=False)
    current_balance = db.Column(db.Numeric(15, 2), nullable=False)
    equity = db.Column(db.Numeric(15, 2), nullable=False)
    daily_start_equity = db.Column(db.Numeric(15, 2), nullable=False)
    status = db.Column(db.String(20), default='active')  # active, passed, failed
    failure_reason = db.Column(db.String(255))
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    end_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    plan = db.relationship('Plan', backref='challenges')
    trades = db.relationship('Trade', backref='challenge', lazy=True, cascade='all, delete-orphan')
    positions = db.relationship('Position', backref='challenge', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'plan_id': self.plan_id,
            'plan_name': self.plan.name if self.plan else None,
            'initial_balance': float(self.initial_balance),
            'current_balance': float(self.current_balance),
            'equity': float(self.equity),
            'daily_start_equity': float(self.daily_start_equity),
            'status': self.status,
            'failure_reason': self.failure_reason,
            'profit_pct': round(((float(self.equity) - float(self.initial_balance)) / float(self.initial_balance)) * 100, 2),
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None
        }


class Trade(db.Model):
    __tablename__ = 'trades'
    
    id = db.Column(db.Integer, primary_key=True)
    challenge_id = db.Column(db.Integer, db.ForeignKey('challenges.id'), nullable=False)
    symbol = db.Column(db.String(20), nullable=False)
    side = db.Column(db.String(10), nullable=False)  # buy, sell
    quantity = db.Column(db.Numeric(15, 6), nullable=False)
    entry_price = db.Column(db.Numeric(15, 6), nullable=False)
    exit_price = db.Column(db.Numeric(15, 6))
    pnl = db.Column(db.Numeric(15, 2), default=0)
    status = db.Column(db.String(20), default='open')  # open, closed
    opened_at = db.Column(db.DateTime, default=datetime.utcnow)
    closed_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'challenge_id': self.challenge_id,
            'symbol': self.symbol,
            'side': self.side,
            'quantity': float(self.quantity),
            'entry_price': float(self.entry_price),
            'exit_price': float(self.exit_price) if self.exit_price else None,
            'pnl': float(self.pnl) if self.pnl else 0,
            'status': self.status,
            'opened_at': self.opened_at.isoformat() if self.opened_at else None,
            'closed_at': self.closed_at.isoformat() if self.closed_at else None
        }


class Position(db.Model):
    __tablename__ = 'positions'
    
    id = db.Column(db.Integer, primary_key=True)
    challenge_id = db.Column(db.Integer, db.ForeignKey('challenges.id'), nullable=False)
    symbol = db.Column(db.String(20), nullable=False)
    quantity = db.Column(db.Numeric(15, 6), nullable=False)
    avg_entry_price = db.Column(db.Numeric(15, 6), nullable=False)
    current_price = db.Column(db.Numeric(15, 6))
    unrealized_pnl = db.Column(db.Numeric(15, 2), default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('challenge_id', 'symbol'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'challenge_id': self.challenge_id,
            'symbol': self.symbol,
            'quantity': float(self.quantity),
            'avg_entry_price': float(self.avg_entry_price),
            'current_price': float(self.current_price) if self.current_price else None,
            'unrealized_pnl': float(self.unrealized_pnl) if self.unrealized_pnl else 0
        }


class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    plan_id = db.Column(db.Integer, db.ForeignKey('plans.id'), nullable=False)
    amount_dh = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)
    transaction_id = db.Column(db.String(255))
    status = db.Column(db.String(20), default='pending')  # pending, completed, failed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    plan = db.relationship('Plan', backref='payments')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'plan_id': self.plan_id,
            'amount_dh': float(self.amount_dh),
            'payment_method': self.payment_method,
            'transaction_id': self.transaction_id,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class PaypalConfig(db.Model):
    __tablename__ = 'paypal_config'
    
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.String(255))
    client_secret = db.Column(db.String(255))
    mode = db.Column(db.String(20), default='sandbox')  # sandbox, live
    is_active = db.Column(db.Boolean, default=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'client_id': self.client_id[:20] + '...' if self.client_id else None,
            'mode': self.mode,
            'is_active': self.is_active,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class MarketData(db.Model):
    __tablename__ = 'market_data'
    
    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(20), nullable=False)
    price = db.Column(db.Numeric(15, 6), nullable=False)
    change_pct = db.Column(db.Numeric(10, 4))
    volume = db.Column(db.Numeric(20, 2))
    source = db.Column(db.String(50), nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('symbol', 'source'),)
    
    def to_dict(self):
        return {
            'symbol': self.symbol,
            'price': float(self.price),
            'change_pct': float(self.change_pct) if self.change_pct else 0,
            'volume': float(self.volume) if self.volume else 0,
            'source': self.source,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class AISignal(db.Model):
    __tablename__ = 'ai_signals'
    
    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(20), nullable=False)
    signal_type = db.Column(db.String(10), nullable=False)  # buy, sell, hold
    confidence = db.Column(db.Numeric(5, 2))
    reason = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'symbol': self.symbol,
            'signal_type': self.signal_type,
            'confidence': float(self.confidence) if self.confidence else 0,
            'reason': self.reason,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


def init_db(app):
    """Initialize database and create default data"""
    with app.app_context():
        db.create_all()
        
        # Create default plans if not exist
        if Plan.query.count() == 0:
            plans = [
                Plan(
                    name='Starter',
                    price_dh=200.00,
                    initial_balance=5000.00,
                    description='Perfect for beginners - Start your trading journey'
                ),
                Plan(
                    name='Pro',
                    price_dh=500.00,
                    initial_balance=15000.00,
                    description='For experienced traders - Higher capital, bigger opportunities'
                ),
                Plan(
                    name='Elite',
                    price_dh=1000.00,
                    initial_balance=50000.00,
                    description='For professional traders - Maximum capital and prestige'
                )
            ]
            for plan in plans:
                db.session.add(plan)
            db.session.commit()
