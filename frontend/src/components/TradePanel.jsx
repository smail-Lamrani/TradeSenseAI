import { useState } from 'react'
import './TradePanel.css'

function TradePanel({ symbol, currentPrice, balance, onTrade, disabled = false }) {
    const [quantity, setQuantity] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)

    const tradeValue = currentPrice && quantity ? currentPrice * parseFloat(quantity) : 0

    const handleTrade = async (side) => {
        if (!quantity || parseFloat(quantity) <= 0) {
            setMessage({ type: 'error', text: 'Entrez une quantité valide' })
            return
        }

        setLoading(true)
        setMessage(null)

        const result = await onTrade(side, symbol, parseFloat(quantity))

        if (result.success) {
            setMessage({
                type: 'success',
                text: `${side === 'buy' ? 'Achat' : 'Vente'} exécuté avec succès!`
            })
            setQuantity('')
        } else {
            setMessage({ type: 'error', text: result.error })
        }

        setLoading(false)

        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000)
    }

    return (
        <div className="trade-panel">
            <div className="trade-header">
                <h3>💹 Passer un Ordre</h3>
                <div className="current-price">
                    <span className="price-label">Prix actuel</span>
                    <span className="price-value">
                        ${currentPrice?.toLocaleString() || '---'}
                    </span>
                </div>
            </div>

            <div className="trade-form">
                <div className="form-group">
                    <label className="form-label">Quantité</label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Entrez la quantité"
                        className="form-input"
                        min="0"
                        step="0.01"
                    />
                </div>

                <div className="trade-summary">
                    <div className="summary-row">
                        <span>Valeur totale:</span>
                        <span className="summary-value">${tradeValue.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Balance disponible:</span>
                        <span className="summary-value">${balance?.toLocaleString() || 0}</span>
                    </div>
                </div>

                {message && (
                    <div className={`trade-message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="trade-buttons">
                    <button
                        className="btn btn-buy"
                        onClick={() => handleTrade('buy')}
                        disabled={loading || !quantity}
                    >
                        {loading ? '...' : '📈 ACHETER'}
                    </button>
                    <button
                        className="btn btn-sell"
                        onClick={() => handleTrade('sell')}
                        disabled={loading || !quantity}
                    >
                        {loading ? '...' : '📉 VENDRE'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TradePanel
