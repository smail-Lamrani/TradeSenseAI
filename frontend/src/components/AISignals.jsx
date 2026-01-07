import { useState, useEffect } from 'react'
import { API_URL } from '../App'
import './AISignals.css'

function AISignals() {
    const [signals, setSignals] = useState({ buy_signals: [], sell_signals: [] })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSignals()
        const interval = setInterval(fetchSignals, 60000) // Update every minute
        return () => clearInterval(interval)
    }, [])

    const fetchSignals = async () => {
        try {
            const res = await fetch(`${API_URL}/market/signals`)
            const data = await res.json()
            setSignals(data)
        } catch (err) {
            console.error('Error fetching signals:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="ai-signals card">
                <h3>🤖 Signaux IA</h3>
                <div className="signal-loading">
                    <div className="spinner"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="ai-signals card">
            <div className="signals-header">
                <h3>🤖 Signaux IA</h3>
                <span className="live-indicator">
                    <span className="live-dot"></span>
                    Live
                </span>
            </div>

            <div className="signals-section">
                <h4 className="section-label buy">📈 Signaux Achat</h4>
                <div className="signals-list">
                    {signals.buy_signals?.length > 0 ? (
                        signals.buy_signals.map((signal, index) => (
                            <div key={index} className="signal-card buy">
                                <div className="signal-main">
                                    <span className="signal-symbol">{signal.symbol}</span>
                                    <span className="signal-type">BUY</span>
                                </div>
                                <div className="signal-details">
                                    <div className="confidence-bar">
                                        <div
                                            className="confidence-fill"
                                            style={{ width: `${signal.confidence}%` }}
                                        ></div>
                                    </div>
                                    <span className="confidence-value">{signal.confidence}%</span>
                                </div>
                                <p className="signal-reason">{signal.reason}</p>
                            </div>
                        ))
                    ) : (
                        <p className="no-signals">Aucun signal d'achat</p>
                    )}
                </div>
            </div>

            <div className="signals-section">
                <h4 className="section-label sell">📉 Signaux Vente</h4>
                <div className="signals-list">
                    {signals.sell_signals?.length > 0 ? (
                        signals.sell_signals.map((signal, index) => (
                            <div key={index} className="signal-card sell">
                                <div className="signal-main">
                                    <span className="signal-symbol">{signal.symbol}</span>
                                    <span className="signal-type">SELL</span>
                                </div>
                                <div className="signal-details">
                                    <div className="confidence-bar sell">
                                        <div
                                            className="confidence-fill"
                                            style={{ width: `${signal.confidence}%` }}
                                        ></div>
                                    </div>
                                    <span className="confidence-value">{signal.confidence}%</span>
                                </div>
                                <p className="signal-reason">{signal.reason}</p>
                            </div>
                        ))
                    ) : (
                        <p className="no-signals">Aucun signal de vente</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AISignals
