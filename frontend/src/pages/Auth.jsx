import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, API_URL } from '../App'
import './Auth.css'

function Auth() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const endpoint = isLogin ? '/auth/login' : '/auth/register'
        const body = isLogin
            ? { email, password }
            : { email, password, username }

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            const data = await res.json()

            if (res.ok) {
                login(data.user, data.access_token)
                // Small delay to ensure state is updated before navigation
                setTimeout(() => {
                    navigate('/dashboard', { replace: true })
                }, 100)
            } else {
                setError(data.error || 'Une erreur est survenue')
            }
        } catch (err) {
            setError('Erreur de connexion au serveur')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card card-glass">
                    <div className="auth-header">
                        <h1>{isLogin ? 'Connexion' : 'Inscription'}</h1>
                        <p>{isLogin ? 'Bienvenue! Connectez-vous à votre compte.' : 'Créez votre compte TradeSense AI'}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {!isLogin && (
                            <div className="form-group">
                                <label className="form-label">Nom d'utilisateur</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="form-input"
                                    placeholder="Votre pseudo"
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-input"
                                placeholder="votre@email.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Mot de passe</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input"
                                placeholder="••••••••"
                                minLength={6}
                                required
                            />
                        </div>

                        {error && (
                            <div className="auth-error">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg auth-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner" style={{ width: 20, height: 20 }}></span>
                                    Chargement...
                                </>
                            ) : (
                                isLogin ? 'Se connecter' : 'S\'inscrire'
                            )}
                        </button>
                    </form>

                    <div className="auth-switch">
                        <p>
                            {isLogin ? "Pas encore de compte?" : 'Déjà inscrit?'}
                            <button onClick={() => setIsLogin(!isLogin)} className="switch-btn">
                                {isLogin ? 'Inscrivez-vous' : 'Connectez-vous'}
                            </button>
                        </p>
                    </div>

                    <div className="auth-divider">
                        <span>ou</span>
                    </div>

                    <div className="demo-note">
                        <p>🎮 <strong>Mode Démo:</strong> Utilisez n'importe quel email/mot de passe pour tester la plateforme.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Auth
