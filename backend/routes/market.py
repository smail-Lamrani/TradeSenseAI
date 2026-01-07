"""
Market Data Routes
Provides real-time market data for US and Morocco markets
"""

from flask import Blueprint, request, jsonify
from services.market_data import MarketDataService
from services.ai_signals import AISignalService

market_bp = Blueprint('market', __name__, url_prefix='/api/market')


@market_bp.route('/prices', methods=['GET'])
def get_all_prices():
    """Get all market prices (US + Morocco)"""
    data = MarketDataService.get_all_prices()
    return jsonify(data), 200


@market_bp.route('/us', methods=['GET'])
def get_us_prices():
    """Get US stock prices from Yahoo Finance"""
    symbols = request.args.get('symbols')
    
    if symbols:
        symbol_list = [s.strip().upper() for s in symbols.split(',')]
    else:
        symbol_list = None
    
    prices = MarketDataService.get_us_prices(symbol_list)
    
    return jsonify({
        'market': 'us',
        'source': 'yfinance',
        'prices': prices
    }), 200


@market_bp.route('/morocco', methods=['GET'])
def get_morocco_prices():
    """Get Morocco stock prices (Casablanca Stock Exchange)"""
    prices = MarketDataService.scrape_morocco_prices()
    
    return jsonify({
        'market': 'morocco',
        'source': 'casablanca_bourse',
        'prices': prices
    }), 200


@market_bp.route('/price/<symbol>', methods=['GET'])
def get_single_price(symbol):
    """Get price for a single symbol"""
    price_data = MarketDataService.get_price(symbol.upper())
    
    if not price_data:
        return jsonify({'error': f'Could not fetch price for {symbol}'}), 404
    
    return jsonify(price_data), 200


@market_bp.route('/signals', methods=['GET'])
def get_ai_signals():
    """Get AI trading signals for default symbols"""
    signals = AISignalService.get_top_signals()
    return jsonify(signals), 200


@market_bp.route('/signal/<symbol>', methods=['GET'])
def get_signal_for_symbol(symbol):
    """Get AI trading signal for specific symbol"""
    signal = AISignalService.generate_signal(symbol.upper())
    return jsonify(signal), 200


@market_bp.route('/signals/batch', methods=['POST'])
def get_batch_signals():
    """Get AI signals for multiple symbols"""
    data = request.get_json()
    
    if not data or 'symbols' not in data:
        return jsonify({'error': 'Symbols list is required'}), 400
    
    symbols = [s.upper() for s in data['symbols']]
    signals = AISignalService.generate_batch_signals(symbols)
    
    return jsonify({
        'signals': signals
    }), 200


@market_bp.route('/symbols', methods=['GET'])
def get_available_symbols():
    """Get list of available symbols"""
    return jsonify({
        'us': MarketDataService.US_SYMBOLS,
        'morocco': [
            {'symbol': s, 'name': MarketDataService.MOROCCO_NAMES.get(s, s)}
            for s in MarketDataService.MOROCCO_SYMBOLS
        ]
    }), 200
