"""
Challenge Engine Service
Implements the "Killer Rules" for prop trading challenges
"""

from datetime import datetime
from models import db, Challenge, Trade, Position
from decimal import Decimal


class ChallengeEngine:
    """
    Core engine for evaluating trading challenge rules:
    - Max Daily Loss: 5% → FAILED
    - Max Total Loss: 10% → FAILED  
    - Profit Target: 10% → PASSED
    """
    
    def __init__(self, challenge: Challenge):
        self.challenge = challenge
        self.plan = challenge.plan
        
    def calculate_equity(self) -> Decimal:
        """Calculate current equity including unrealized P&L from open positions"""
        balance = Decimal(str(self.challenge.current_balance))
        
        # Add unrealized P&L from open positions
        positions = Position.query.filter_by(challenge_id=self.challenge.id).all()
        unrealized_pnl = sum(Decimal(str(pos.unrealized_pnl or 0)) for pos in positions)
        
        return balance + unrealized_pnl
    
    def check_daily_loss(self) -> tuple[bool, str]:
        """
        Check if daily loss exceeds 5%
        Returns: (is_failed, reason)
        """
        max_daily_loss_pct = Decimal(str(self.plan.max_daily_loss_pct)) / 100
        daily_start = Decimal(str(self.challenge.daily_start_equity))
        current_equity = self.calculate_equity()
        
        daily_loss = (daily_start - current_equity) / daily_start
        
        if daily_loss >= max_daily_loss_pct:
            return True, f"Daily loss limit exceeded: {float(daily_loss * 100):.2f}% (max: {float(max_daily_loss_pct * 100)}%)"
        
        return False, ""
    
    def check_total_loss(self) -> tuple[bool, str]:
        """
        Check if total loss exceeds 10%
        Returns: (is_failed, reason)
        """
        max_total_loss_pct = Decimal(str(self.plan.max_total_loss_pct)) / 100
        initial = Decimal(str(self.challenge.initial_balance))
        current_equity = self.calculate_equity()
        
        total_loss = (initial - current_equity) / initial
        
        if total_loss >= max_total_loss_pct:
            return True, f"Total loss limit exceeded: {float(total_loss * 100):.2f}% (max: {float(max_total_loss_pct * 100)}%)"
        
        return False, ""
    
    def check_profit_target(self) -> tuple[bool, str]:
        """
        Check if profit target of 10% is reached
        Returns: (is_passed, reason)
        """
        profit_target_pct = Decimal(str(self.plan.profit_target_pct)) / 100
        initial = Decimal(str(self.challenge.initial_balance))
        current_equity = self.calculate_equity()
        
        profit = (current_equity - initial) / initial
        
        if profit >= profit_target_pct:
            return True, f"Profit target reached: {float(profit * 100):.2f}% (target: {float(profit_target_pct * 100)}%)"
        
        return False, ""
    
    def evaluate(self) -> dict:
        """
        Evaluate all rules and update challenge status if needed
        Returns evaluation result
        """
        if self.challenge.status != 'active':
            return {
                'status': self.challenge.status,
                'message': f'Challenge already {self.challenge.status}',
                'changed': False
            }
        
        current_equity = self.calculate_equity()
        
        # Check daily loss first (most restrictive)
        daily_failed, daily_reason = self.check_daily_loss()
        if daily_failed:
            self._fail_challenge(daily_reason)
            return {
                'status': 'failed',
                'reason': daily_reason,
                'equity': float(current_equity),
                'changed': True
            }
        
        # Check total loss
        total_failed, total_reason = self.check_total_loss()
        if total_failed:
            self._fail_challenge(total_reason)
            return {
                'status': 'failed',
                'reason': total_reason,
                'equity': float(current_equity),
                'changed': True
            }
        
        # Check profit target
        passed, pass_reason = self.check_profit_target()
        if passed:
            self._pass_challenge(pass_reason)
            return {
                'status': 'passed',
                'reason': pass_reason,
                'equity': float(current_equity),
                'changed': True
            }
        
        # Update equity
        self.challenge.equity = current_equity
        db.session.commit()
        
        return {
            'status': 'active',
            'equity': float(current_equity),
            'profit_pct': float((current_equity - Decimal(str(self.challenge.initial_balance))) / Decimal(str(self.challenge.initial_balance)) * 100),
            'changed': False
        }
    
    def _fail_challenge(self, reason: str):
        """Mark challenge as failed"""
        self.challenge.status = 'failed'
        self.challenge.failure_reason = reason
        self.challenge.end_date = datetime.utcnow()
        self.challenge.equity = self.calculate_equity()
        db.session.commit()
    
    def _pass_challenge(self, reason: str):
        """Mark challenge as passed"""
        self.challenge.status = 'passed'
        self.challenge.end_date = datetime.utcnow()
        self.challenge.equity = self.calculate_equity()
        db.session.commit()


def evaluate_challenge(challenge_id: int) -> dict:
    """
    Background task function to evaluate a challenge
    Called after each trade
    """
    challenge = Challenge.query.get(challenge_id)
    if not challenge:
        return {'error': 'Challenge not found'}
    
    engine = ChallengeEngine(challenge)
    return engine.evaluate()


def reset_daily_equity():
    """
    Daily task to reset daily_start_equity for all active challenges
    Should be run at market open (e.g., 9:30 AM)
    """
    active_challenges = Challenge.query.filter_by(status='active').all()
    
    for challenge in active_challenges:
        engine = ChallengeEngine(challenge)
        challenge.daily_start_equity = engine.calculate_equity()
    
    db.session.commit()
    
    return {'reset_count': len(active_challenges)}
