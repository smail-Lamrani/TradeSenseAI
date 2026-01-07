import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, API_URL } from '../App'
import Chart from '../components/Chart'
import AISignals from '../components/AISignals'
import TradePanel from '../components/TradePanel'
import './Dashboard.css'

function Dashboard() {
    const { user, token } = useAuth()
    const [challenge, setChallenge] = useState(null)
    const [positions, setPositions] = useState([])
    const [trades, setTrades] = useState([])
    const [prices, setPrices] = useState({})
    const [selectedSymbol, setSelectedSymbol] = useState('AAPL')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const priceInterval = useRef(null)

    useEffect(() => {
        fetchChallenge()
        fetchPrices()

        // Update prices every 30 seconds
        priceInterval.current = setInterval(fetchPrices, 30000)

        return () => {
            if (priceInterval.current) {
                clearInterval(priceInterval.current)
            }
        }
    }, [])

    useEffect(() => {
        if (challenge) {
            fetchPositions()
            fetchTrades()
        }
    }, [challenge])

    const fetchChallenge = async () => {
        try {
            const res = await fetch(`${API_URL}/challenges/active`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setChallenge(data.challenge)
        } catch (err) {
            console.error('Error fetching challenge:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchPositions = async () => {
        try {
            const res = await fetch(`${API_URL}/trades/positions`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setPositions(data.positions || [])
        } catch (err) {
            console.error('Error fetching positions:', err)
        }
    }

    const fetchTrades = async () => {
        try {
            const res = await fetch(`${API_URL}/trades`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setTrades(data.trades || [])
        } catch (err) {
            console.error('Error fetching trades:', err)
        }
    }

    const fetchPrices = async () => {
        try {
            const res = await fetch(`${API_URL}/market/prices`)
            const data = await res.json()
            setPrices({ ...data.us, ...data.morocco })
        } catch (err) {
            console.error('Error fetching prices:', err)
        }
    }

    const handleTrade = async (side, symbol, quantity) => {
        if (!challenge) {
            return { success: false, error: 'Vous devez avoir un challenge actif pour trader' }
        }

        try {
            const res = await fetch(`${API_URL}/trades`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ side, symbol, quantity })
            })

            const data = await res.json()

            if (res.ok) {
                fetchChallenge()
                fetchPositions()
                fetchTrades()
                return { success: true, data }
            } else {
                return { success: false, error: data.error }
            }
        } catch (err) {
            return { success: false, error: 'Erreur de connexion' }
        }
    }

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Chargement du dashboard...</p>
            </div>
        )
    }

    // Show dashboard with or without challenge
    const hasChallenge = !!challenge
    const profitPct = challenge?.profit_pct || 0
    const isProfit = profitPct >= 0

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div className="container">
                    {/* Welcome Banner for new users without challenge */}
                    {!hasChallenge && (
                        <div className="welcome-banner">
                            <div className="welcome-content">
                                <h2>👋 Bienvenue, {user?.username || 'Trader'}!</h2>
                                <p>Vous êtes connecté. Explorez les marchés et les signaux IA ci-dessous.</p>
                                <p className="highlight">Pour commencer à trader, activez votre premier challenge.</p>
                                <Link to="/pricing" className="btn btn-primary btn-lg">
                                    🚀 Démarrer un Challenge
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Challenge Stats (only if has challenge) */}
                    {hasChallenge && (
                        <>
                            <div className="header-content">
                                <div className="challenge-info">
                                    <h1>Dashboard Trading</h1>
                                    <span className={`badge badge-${challenge.status === 'active' ? 'success' : challenge.status === 'passed' ? 'primary' : 'danger'}`}>
                                        {challenge.status === 'active' ? '🟢 Actif' : challenge.status === 'passed' ? '🏆 Réussi' : '❌ Échoué'}
                                    </span>
                                </div>
                                <div className="challenge-stats">
                                    <div className="stat-box">
                                        <span className="stat-label">Capital Initial</span>
                                        <span className="stat-value">${challenge.initial_balance?.toLocaleString()}</span>
                                    </div>
                                    <div className="stat-box">
                                        <span className="stat-label">Équité Actuelle</span>
                                        <span className="stat-value">${challenge.equity?.toLocaleString()}</span>
                                    </div>
                                    <div className={`stat-box ${isProfit ? 'profit' : 'loss'}`}>
                                        <span className="stat-label">Profit/Perte</span>
                                        <span className="stat-value">{isProfit ? '+' : ''}{profitPct.toFixed(2)}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bars */}
                            <div className="progress-section">
                                <div className="progress-item">
                                    <div className="progress-header">
                                        <span>Objectif Profit (10%)</span>
                                        <span>{Math.min(profitPct, 10).toFixed(1)}% / 10%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill success"
                                            style={{ width: `${Math.min((profitPct / 10) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="progress-item">
                                    <div className="progress-header">
                                        <span>Perte Max Journalière (5%)</span>
                                        <span className="text-danger">Limite</span>
                                    </div>
                                    <div className="progress-bar danger-zone">
                                        <div className="progress-fill danger" style={{ width: '0%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="dashboard-content">
                <div className="container">
                    <div className="dashboard-grid">
                        {/* Chart Section */}
                        <div className="chart-section">
                            <div className="section-header">
                                <h2>📊 Graphique {selectedSymbol}</h2>
                                <select
                                    value={selectedSymbol}
                                    onChange={(e) => setSelectedSymbol(e.target.value)}
                                    className="symbol-select"
                                >
                                    <optgroup label="US Stocks">
                                        <option value="AAPL">AAPL - Apple</option>
                                        <option value="TSLA">TSLA - Tesla</option>
                                        <option value="MSFT">MSFT - Microsoft</option>
                                        <option value="GOOGL">GOOGL - Google</option>
                                        <option value="NVDA">NVDA - Nvidia</option>
                                    </optgroup>
                                    <optgroup label="Crypto">
                                        <option value="BTC-USD">BTC - Bitcoin</option>
                                        <option value="ETH-USD">ETH - Ethereum</option>
                                    </optgroup>
                                    <optgroup label="Morocco">
                                        <option value="IAM">IAM - Maroc Telecom</option>
                                        <option value="ATW">ATW - Attijariwafa Bank</option>
                                    </optgroup>
                                </select>
                            </div>
                            <Chart symbol={selectedSymbol} />

                            {/* Trade Panel */}
                            <TradePanel
                                symbol={selectedSymbol}
                                currentPrice={prices[selectedSymbol]?.price}
                                balance={challenge?.current_balance || 0}
                                onTrade={handleTrade}
                                disabled={!hasChallenge}
                            />

                            {!hasChallenge && (
                                <div className="trade-disabled-overlay">
                                    <p>🔒 Activez un challenge pour trader</p>
                                    <Link to="/pricing" className="btn btn-primary">
                                        Choisir un Plan
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="sidebar">
                            {/* AI Signals */}
                            <AISignals />

                            {/* Positions (only if has challenge) */}
                            {hasChallenge && (
                                <div className="positions-section card">
                                    <h3>📈 Positions Ouvertes</h3>
                                    {positions.length === 0 ? (
                                        <p className="empty-state">Aucune position ouverte</p>
                                    ) : (
                                        <div className="positions-list">
                                            {positions.map((pos) => (
                                                <div key={pos.id} className="position-item">
                                                    <div className="position-info">
                                                        <span className="position-symbol">{pos.symbol}</span>
                                                        <span className="position-qty">{pos.quantity} unités</span>
                                                    </div>
                                                    <div className={`position-pnl ${pos.unrealized_pnl >= 0 ? 'profit' : 'loss'}`}>
                                                        {pos.unrealized_pnl >= 0 ? '+' : ''}${pos.unrealized_pnl?.toFixed(2)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Recent Trades (only if has challenge) */}
                            {hasChallenge && (
                                <div className="trades-section card">
                                    <h3>📋 Trades Récents</h3>
                                    {trades.length === 0 ? (
                                        <p className="empty-state">Aucun trade effectué</p>
                                    ) : (
                                        <div className="trades-list">
                                            {trades.slice(0, 5).map((trade) => (
                                                <div key={trade.id} className="trade-item">
                                                    <div className="trade-info">
                                                        <span className={`trade-side ${trade.side}`}>{trade.side?.toUpperCase()}</span>
                                                        <span className="trade-symbol">{trade.symbol}</span>
                                                    </div>
                                                    <div className="trade-details">
                                                        <span>${trade.entry_price?.toFixed(2)}</span>
                                                        {trade.pnl !== 0 && (
                                                            <span className={trade.pnl >= 0 ? 'text-success' : 'text-danger'}>
                                                                {trade.pnl >= 0 ? '+' : ''}${trade.pnl?.toFixed(2)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Market Prices */}
                            <div className="prices-section card">
                                <h3>💰 Prix du Marché</h3>
                                <div className="prices-list">
                                    {Object.entries(prices).slice(0, 6).map(([symbol, data]) => (
                                        <div key={symbol} className="price-item">
                                            <span className="price-symbol">{symbol}</span>
                                            <div className="price-data">
                                                <span className="price-value">${data?.price?.toLocaleString()}</span>
                                                <span className={`price-change ${data?.change_pct >= 0 ? 'up' : 'down'}`}>
                                                    {data?.change_pct >= 0 ? '+' : ''}{data?.change_pct?.toFixed(2)}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
