import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, API_URL } from '../App'
import './Pricing.css'

function Pricing() {
    const { user, token, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const [plans, setPlans] = useState([])
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [paymentMethod, setPaymentMethod] = useState('mock_cmi')
    const [loading, setLoading] = useState(false)
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        fetchPlans()
    }, [])

    const fetchPlans = async () => {
        try {
            const res = await fetch(`${API_URL}/payments/plans`)
            const data = await res.json()
            setPlans(data.plans || [])
        } catch (err) {
            console.error('Error fetching plans:', err)
        } finally {
            setLoading(false)
        }
    }

    const handlePayment = async () => {
        if (!isAuthenticated) {
            navigate('/auth')
            return
        }

        if (!selectedPlan) {
            alert('Veuillez sélectionner un plan')
            return
        }

        setProcessing(true)

        try {
            const res = await fetch(`${API_URL}/payments/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    plan_id: selectedPlan.id,
                    payment_method: paymentMethod
                })
            })

            const data = await res.json()

            if (res.ok) {
                alert('✅ Paiement réussi! Votre challenge est activé.')
                // Small delay to ensure state is updated
                setTimeout(() => {
                    navigate('/dashboard', { replace: true })
                }, 500)
            } else {
                alert(data.error || 'Erreur de paiement')
            }
        } catch (err) {
            console.error('Payment error:', err)
            alert('Erreur de connexion au serveur')
        } finally {
            setProcessing(false)
        }
    }

    const planFeatures = {
        Starter: ['Capital: $5,000', 'Objectif: 10% profit', 'Perte max: 10%', 'Support email', 'Signaux IA basiques'],
        Pro: ['Capital: $15,000', 'Objectif: 10% profit', 'Perte max: 10%', 'Support prioritaire', 'Signaux IA avancés', 'Accès MasterClass'],
        Elite: ['Capital: $50,000', 'Objectif: 10% profit', 'Perte max: 10%', 'Support VIP 24/7', 'Signaux IA premium', 'MasterClass complète', 'Coaching personnel']
    }

    return (
        <div className="pricing-page">
            <div className="container">
                <div className="pricing-header">
                    <h1>Choisissez Votre Challenge</h1>
                    <p>Sélectionnez le plan qui correspond à vos ambitions de trading</p>
                </div>

                <div className="plans-grid">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`plan-card ${selectedPlan?.id === plan.id ? 'selected' : ''} ${plan.name === 'Pro' ? 'popular' : ''}`}
                            onClick={() => setSelectedPlan(plan)}
                        >
                            {plan.name === 'Pro' && <div className="popular-badge">🔥 Populaire</div>}

                            <div className="plan-header">
                                <h2>{plan.name}</h2>
                                <div className="plan-price">
                                    <span className="price">{plan.price_dh}</span>
                                    <span className="currency">DH</span>
                                </div>
                            </div>

                            <div className="plan-capital">
                                <span className="capital-label">Capital de Trading</span>
                                <span className="capital-value">${plan.initial_balance.toLocaleString()}</span>
                            </div>

                            <ul className="plan-features">
                                {(planFeatures[plan.name] || []).map((feature, index) => (
                                    <li key={index}>
                                        <span className="check">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`btn ${selectedPlan?.id === plan.id ? 'btn-primary' : 'btn-secondary'} btn-lg`}
                                onClick={() => setSelectedPlan(plan)}
                            >
                                {selectedPlan?.id === plan.id ? 'Sélectionné' : 'Choisir'}
                            </button>
                        </div>
                    ))}
                </div>

                {selectedPlan && (
                    <div className="checkout-section animate-slideUp">
                        <div className="checkout-card card-glass">
                            <h3>Finaliser le Paiement</h3>
                            <div className="checkout-summary">
                                <div className="summary-row">
                                    <span>Plan sélectionné:</span>
                                    <span className="value">{selectedPlan.name}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Montant:</span>
                                    <span className="value price">{selectedPlan.price_dh} DH</span>
                                </div>
                            </div>

                            <div className="payment-methods">
                                <h4>Méthode de paiement</h4>
                                <div className="methods-grid">
                                    <label className={`method-option ${paymentMethod === 'mock_cmi' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="mock_cmi"
                                            checked={paymentMethod === 'mock_cmi'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <span className="method-icon">💳</span>
                                        <span className="method-name">CMI</span>
                                    </label>
                                    <label className={`method-option ${paymentMethod === 'mock_crypto' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="mock_crypto"
                                            checked={paymentMethod === 'mock_crypto'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <span className="method-icon">₿</span>
                                        <span className="method-name">Crypto</span>
                                    </label>
                                    <label className={`method-option ${paymentMethod === 'paypal' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="paypal"
                                            checked={paymentMethod === 'paypal'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <span className="method-icon">🅿️</span>
                                        <span className="method-name">PayPal</span>
                                    </label>
                                </div>
                            </div>

                            <button
                                className="btn btn-primary btn-lg checkout-btn"
                                onClick={handlePayment}
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <span className="spinner" style={{ width: 20, height: 20 }}></span>
                                        Traitement...
                                    </>
                                ) : (
                                    `Payer ${selectedPlan.price_dh} DH`
                                )}
                            </button>

                            <p className="checkout-note">
                                * Ceci est un environnement de démonstration. Aucun paiement réel n'est effectué.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Pricing
