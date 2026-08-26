import { useEffect, useState } from 'react'
import './Profile.css'

function Profile({ onLogout }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [emailData, setEmailData] = useState({
    newEmail: '',
    currentPassword: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token')

      const response = await fetch('http://localhost:8080/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load profile')
      }

      setProfile(data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match')
      return
    }

    try {
      const token = localStorage.getItem('token')

      const response = await fetch('http://localhost:8080/auth/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password')
      }

      alert('Password changed successfully')

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

      setShowPasswordForm(false)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleEmailChange = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('token')

      const response = await fetch('http://localhost:8080/auth/email', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(emailData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change email')
      }

      setProfile((prev) => ({
        ...prev,
        email: data.data.email,
      }))

      setEmailData({
        newEmail: '',
        currentPassword: '',
      })

      setShowEmailForm(false)

      alert('Email changed successfully')
    } catch (err) {
      alert(err.message)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')

    if (onLogout) {
      onLogout()
    }
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          Loading profile...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">

      <div className="profile-header">
        <div>
          <h1>Profile</h1>
          <p>Manage your account information</p>
        </div>
      </div>

      <div className="profile-card">

        <div className="profile-avatar">
          {profile?.username?.charAt(0).toUpperCase()}
        </div>

        <h2>{profile?.username}</h2>
        <p>{profile?.email}</p>

      </div>

      <div className="profile-card">

        <h3>Account Information</h3>

        <div className="profile-info">
          <div>
            <span>Username</span>
            <strong>{profile?.username}</strong>
          </div>

          <div>
            <span>Email</span>
            <strong>{profile?.email}</strong>
          </div>
        </div>

      </div>

      <div className="profile-card">

        <h3>Account Security</h3>

        <button
          type="button"
          className="profile-action"
          onClick={() => setShowPasswordForm(!showPasswordForm)}
        >
          <span>Change Password</span>
          <span>›</span>
        </button>

        {showPasswordForm && (
          <form
            className="profile-form"
            onSubmit={handlePasswordChange}
          >
            <input
              type="password"
              placeholder="Current password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              required
            />

            <input
              type="password"
              placeholder="New password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              required
            />

            <input
              type="password"
              placeholder="Confirm new password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              required
            />

            <button type="submit" className="btn btn-primary">
              Change Password
            </button>
          </form>
        )}

        <button
          type="button"
          className="profile-action"
          onClick={() => setShowEmailForm(!showEmailForm)}
        >
          <span>Change Email</span>
          <span>›</span>
        </button>

        {showEmailForm && (
          <form
            className="profile-form"
            onSubmit={handleEmailChange}
          >
            <input
              type="email"
              placeholder="New email"
              value={emailData.newEmail}
              onChange={(e) =>
                setEmailData({
                  ...emailData,
                  newEmail: e.target.value,
                })
              }
              required
            />

            <input
              type="password"
              placeholder="Current password"
              value={emailData.currentPassword}
              onChange={(e) =>
                setEmailData({
                  ...emailData,
                  currentPassword: e.target.value,
                })
              }
              required
            />

            <button type="submit" className="btn btn-primary">
              Change Email
            </button>
          </form>
        )}

      </div>

      <div className="profile-card logout-card">

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          Log Out
        </button>

      </div>

    </div>
  )
}

export default Profile