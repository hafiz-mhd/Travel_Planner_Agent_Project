import React from 'react'
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { UserProvider, useUser } from './hooks/useUser'
import PlannerPage from './pages/PlannerPage'
import TripsPage from './pages/TripsPage'
import TripDetailPage from './pages/TripDetailPage'
import LoginPage from './pages/LoginPage'
import BackgroundSlideshow from './components/BackgroundSlideshow'

function FloatingNavbar() {
  const { user, logout } = useUser()
  const navigate = useNavigate()

  const initials = user
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'JD'

  return (
    <div className="navbar-wrapper">
      <nav className="navbar">
        {/* Brand Logo */}
        <div className="navbar-brand" onClick={() => navigate('/')}>
          <span>Travel <span className="navbar-brand-text">Planner</span></span>
        </div>

        {/* Center Navigation Links */}
        <div className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Home
          </NavLink>
          {user && (
            <NavLink to="/trips" className={({ isActive }) => (isActive ? 'active' : '')}>
              My Trips
            </NavLink>
          )}
        </div>

        {/* User Profile / Auth */}
        <div className="navbar-user">
          {user ? (
            <>
              <div className="navbar-user-pill">
                <div className="navbar-avatar">{initials}</div>
                <span>{user.name}</span>
              </div>
              <button className="navbar-signout-btn" onClick={logout} title="Sign Out">
                Sign Out
              </button>
            </>
          ) : (
            <NavLink to="/login" className="navbar-signout-btn">
              Sign In
            </NavLink>
          )}
        </div>
      </nav>
    </div>
  )
}

function Shell() {
  const { user } = useUser()

  return (
    <div className="app-shell">
      <BackgroundSlideshow />
      <FloatingNavbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={user ? <PlannerPage /> : <LoginPage />} />
        <Route path="/trips" element={user ? <TripsPage /> : <LoginPage />} />
        <Route path="/trips/:id" element={user ? <TripDetailPage /> : <LoginPage />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </UserProvider>
  )
}
