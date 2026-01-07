"""
Market Data Service
Fetches real-time market data from yfinance (US) and web scraping (Morocco)
With fallback to simulated data when APIs fail
"""

import yfinance as yf
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from typing import Optional
import random


class MarketDataService:
    """Service for fetching real-time market data"""
    
    # Supported US symbols
    US_SYMBOLS = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'BTC-USD', 'ETH-USD']
    
    # Morocco symbols (Casablanca Stock Exchange)
    MOROCCO_SYMBOLS = ['IAM', 'ATW', 'BCP', 'BOA', 'CIH', 'CDM', 'LBV', 'MNG', 'TQM', 'WAA']
    
    # Morocco symbol to full name mapping
    MOROCCO_NAMES = {
        'IAM': 'Maroc Telecom',
        'ATW': 'Attijariwafa Bank',
        'BCP': 'Banque Centrale Populaire',
        'BOA': 'Bank of Africa',
        'CIH': 'CIH Bank',
        'CDM': 'Credit Du Maroc',
        'LBV': 'Label Vie',
        'MNG': 'Managem',
        'TQM': 'Taqa Morocco',
        'WAA': 'Wafa Assurance'
    }
    
    # Base prices for simulation (realistic values)
    US_BASE_PRICES = {
        'AAPL': 178.50,
        'TSLA': 248.75,
        'MSFT': 378.20,
        'GOOGL': 141.80,
        'AMZN': 185.60,
        'META': 505.40,
        'NVDA': 495.30,
        'BTC-USD': 43500.00,
        'ETH-USD': 2280.00
    }
    
    @staticmethod
    def get_us_prices(symbols: list[str] = None) -> dict:
        """
        Fetch US stock prices from Yahoo Finance
        Falls back to simulated data if yfinance fails
        """
        if symbols is None:
            symbols = MarketDataService.US_SYMBOLS
        
        results = {}
        
        try:
            # Fetch all symbols at once for efficiency
            tickers = yf.Tickers(' '.join(symbols))
            
            for symbol in symbols:
                try:
                    ticker = tickers.tickers.get(symbol)
                    if ticker:
                        hist = ticker.history(period='5d')
                        
                        if not hist.empty and len(hist) > 0:
                            current_price = float(hist['Close'].iloc[-1])
                            prev_close = float(hist['Close'].iloc[-2]) if len(hist) > 1 else current_price
                            change_pct = ((current_price - prev_close) / prev_close) * 100
                            
                            results[symbol] = {
                                'symbol': symbol,
                                'price': round(current_price, 2),
                                'change_pct': round(change_pct, 2),
                                'volume': int(hist['Volume'].iloc[-1]) if 'Volume' in hist.columns else 0,
                                'source': 'yfinance',
                                'updated_at': datetime.utcnow().isoformat()
                            }
                except Exception as e:
                    print(f"Error fetching {symbol}: {e}")
                    continue
                    
        except Exception as e:
            print(f"Error fetching US prices: {e}")
        
        # Fallback to simulated data for any missing symbols
        for symbol in symbols:
            if symbol not in results:
                results[symbol] = MarketDataService._get_simulated_us_price(symbol)
        
        return results
    
    @staticmethod
    def _get_simulated_us_price(symbol: str) -> dict:
        """Generate simulated US stock price for demo/fallback"""
        base_price = MarketDataService.US_BASE_PRICES.get(symbol, 100.00)
        
        # Add small random variation (-3% to +3%)
        variation = random.uniform(-0.03, 0.03)
        price = base_price * (1 + variation)
        change_pct = variation * 100
        
        return {
            'symbol': symbol,
            'price': round(price, 2),
            'change_pct': round(change_pct, 2),
            'volume': random.randint(1000000, 50000000),
            'source': 'simulated',
            'updated_at': datetime.utcnow().isoformat()
        }
    
    @staticmethod
    def get_single_us_price(symbol: str) -> Optional[dict]:
        """Fetch single US stock price"""
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period='5d')
            
            if not hist.empty and len(hist) > 0:
                current_price = float(hist['Close'].iloc[-1])
                prev_close = float(hist['Close'].iloc[-2]) if len(hist) > 1 else current_price
                change_pct = ((current_price - prev_close) / prev_close) * 100
                
                return {
                    'symbol': symbol,
                    'price': round(current_price, 2),
                    'change_pct': round(change_pct, 2),
                    'volume': int(hist['Volume'].iloc[-1]) if 'Volume' in hist.columns else 0,
                    'source': 'yfinance',
                    'updated_at': datetime.utcnow().isoformat()
                }
        except Exception as e:
            print(f"Error fetching {symbol}: {e}")
        
        # Fallback to simulated price
        return MarketDataService._get_simulated_us_price(symbol)
    
    @staticmethod
    def scrape_morocco_prices() -> dict:
        """
        Scrape Morocco stock prices from Casablanca Stock Exchange
        Uses leboursier.ma as data source
        """
        results = {}
        
        try:
            # Try to scrape from leboursier.ma
            url = "https://www.leboursier.ma/cours"
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'lxml')
                
                # Parse the stock table
                rows = soup.select('table tbody tr')
                
                for row in rows:
                    try:
                        cols = row.select('td')
                        if len(cols) >= 4:
                            symbol = cols[0].get_text(strip=True).upper()
                            
                            # Check if it's one of our tracked symbols
                            if symbol in MarketDataService.MOROCCO_SYMBOLS:
                                price_text = cols[1].get_text(strip=True).replace(',', '.').replace(' ', '')
                                change_text = cols[2].get_text(strip=True).replace(',', '.').replace('%', '').replace(' ', '')
                                
                                price = float(price_text) if price_text else 0
                                change_pct = float(change_text) if change_text else 0
                                
                                results[symbol] = {
                                    'symbol': symbol,
                                    'name': MarketDataService.MOROCCO_NAMES.get(symbol, symbol),
                                    'price': round(price, 2),
                                    'change_pct': round(change_pct, 2),
                                    'source': 'casablanca_bourse',
                                    'updated_at': datetime.utcnow().isoformat()
                                }
                    except Exception as e:
                        continue
                        
        except Exception as e:
            print(f"Error scraping Morocco prices: {e}")
        
        # If scraping fails, return simulated data for demo purposes
        if not results:
            results = MarketDataService._get_simulated_morocco_prices()
        
        return results
    
    @staticmethod
    def _get_simulated_morocco_prices() -> dict:
        """Generate simulated Morocco stock prices for demo"""
        base_prices = {
            'IAM': 120.50,
            'ATW': 485.00,
            'BCP': 268.00,
            'BOA': 185.50,
            'CIH': 320.00,
            'CDM': 445.00,
            'LBV': 4200.00,
            'MNG': 1850.00,
            'TQM': 1120.00,
            'WAA': 3950.00
        }
        
        results = {}
        for symbol, base_price in base_prices.items():
            # Add small random variation (-2% to +2%)
            variation = random.uniform(-0.02, 0.02)
            price = base_price * (1 + variation)
            change_pct = variation * 100
            
            results[symbol] = {
                'symbol': symbol,
                'name': MarketDataService.MOROCCO_NAMES.get(symbol, symbol),
                'price': round(price, 2),
                'change_pct': round(change_pct, 2),
                'source': 'simulated',
                'updated_at': datetime.utcnow().isoformat()
            }
        
        return results
    
    @staticmethod
    def get_all_prices() -> dict:
        """Get all market prices (US + Morocco)"""
        us_prices = MarketDataService.get_us_prices()
        morocco_prices = MarketDataService.scrape_morocco_prices()
        
        return {
            'us': us_prices,
            'morocco': morocco_prices,
            'updated_at': datetime.utcnow().isoformat()
        }
    
    @staticmethod
    def get_price(symbol: str) -> Optional[dict]:
        """Get price for any symbol (US or Morocco)"""
        symbol = symbol.upper()
        
        # Check if it's a Morocco symbol
        if symbol in MarketDataService.MOROCCO_SYMBOLS:
            morocco_prices = MarketDataService.scrape_morocco_prices()
            return morocco_prices.get(symbol)
        
        # Otherwise try US market
        return MarketDataService.get_single_us_price(symbol)
