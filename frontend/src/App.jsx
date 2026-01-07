import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Pricing from './pages/Pricing'
import Leaderboard from './pages/Leaderboard'
import Auth from './pages/Auth'
import AdminPanel from './pages/AdminPanel'

// Auth Context
export const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

// API Base URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  // Only fetch user on initial mount if we have a token
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${storedToken}` }
          })
          if (res.ok) {
            const data = await res.json()
            setUser(data.user)
            setToken(storedToken)
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('token')
            setToken(null)
          }
        } catch (error) {
          console.error('Auth init error:', error)
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setLoading(false)
      setInitialized(true)
    }

    if (!initialized) {
      initAuth()
    }
  }, [initialized])

  const login = (userData, accessToken) => {
    setUser(userData)
    setToken(accessToken)
    localStorage.setItem('token', accessToken)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user }}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/admin"
            element={user?.is_admin ? <AdminPanel /> : <Navigate to="/" replace />}
          />
        </Routes>
      </Router>
    </AuthContext.Provider>
  )
}

export default App
