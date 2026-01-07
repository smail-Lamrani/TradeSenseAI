-- TradeSense AI - Prop Trading Platform
-- Database Schema (SQLite / PostgreSQL compatible)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Challenge tiers/plans
CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL,
    price_dh DECIMAL(10, 2) NOT NULL,
    initial_balance DECIMAL(15, 2) NOT NULL,
    max_daily_loss_pct DECIMAL(5, 2) DEFAULT 5.00,
    max_total_loss_pct DECIMAL(5, 2) DEFAULT 10.00,
    profit_target_pct DECIMAL(5, 2) DEFAULT 10.00,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default plans
INSERT INTO plans (name, price_dh, initial_balance, description) VALUES
    ('Starter', 200.00, 5000.00, 'Perfect for beginners - Start your trading journey'),
    ('Pro', 500.00, 15000.00, 'For experienced traders - Higher capital, bigger opportunities'),
    ('Elite', 1000.00, 50000.00, 'For professional traders - Maximum capital and prestige');

-- User challenges (purchased challenges)
CREATE TABLE IF NOT EXISTS challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan_id INTEGER NOT NULL,
    initial_balance DECIMAL(15, 2) NOT NULL,
    current_balance DECIMAL(15, 2) NOT NULL,
    equity DECIMAL(15, 2) NOT NULL,
    daily_start_equity DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'passed', 'failed')),
    failure_reason VARCHAR(255),
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id)
);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    challenge_id INTEGER NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL CHECK (side IN ('buy', 'sell')),
    quantity DECIMAL(15, 6) NOT NULL,
    entry_price DECIMAL(15, 6) NOT NULL,
    exit_price DECIMAL(15, 6),
    pnl DECIMAL(15, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
);

-- Positions table (current open positions)
CREATE TABLE IF NOT EXISTS positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    challenge_id INTEGER NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    quantity DECIMAL(15, 6) NOT NULL,
    avg_entry_price DECIMAL(15, 6) NOT NULL,
    current_price DECIMAL(15, 6),
    unrealized_pnl DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
    UNIQUE(challenge_id, symbol)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan_id INTEGER NOT NULL,
    amount_dh DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id)
);

-- PayPal configuration (SuperAdmin)
CREATE TABLE IF NOT EXISTS paypal_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id VARCHAR(255),
    client_secret VARCHAR(255),
    mode VARCHAR(20) DEFAULT 'sandbox' CHECK (mode IN ('sandbox', 'live')),
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market data cache
CREATE TABLE IF NOT EXISTS market_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol VARCHAR(20) NOT NULL,
    price DECIMAL(15, 6) NOT NULL,
    change_pct DECIMAL(10, 4),
    volume DECIMAL(20, 2),
    source VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, source)
);

-- AI Signals
CREATE TABLE IF NOT EXISTS ai_signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol VARCHAR(20) NOT NULL,
    signal_type VARCHAR(10) NOT NULL CHECK (signal_type IN ('buy', 'sell', 'hold')),
    confidence DECIMAL(5, 2),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard view (for Top 10 Traders)
CREATE VIEW IF NOT EXISTS leaderboard AS
SELECT 
    u.id as user_id,
    u.username,
    u.email,
    c.id as challenge_id,
    c.initial_balance,
    c.equity,
    ROUND(((c.equity - c.initial_balance) / c.initial_balance) * 100, 2) as profit_pct,
    c.status,
    c.start_date
FROM challenges c
JOIN users u ON c.user_id = u.id
WHERE c.status = 'passed'
ORDER BY profit_pct DESC
LIMIT 10;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_trades_challenge_id ON trades(challenge_id);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_positions_challenge_id ON positions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data(symbol);
