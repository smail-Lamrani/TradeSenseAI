import { useState, useEffect } from 'react'
import { API_URL } from '../App'
import './Leaderboard.css'

function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLeaderboard()
        fetchStats()
    }, [])

    const fetchLeaderboard = async () => {
        try {
            const res = await fetch(`${API_URL}/leaderboard`)
            const data = await res.json()
            setLeaderboard(data.leaderboard || [])
        } catch (err) {
            console.error('Error fetching leaderboard:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/leaderboard/stats`)
            const data = await res.json()
            setStats(data)
        } catch (err) {
            console.error('Error fetching stats:', err)
        }
    }

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return '🥇'
            case 2: return '🥈'
            case 3: return '🥉'
            default: return rank
        }
    }

    return (
        <div className="leaderboard-page">
            <div className="container">
                <div className="leaderboard-header">
                    <h1>🏆 Classement des Traders</h1>
                    <p>Top 10 des meilleurs performers de la plateforme</p>
                </div>

                {/* Platform Stats */}
                {stats && (
                    <div className="stats-grid">
                        <div className="stat-card">
                            <span className="stat-icon">👥</span>
                            <div className="stat-info">
                                <span className="stat-value">{stats.total_challenges}</span>
                                <span className="stat-label">Challenges Total</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <span className="stat-icon">🎯</span>
                            <div className="stat-info">
                                <span className="stat-value">{stats.active_challenges}</span>
                                <span className="stat-label">Challenges Actifs</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <span className="stat-icon">🏆</span>
                            <div className="stat-info">
                                <span className="stat-value">{stats.passed_challenges}</span>
                                <span className="stat-label">Traders Funded</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <span className="stat-icon">📈</span>
                            <div className="stat-info">
                                <span className="stat-value">{stats.pass_rate}%</span>
                                <span className="stat-label">Taux de Réussite</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Leaderboard Table */}
                <div className="leaderboard-card card-glass">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Chargement du classement...</p>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">🏁</span>
                            <h3>Aucun trader funded</h3>
                            <p>Soyez le premier à réussir le challenge et apparaître ici!</p>
                        </div>
                    ) : (
                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th>Rang</th>
                                    <th>Trader</th>
                                    <th>Capital Initial</th>
                                    <th>Équité Finale</th>
                                    <th>Profit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((trader) => (
                                    <tr key={trader.challenge_id} className={trader.rank <= 3 ? 'top-three' : ''}>
                                        <td className="rank-cell">
                                            <span className={`rank rank-${trader.rank}`}>
                                                {getRankIcon(trader.rank)}
                                            </span>
                                        </td>
                                        <td className="trader-cell">
                                            <div className="trader-info">
                                                <span className="trader-avatar">
                                                    {trader.username?.charAt(0).toUpperCase() || '?'}
                                                </span>
                                                <span className="trader-name">{trader.username}</span>
                                            </div>
                                        </td>
                                        <td className="capital-cell">
                                            ${trader.initial_balance.toLocaleString()}
                                        </td>
                                        <td className="equity-cell">
                                            ${trader.final_equity.toLocaleString()}
                                        </td>
                                        <td className="profit-cell">
                                            <span className="profit-badge">
                                                +{trader.profit_pct.toFixed(2)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* CTA */}
                <div className="leaderboard-cta">
                    <h2>Prêt à rejoindre le classement?</h2>
                    <p>Commencez votre challenge et prouvez vos compétences de trading.</p>
                    <a href="/pricing" className="btn btn-primary btn-lg">
                        Commencer le Challenge
                    </a>
                </div>
            </div>
        </div>
    )
}

export default Leaderboard
