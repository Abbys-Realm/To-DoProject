import { useState } from 'react'
import { api, setStoredUser } from '../services/api'
import './AuthModal.css'

function AuthModal({ onAuthSuccess }) {
  const [mode, setMode] = useState('login') // 'login' or 'register'
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError(null)
    setSuccessMessage(null)
  }

  const handleTabSwitch = (newMode) => {
    setMode(newMode)
    setError(null)
    setSuccessMessage(null)
  }

  const handleSubmit = async (e) => {
  e.preventDefault()

  setError(null)
  setSuccessMessage(null)
  setLoading(true)

  try {
    if (mode === 'register') {
      const registerRes = await api.register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      })

      setSuccessMessage(
        registerRes.message || 'Account created successfully! Please sign in.'
      )

      setForm({
        username: '',
        email: form.email.trim(),
        password: '',
      })

      setMode('login')

    } else {
      console.log('LOGIN STARTED')

      const loginRes = await api.login({
        email: form.email.trim(),
        password: form.password,
      })

      console.log('LOGIN RESULT:', loginRes)

      if (!loginRes?.JWTtoken) {
        throw new Error('Login succeeded but no authentication token was received.')
      }

      const derivedName = form.email.split('@')[0]

      const userObj = {
        name:
          derivedName.charAt(0).toUpperCase() +
          derivedName.slice(1),
        email: form.email.trim(),
        avatarInitials:
          derivedName.slice(0, 2).toUpperCase() || 'TF',
      }

      setStoredUser(userObj)

      console.log('LOGIN SUCCESS - OPENING DASHBOARD')

      onAuthSuccess(userObj)
    }
  } catch (err) {
    console.error('AUTH ERROR:', err)

    setError(
      err.message || 'Authentication failed. Please try again.'
    )
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </div>
          <h1 className="brand-name">TaskFlow</h1>
          <p className="auth-subtitle">Organize, track, and complete your tasks seamlessly.</p>
        </div>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('register')}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="auth-alert error" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16h.01" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="auth-alert success" role="status">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 11l3 3L22 4" />
              <circle cx="12" cy="12" r="9" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label className="form-field">
              <span>Username</span>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                required
                autoFocus
              />
            </label>
          )}

          <label className="form-field">
            <span>Email address</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoFocus={mode === 'login'}
            />
          </label>

          <label className="form-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={8}
            />
          </label>

          <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
            {loading ? (
              <div className="spinner auth-spinner" aria-hidden="true" />
            ) : mode === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AuthModal
