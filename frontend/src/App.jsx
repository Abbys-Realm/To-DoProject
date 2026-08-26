import { useState, useEffect, useCallback } from 'react'
import Dashboard from './pages/Dashboard'
import AuthModal from './components/AuthModal'
import ProfileModal from './components/ProfileModal'
import { getToken, getStoredUser, logout } from './services/api'

function App() {
  const [token, setToken] = useState(() => getToken())
  const [user, setUser] = useState(
    () => getStoredUser() || {
      name: 'User',
      email: '',
      avatarInitials: 'TF'
    }
  )
  const [profileOpen, setProfileOpen] = useState(false)

  // ===== Dark mode =====
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('taskflow-theme') === 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      darkMode ? 'dark' : 'light'
    )

    localStorage.setItem(
      'taskflow-theme',
      darkMode ? 'dark' : 'light'
    )
  }, [darkMode])

  const handleLogout = useCallback(() => {
    logout()
    setToken(null)
    setUser(null)
  }, [])

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser)
    setToken(getToken())
  }

  useEffect(() => {
    const onLogoutEvent = () => {
      setToken(null)
      setUser(null)
    }

    window.addEventListener('taskflow:logout', onLogoutEvent)

    return () => {
      window.removeEventListener('taskflow:logout', onLogoutEvent)
    }
  }, [])

  if (!token) {
    return <AuthModal onAuthSuccess={handleAuthSuccess} />
  }

  return (
    <>
    <Dashboard
      user={user}
      onLogout={handleLogout}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      onOpenProfile={() => setProfileOpen(true)}
    />

    {profileOpen && (
    <ProfileModal
    user={user}
    onClose={() => setProfileOpen(false)}
    onLogout={handleLogout}
    onUserUpdated={(updatedUser) => {
      setUser(updatedUser)
    }}
  />
   )}
   </>
  )
}

export default App