import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import './Navbar.css'

function Navbar() {
    const { user, logout, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">📈</span>
                    <span className="logo-text">TradeSense<span className="logo-ai">AI</span></span>
                </Link>

                <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                    ☰
                </button>

                <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
                    <Link to="/" className="nav-link">Accueil</Link>
                    <Link to="/pricing" className="nav-link">Tarifs</Link>
                    <Link to="/leaderboard" className="nav-link">Classement</Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className="nav-link">Dashboard</Link>
                            {user?.is_admin && (
                                <Link to="/admin" className="nav-link">Admin</Link>
                            )}
                            <div className="nav-user">
                                <span className="user-badge">{user?.username || user?.email}</span>
                                <button onClick={handleLogout} className="btn btn-sm btn-secondary">
                                    Déconnexion
                                </button>
                            </div>
                        </>
                    ) : (
                        <Link to="/auth" className="btn btn-primary btn-sm">
                            Commencer
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar
