import { Link } from 'react-router-dom'
import './LandingPage.css'

function LandingPage() {
    const features = [
        {
            icon: '🚀',
            title: 'Trading Propulsé par l\'IA',
            description: 'Signaux Achat/Vente en temps réel, plans de trade personnalisés, et alertes de risque intelligentes.'
        },
        {
            icon: '📰',
            title: 'Hub d\'Actualités en Direct',
            description: 'Actualités financières en temps réel, résumés de marché IA, et alertes d\'événements économiques.'
        },
        {
            icon: '💬',
            title: 'Zone Communautaire',
            description: 'Discutez avec d\'autres traders, partagez des stratégies, et apprenez des experts.'
        },
        {
            icon: '🎓',
            title: 'Centre MasterClass',
            description: 'Cours du débutant à l\'avancé, webinaires en direct, et parcours d\'apprentissage IA.'
        }
    ]

    const benefits = [
        'Une plateforme unique pour le trading, l\'apprentissage et la communauté',
        'Signaux IA et alertes de risque en temps réel',
        'Actus + social + MasterClass dans une seule interface',
        'Idéal pour les débutants et les traders expérimentés',
        'Vous aide à prendre des décisions plus intelligentes, plus rapidement'
    ]

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg"></div>
                <div className="container hero-content">
                    <div className="hero-badge animate-fadeIn">
                        <span className="badge badge-primary">🌍 Première Prop Firm IA pour l'Afrique</span>
                    </div>
                    <h1 className="hero-title animate-slideUp">
                        TradeSense<span className="text-primary">AI</span>
                    </h1>
                    <p className="hero-subtitle animate-slideUp">
                        La plateforme de trading de nouvelle génération conçue pour guider les traders
                        de tous niveaux avec des analyses IA en temps réel.
                    </p>
                    <div className="hero-cta animate-slideUp">
                        <Link to="/pricing" className="btn btn-primary btn-lg">
                            Commencer le Challenge
                        </Link>
                        <Link to="/leaderboard" className="btn btn-secondary btn-lg">
                            Voir le Classement
                        </Link>
                    </div>
                    <div className="hero-stats">
                        <div className="stat">
                            <span className="stat-value">$5,000</span>
                            <span className="stat-label">Capital de départ</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">10%</span>
                            <span className="stat-label">Objectif profit</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">200 DH</span>
                            <span className="stat-label">À partir de</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <div className="container">
                    <h2 className="section-title">Comment Ça Marche?</h2>
                    <div className="steps">
                        <div className="step">
                            <div className="step-number">1</div>
                            <h3>Choisissez un Plan</h3>
                            <p>Sélectionnez le niveau qui correspond à vos objectifs de trading.</p>
                        </div>
                        <div className="step-arrow">→</div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <h3>Passez le Challenge</h3>
                            <p>Tradez avec notre capital virtuel et atteignez l'objectif de 10% de profit.</p>
                        </div>
                        <div className="step-arrow">→</div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <h3>Devenez Funded</h3>
                            <p>Réussissez le challenge et accédez au statut de trader financé.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="features">
                <div className="container">
                    <h2 className="section-title">Fonctionnalités Puissantes</h2>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card card">
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="why-choose">
                <div className="container">
                    <div className="why-content">
                        <h2>Pourquoi les Traders Choisissent TradeSense AI</h2>
                        <ul className="benefits-list">
                            {benefits.map((benefit, index) => (
                                <li key={index}>
                                    <span className="check">✔</span>
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                        <Link to="/auth" className="btn btn-primary btn-lg">
                            Rejoignez-nous Maintenant
                        </Link>
                    </div>
                    <div className="why-visual">
                        <div className="visual-card card-glass">
                            <div className="visual-header">
                                <span className="live-dot"></span>
                                Dashboard en Direct
                            </div>
                            <div className="visual-chart">
                                <svg viewBox="0 0 200 100" className="chart-svg">
                                    <polyline
                                        fill="none"
                                        stroke="url(#gradient)"
                                        strokeWidth="2"
                                        points="0,80 30,60 60,70 90,40 120,50 150,20 180,30 200,10"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#10b981" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                            <div className="visual-signals">
                                <div className="signal buy">
                                    <span>BUY</span>
                                    <span>AAPL</span>
                                    <span className="confidence">85%</span>
                                </div>
                                <div className="signal sell">
                                    <span>SELL</span>
                                    <span>TSLA</span>
                                    <span className="confidence">72%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <h2>Prêt à Commencer Votre Parcours de Trading?</h2>
                    <p>Rejoignez des milliers de traders qui utilisent TradeSense AI pour réussir.</p>
                    <Link to="/pricing" className="btn btn-primary btn-lg animate-glow">
                        Voir les Tarifs
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <span className="logo-icon">📈</span>
                            <span>TradeSense AI</span>
                        </div>
                        <p>© 2024 TradeSense AI. Tous droits réservés.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage
