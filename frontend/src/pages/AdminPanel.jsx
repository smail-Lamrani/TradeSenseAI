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
        const res = await fetch(`${API_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setUsers(data.users || [])
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
                <h2>⚙️ Admin</h2>
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
                        🅿️ PayPal Config
                    </button>
                </nav>
            </div>

            <div className="admin-content">
                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && dashboard && (
                    <div className="admin-dashboard">
                        <h1>Dashboard Admin</h1>
                        <div className="admin-stats">
                            <div className="stat-card">
                                <span className="stat-icon">👥</span>
                                <div>
                                    <span className="stat-value">{dashboard.users?.total || 0}</span>
                                    <span className="stat-label">Utilisateurs</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <span className="stat-icon">🎯</span>
                                <div>
                                    <span className="stat-value">{dashboard.challenges?.total || 0}</span>
                                    <span className="stat-label">Challenges</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <span className="stat-icon">🏆</span>
                                <div>
                                    <span className="stat-value">{dashboard.challenges?.passed || 0}</span>
                                    <span className="stat-label">Funded</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <span className="stat-icon">💰</span>
                                <div>
                                    <span className="stat-value">{dashboard.revenue?.total_revenue_dh || 0} DH</span>
                                    <span className="stat-label">Revenus</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="admin-section">
                        <h1>Utilisateurs ({users.length})</h1>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Email</th>
                                    <th>Username</th>
                                    <th>Admin</th>
                                    <th>Créé le</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.email}</td>
                                        <td>{user.username || '-'}</td>
                                        <td>{user.is_admin ? '✅' : '❌'}</td>
                                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Challenges Tab */}
                {activeTab === 'challenges' && (
                    <div className="admin-section">
                        <h1>Challenges ({challenges.length})</h1>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>User</th>
                                    <th>Plan</th>
                                    <th>Balance</th>
                                    <th>Equity</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {challenges.map(c => (
                                    <tr key={c.id}>
                                        <td>{c.id}</td>
                                        <td>{c.user_id}</td>
                                        <td>{c.plan_name}</td>
                                        <td>${c.initial_balance}</td>
                                        <td>${c.equity}</td>
                                        <td>
                                            <span className={`badge badge-${c.status === 'passed' ? 'success' : c.status === 'failed' ? 'danger' : 'primary'}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Payments Tab */}
                {activeTab === 'payments' && (
                    <div className="admin-section">
                        <h1>Paiements ({payments.length})</h1>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>User</th>
                                    <th>Montant</th>
                                    <th>Méthode</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.id}</td>
                                        <td>{p.user_id}</td>
                                        <td>{p.amount_dh} DH</td>
                                        <td>{p.payment_method}</td>
                                        <td>
                                            <span className={`badge badge-${p.status === 'completed' ? 'success' : 'warning'}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td>{new Date(p.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* PayPal Config Tab */}
                {activeTab === 'paypal' && (
                    <div className="admin-section">
                        <h1>Configuration PayPal</h1>
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
                                    <option value="sandbox">Sandbox (Test)</option>
                                    <option value="live">Live (Production)</option>
                                </select>
                            </div>
                            <button className="btn btn-primary" onClick={savePaypalConfig}>
                                Sauvegarder
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminPanel
