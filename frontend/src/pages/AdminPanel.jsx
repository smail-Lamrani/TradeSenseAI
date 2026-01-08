import { useState, useEffect } from 'react'
import { useAuth, API_URL } from '../App'
import './AdminPanel.css'

function AdminPanel() {
    const { token } = useAuth()
    const [activeTab, setActiveTab] = useState('dashboard')
    const [dashboard, setDashboard] = useState(null)
    const [users, setUsers] = useState([])
    const [challenges, setChallenges] = useState([])
    const [payments, setPayments] = useState([])
    const [paypalConfig, setPaypalConfig] = useState({ client_id: '', client_secret: '', mode: 'sandbox' })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboard()
    }, [])

    useEffect(() => {
        if (activeTab === 'users') fetchUsers()
        if (activeTab === 'challenges') fetchChallenges()
        if (activeTab === 'payments') fetchPayments()
        if (activeTab === 'paypal') fetchPaypalConfig()
    }, [activeTab])

    const fetchDashboard = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setDashboard(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchUsers = async () => {
        try {
            console.log('Fetching users...')
            const res = await fetch(`${API_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            console.log('Users response:', data)
            if (res.ok) {
                setUsers(data.users || [])
            } else {
                console.error('Error fetching users:', data.error)
                alert('Erreur: ' + (data.error || 'Impossible de charger les utilisateurs'))
            }
        } catch (err) {
            console.error('Fetch users error:', err)
            alert('Erreur de connexion au serveur')
        }
    }

    const fetchChallenges = async () => {
        const res = await fetch(`${API_URL}/admin/challenges`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setChallenges(data.challenges || [])
    }

    const fetchPayments = async () => {
        const res = await fetch(`${API_URL}/admin/payments`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setPayments(data.payments || [])
    }

    const fetchPaypalConfig = async () => {
        const res = await fetch(`${API_URL}/admin/paypal/config`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.configured && data.config) {
            setPaypalConfig(prev => ({ ...prev, mode: data.config.mode }))
        }
    }

    const toggleAdmin = async (userId) => {
        if (!confirm('Êtes-vous sûr de vouloir modifier les droits admin de cet utilisateur?')) {
            return
        }

        try {
            const res = await fetch(`${API_URL}/admin/users/${userId}/admin`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) {
                alert(data.message)
                fetchUsers()
            } else {
                alert(data.error)
            }
        } catch (err) {
            alert('Erreur de connexion')
        }
    }

    const savePaypalConfig = async () => {
        const res = await fetch(`${API_URL}/admin/paypal/config`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(paypalConfig)
        })
        const data = await res.json()
        if (res.ok) {
            alert('Configuration PayPal sauvegardée!')
        } else {
            alert(data.error || 'Erreur')
        }
    }

    // Helper to get user email by id
    const getUserEmail = (userId) => {
        const user = users.find(u => u.id === userId)
        return user ? user.email : `User #${userId}`
    }

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="admin-page">
            <div className="admin-sidebar">
                <h2>⚙️ Admin Panel</h2>
                <nav>
                    <button
                        className={activeTab === 'dashboard' ? 'active' : ''}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        📊 Dashboard
                    </button>
                    <button
                        className={activeTab === 'users' ? 'active' : ''}
                        onClick={() => setActiveTab('users')}
                    >
                        👥 Utilisateurs
                    </button>
                    <button
                        className={activeTab === 'challenges' ? 'active' : ''}
                        onClick={() => setActiveTab('challenges')}
                    >
                        🎯 Challenges
                    </button>
                    <button
                        className={activeTab === 'payments' ? 'active' : ''}
                        onClick={() => setActiveTab('payments')}
                    >
                        💳 Paiements
                    </button>
                    <button
                        className={activeTab === 'paypal' ? 'active' : ''}
                        onClick={() => setActiveTab('paypal')}
                    >
                        🅿️ Config PayPal
                    </button>
                </nav>
            </div>

            <div className="admin-content">
                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && dashboard && (
                    <div className="admin-dashboard">
                        <h1>📊 Dashboard Admin</h1>
                        <p className="admin-subtitle">Vue d'ensemble de la plateforme TradeSense AI</p>

                        <div className="admin-stats">
                            <div className="stat-card">
                                <span className="stat-icon">👥</span>
                                <div>
                                    <span className="stat-value">{dashboard.users?.total || 0}</span>
                                    <span className="stat-label">Utilisateurs Total</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <span className="stat-icon">🔐</span>
                                <div>
                                    <span className="stat-value">{dashboard.users?.admins || 0}</span>
                                    <span className="stat-label">Admins</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <span className="stat-icon">🎯</span>
                                <div>
                                    <span className="stat-value">{dashboard.challenges?.total || 0}</span>
                                    <span className="stat-label">Challenges Total</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <span className="stat-icon">🟢</span>
                                <div>
                                    <span className="stat-value">{dashboard.challenges?.active || 0}</span>
                                    <span className="stat-label">Challenges Actifs</span>
                                </div>
                            </div>
                            <div className="stat-card success">
                                <span className="stat-icon">🏆</span>
                                <div>
                                    <span className="stat-value">{dashboard.challenges?.passed || 0}</span>
                                    <span className="stat-label">Funded Traders</span>
                                </div>
                            </div>
                            <div className="stat-card danger">
                                <span className="stat-icon">❌</span>
                                <div>
                                    <span className="stat-value">{dashboard.challenges?.failed || 0}</span>
                                    <span className="stat-label">Échoués</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <span className="stat-icon">📈</span>
                                <div>
                                    <span className="stat-value">{dashboard.challenges?.pass_rate || 0}%</span>
                                    <span className="stat-label">Taux de Réussite</span>
                                </div>
                            </div>
                            <div className="stat-card highlight">
                                <span className="stat-icon">💰</span>
                                <div>
                                    <span className="stat-value">{dashboard.revenue?.total_revenue_dh || 0} DH</span>
                                    <span className="stat-label">Revenus Total</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="admin-section">
                        <h1>👥 Gestion des Utilisateurs</h1>
                        <p className="admin-subtitle">Total: {users.length} comptes enregistrés</p>

                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Email</th>
                                    <th>Username</th>
                                    <th>Admin</th>
                                    <th>Date d'inscription</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>#{user.id}</td>
                                        <td><strong>{user.email}</strong></td>
                                        <td>{user.username || '-'}</td>
                                        <td>
                                            <span className={`badge ${user.is_admin ? 'badge-success' : 'badge-secondary'}`}>
                                                {user.is_admin ? '✅ Admin' : '👤 User'}
                                            </span>
                                        </td>
                                        <td>{new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
                                        <td>
                                            <button
                                                className={`btn btn-sm ${user.is_admin ? 'btn-danger' : 'btn-primary'}`}
                                                onClick={() => toggleAdmin(user.id)}
                                            >
                                                {user.is_admin ? '🔓 Retirer Admin' : '🔐 Donner Admin'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Challenges Tab */}
                {activeTab === 'challenges' && (
                    <div className="admin-section">
                        <h1>🎯 Tous les Challenges</h1>
                        <p className="admin-subtitle">Total: {challenges.length} challenges créés</p>

                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Utilisateur</th>
                                    <th>Plan</th>
                                    <th>Capital Initial</th>
                                    <th>Équité Actuelle</th>
                                    <th>Profit/Perte</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {challenges.map(c => (
                                    <tr key={c.id}>
                                        <td>#{c.id}</td>
                                        <td><strong>User #{c.user_id}</strong></td>
                                        <td>{c.plan_name}</td>
                                        <td>${c.initial_balance?.toLocaleString()}</td>
                                        <td>${c.equity?.toLocaleString()}</td>
                                        <td className={c.profit_pct >= 0 ? 'text-success' : 'text-danger'}>
                                            {c.profit_pct >= 0 ? '+' : ''}{c.profit_pct}%
                                        </td>
                                        <td>
                                            <span className={`badge badge-${c.status === 'passed' ? 'success' : c.status === 'failed' ? 'danger' : 'primary'}`}>
                                                {c.status === 'active' ? '🟢 Actif' : c.status === 'passed' ? '🏆 Réussi' : '❌ Échoué'}
                                            </span>
                                        </td>
                                        <td>{c.start_date ? new Date(c.start_date).toLocaleDateString('fr-FR') : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Payments Tab */}
                {activeTab === 'payments' && (
                    <div className="admin-section">
                        <h1>💳 Historique des Paiements</h1>
                        <p className="admin-subtitle">Total: {payments.length} paiements</p>

                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Transaction</th>
                                    <th>Utilisateur</th>
                                    <th>Plan</th>
                                    <th>Montant</th>
                                    <th>Méthode</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map(p => (
                                    <tr key={p.id}>
                                        <td>#{p.id}</td>
                                        <td><code>{p.transaction_id || '-'}</code></td>
                                        <td><strong>User #{p.user_id}</strong></td>
                                        <td>Plan #{p.plan_id}</td>
                                        <td><strong>{p.amount_dh} DH</strong></td>
                                        <td>
                                            <span className="badge badge-secondary">
                                                {p.payment_method === 'mock_cmi' ? '💳 CMI' :
                                                    p.payment_method === 'mock_crypto' ? '₿ Crypto' :
                                                        p.payment_method === 'paypal' ? '🅿️ PayPal' : p.payment_method}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${p.status === 'completed' ? 'success' : 'warning'}`}>
                                                {p.status === 'completed' ? '✅ Complété' : '⏳ En attente'}
                                            </span>
                                        </td>
                                        <td>{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* PayPal Config Tab */}
                {activeTab === 'paypal' && (
                    <div className="admin-section">
                        <h1>🅿️ Configuration PayPal</h1>
                        <p className="admin-subtitle">Configurer les credentials PayPal pour les paiements réels</p>

                        <div className="paypal-form card">
                            <div className="form-group">
                                <label className="form-label">Client ID</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={paypalConfig.client_id}
                                    onChange={(e) => setPaypalConfig(prev => ({ ...prev, client_id: e.target.value }))}
                                    placeholder="PayPal Client ID"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Client Secret</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={paypalConfig.client_secret}
                                    onChange={(e) => setPaypalConfig(prev => ({ ...prev, client_secret: e.target.value }))}
                                    placeholder="PayPal Client Secret"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mode</label>
                                <select
                                    className="form-input"
                                    value={paypalConfig.mode}
                                    onChange={(e) => setPaypalConfig(prev => ({ ...prev, mode: e.target.value }))}
                                >
                                    <option value="sandbox">🧪 Sandbox (Test)</option>
                                    <option value="live">🚀 Live (Production)</option>
                                </select>
                            </div>
                            <button className="btn btn-primary btn-lg" onClick={savePaypalConfig}>
                                💾 Sauvegarder la Configuration
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminPanel
