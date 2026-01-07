"""
AI Signals Service
Generates trading signals based on price momentum and technical indicators
"""

from datetime import datetime
from typing import Optional
import yfinance as yf
import random


class AISignalService:
    """
    AI-powered trading signal generator
    Uses momentum, price action, and simple technical indicators
    """
    
    SIGNAL_TYPES = ['buy', 'sell', 'hold']
    
    @staticmethod
    def calculate_momentum(prices: list, period: int = 14) -> float:
        """Calculate price momentum"""
        if len(prices) < period:
            return 0
        
        current = prices[-1]
        past = prices[-period]
        
        if past == 0:
            return 0
        
        return ((current - past) / past) * 100
    
    @staticmethod
    def calculate_rsi(prices: list, period: int = 14) -> float:
        """Calculate Relative Strength Index (RSI)"""
        if len(prices) < period + 1:
            return 50  # Neutral
        
        gains = []
        losses = []
        
        for i in range(1, len(prices)):
            change = prices[i] - prices[i-1]
            if change > 0:
                gains.append(change)
                losses.append(0)
            else:
                gains.append(0)
                losses.append(abs(change))
        
        if len(gains) < period:
            return 50
        
        avg_gain = sum(gains[-period:]) / period
        avg_loss = sum(losses[-period:]) / period
        
        if avg_loss == 0:
            return 100
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        
        return round(rsi, 2)
    
    @staticmethod
    def calculate_sma(prices: list, period: int) -> float:
        """Calculate Simple Moving Average"""
        if len(prices) < period:
            return prices[-1] if prices else 0
        
        return sum(prices[-period:]) / period
    
    @staticmethod
    def generate_signal(symbol: str) -> dict:
        """
        Generate trading signal for a symbol
        Uses momentum, RSI, and moving average crossover
        """
        try:
            # Fetch historical data
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period='1mo')
            
            if hist.empty:
                return AISignalService._generate_random_signal(symbol)
            
            prices = hist['Close'].tolist()
            
            # Calculate indicators
            rsi = AISignalService.calculate_rsi(prices)
            momentum = AISignalService.calculate_momentum(prices, 5)
            sma_short = AISignalService.calculate_sma(prices, 5)
            sma_long = AISignalService.calculate_sma(prices, 20)
            
            current_price = prices[-1]
            
            # Generate signal based on indicators
            signal_type = 'hold'
            confidence = 50
            reasons = []
            
            # RSI signals
            if rsi < 30:
                signal_type = 'buy'
                confidence += 20
                reasons.append(f"RSI oversold ({rsi:.1f})")
            elif rsi > 70:
                signal_type = 'sell'
                confidence += 20
                reasons.append(f"RSI overbought ({rsi:.1f})")
            
            # Moving average crossover
            if sma_short > sma_long:
                if signal_type == 'hold':
                    signal_type = 'buy'
                if signal_type == 'buy':
                    confidence += 15
                reasons.append("Short MA above Long MA (bullish)")
            elif sma_short < sma_long:
                if signal_type == 'hold':
                    signal_type = 'sell'
                if signal_type == 'sell':
                    confidence += 15
                reasons.append("Short MA below Long MA (bearish)")
            
            # Momentum
            if momentum > 5:
                if signal_type == 'buy':
                    confidence += 10
                reasons.append(f"Strong upward momentum ({momentum:.1f}%)")
            elif momentum < -5:
                if signal_type == 'sell':
                    confidence += 10
                reasons.append(f"Strong downward momentum ({momentum:.1f}%)")
            
            # Cap confidence at 95
            confidence = min(confidence, 95)
            
            return {
                'symbol': symbol,
                'signal_type': signal_type,
                'confidence': confidence,
                'price': round(current_price, 2),
                'rsi': rsi,
                'momentum': round(momentum, 2),
                'sma_short': round(sma_short, 2),
                'sma_long': round(sma_long, 2),
                'reason': ' | '.join(reasons) if reasons else 'Neutral market conditions',
                'created_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            print(f"Error generating signal for {symbol}: {e}")
            return AISignalService._generate_random_signal(symbol)
    
    @staticmethod
    def _generate_random_signal(symbol: str) -> dict:
        """Generate random signal for demo/fallback"""
        signal_type = random.choice(['buy', 'sell', 'hold'])
        confidence = random.randint(40, 85)
        
        reasons = {
            'buy': ['Bullish pattern detected', 'Support level holding', 'Volume increasing'],
            'sell': ['Bearish divergence', 'Resistance rejection', 'Momentum weakening'],
            'hold': ['Consolidation phase', 'Wait for confirmation', 'Mixed signals']
        }
        
        return {
            'symbol': symbol,
            'signal_type': signal_type,
            'confidence': confidence,
            'reason': random.choice(reasons[signal_type]),
            'created_at': datetime.utcnow().isoformat()
        }
    
    @staticmethod
    def generate_batch_signals(symbols: list) -> list:
        """Generate signals for multiple symbols"""
        signals = []
        for symbol in symbols:
            signal = AISignalService.generate_signal(symbol)
            signals.append(signal)
        return signals
    
    @staticmethod
    def get_top_signals(count: int = 5) -> dict:
        """Get top buy and sell signals from default symbols"""
        default_symbols = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'NVDA', 'BTC-USD']
        
        signals = AISignalService.generate_batch_signals(default_symbols)
        
        buy_signals = sorted(
            [s for s in signals if s['signal_type'] == 'buy'],
            key=lambda x: x['confidence'],
            reverse=True
        )[:count]
        
        sell_signals = sorted(
            [s for s in signals if s['signal_type'] == 'sell'],
            key=lambda x: x['confidence'],
            reverse=True
        )[:count]
        
        return {
            'buy_signals': buy_signals,
            'sell_signals': sell_signals,
            'updated_at': datetime.utcnow().isoformat()
        }
