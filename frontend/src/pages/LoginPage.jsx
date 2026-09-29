import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser'
import { createUser, loginUser } from '../api/client'

export default function LoginPage() {
  const { login } = useUser()
  const navigate = useNavigate()
  const [tab, setTab] = useState('create')

  // Create Account form state
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '' })

  // Sign In form state
  const [signInForm, setSignInForm] = useState({ email: '', password: '' })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    if (!createForm.password || createForm.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      const res = await createUser(createForm)
      login(res.data)
      navigate('/')
    } catch (err) {
      const detail = err.response?.data?.detail
      if (detail === 'Email already registered') {
        setError('That email is already registered. Switch to "Sign In" to login.')
      } else {
        setError(detail || 'Could not create account. Is the backend running?')
      }
    } finally { setLoading(false) }
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await loginUser({ email: signInForm.email, password: signInForm.password })
      login(res.data)
      navigate('/')
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(detail || 'Invalid email or password. Please try again.')
    } finally { setLoading(false) }
  }

  const switchTab = (t) => { setTab(t); setError('') }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Dark top section */}
        <div className="login-top">
          <div className="login-title">Travel Planner Agent</div>
          <div className="login-sub">AI-powered itineraries </div>
        </div>

        {/* White body */}
        <div className="login-body">
          {/* Tabs */}
          <div className="tab-row">
            <button
              className={`tab-btn ${tab === 'create' ? 'active' : ''}`}
              onClick={() => switchTab('create')}
            >
              Create Account
            </button>
            <button
              className={`tab-btn ${tab === 'login' ? 'active' : ''}`}
              onClick={() => switchTab('login')}
            >
              Sign In
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {/* ── CREATE ACCOUNT ── */}
          {tab === 'create' ? (
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  className="form-input"
                  value={createForm.name}
                  onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Alex Johnson"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={createForm.email}
                  onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={createForm.password}
                  onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
              </div>
              <button
                className="btn btn-primary btn-full btn-lg"
                style={{ marginTop: '.25rem' }}
                disabled={loading}
              >
                {loading
                  ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderTopColor: '#fff' }} /> Creating…</>
                  : 'Create Account & Start Planning'}
              </button>
              <p style={{ textAlign: 'center', fontSize: '.78rem', color: 'var(--text3)', marginTop: '1rem' }}>
                Already have an account?{' '}
                <span
                  style={{ color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => switchTab('login')}
                >
                  Sign In
                </span>
              </p>
            </form>
          ) : (
            /* ── SIGN IN ── */
            <form onSubmit={handleSignIn}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={signInForm.email}
                  onChange={e => setSignInForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={signInForm.password}
                  onChange={e => setSignInForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button
                className="btn btn-primary btn-full btn-lg"
                style={{ marginTop: '.25rem' }}
                disabled={loading}
              >
                {loading
                  ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderTopColor: '#fff' }} /> Signing in…</>
                  : 'Sign In'}
              </button>
              <p style={{ textAlign: 'center', fontSize: '.78rem', color: 'var(--text3)', marginTop: '1rem' }}>
                Don't have an account?{' '}
                <span
                  style={{ color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => switchTab('create')}
                >
                  Create one
                </span>
              </p>
            </form>
          )}

          {/* Features list */}
          <div className="feature-list">
            <div className="feature-list-header">What you get</div>
            {[
              'Day-by-day itineraries with IBM Granite AI',
              'RAG-grounded from real destination data',
              'Weather-aware activity planning',
              'Chat refinement · Budget in ₹ INR',
            ].map((text) => (
              <div key={text} className="feature-item">
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>{/* end login-body */}
      </div>
    </div>
  )
}
