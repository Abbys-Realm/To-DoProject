import { useEffect, useState } from 'react'
import { api } from '../services/api'
import './ProfileModal.css'

function ProfileModal({ isOpen, user, onClose, onLogout, onUserUpdated }) {
  const [profile, setProfile] = useState(user)
  const [view, setView] = useState('profile')
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

const [newEmail, setNewEmail] = useState('')
const [newUsername, setNewUsername] = useState('')
const [usernameStatus, setUsernameStatus] = useState('')
const [checkingUsername, setCheckingUsername] = useState(false)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await api.getProfile()

      if (res?.data) {
        setProfile(res.data)

        onUserUpdated?.({
          ...res.data,
          name: res.data.username,
          avatarInitials: getInitials(res.data.username),
        })
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile.')
    }
  }
 
  const getInitials = (name = '') => {
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'TF'
  }
  if(!isOpen) return null
  const resetMessages = () => {
    setMessage('')
    setError('')
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    resetMessages()

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }

    if (newPassword.length < 8 || newPassword.length > 12) {
      setError('Password must be between 8 and 12 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const res = await api.changePassword(
        currentPassword,
        newPassword
      )

      setMessage(res?.message || 'Password updated successfully.')

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.message || 'Failed to change password.')
    } finally {
      setLoading(false)
    }
  }
const handleUsernameChange = async (e) => {
  e.preventDefault()
  resetMessages()

  const username = newUsername.trim()

  if (!username) {
    setError('Username cannot be empty.')
    return
  }

  if (username === profile?.username) {
    setError('This is already your username.')
    return
  }

  setCheckingUsername(true)
  setUsernameStatus('')

  try {
    const check = await api.checkUsername(username)

    console.log('USERNAME CHECK:', check)

    if (!check?.available) {
      setUsernameStatus('taken')
      setError('Username is already taken.')
      return
    }

    const res = await api.updateUsername(username)

console.log('USERNAME UPDATE:', res)

const updatedUser = {
  ...res.data,
  name: res.data.username,
  avatarInitials: getInitials(res.data.username),
}

setProfile(updatedUser)
onUserUpdated?.(updatedUser)

setUsernameStatus('')
setNewUsername('')
setMessage('Username updated successfully.')

// Remove message after 3 seconds
setTimeout(() => {
  setMessage('')
}, 3000)
  } catch (err) {
    console.error('USERNAME ERROR:', err)
    setError(err.message || 'Failed to update username.')
  } finally {
    setCheckingUsername(false)
  }
}
  const handleChangeEmail = async (e) => {
    e.preventDefault()
    resetMessages()

    if (!newEmail || !currentPassword) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)

    try {
      const res = await api.changeEmail(
        newEmail,
        currentPassword
      )

      const updatedUser = {
        ...res.data,
        name: res.data.username,
        avatarInitials: getInitials(res.data.username),
      }

      setProfile(updatedUser)
      onUserUpdated?.(updatedUser)

      setMessage(res?.message || 'Email updated successfully.')

      setNewEmail('')
      setCurrentPassword('')
    } catch (err) {
      setError(err.message || 'Failed to change email.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    resetMessages()
    setView('profile')

    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setNewEmail('')
    setNewUsername('')
    setUsernameStatus('')
  }

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div
        className="profile-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="profile-modal-header">
          {view !== 'profile' ? (
            <button
              type="button"
              className="profile-back-btn"
              onClick={handleBack}
              aria-label="Back"
            >
              ←
            </button>
          ) : (
            <div />
          )}

          <h2>
          {view === 'profile'
            ? 'My Profile'
            : view === 'username'
           ? 'Change Username'
           : view === 'password'
           ? 'Change Password'
           : 'Change Email'}
           </h2>

          <button
            type="button"
            className="profile-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="profile-message error">
            {error}
          </div>
        )}

        {message && (
          <div className="profile-message success">
            {message}
          </div>
        )}

        {/* PROFILE */}
        {view === 'profile' && (
          <div className="profile-content">

            <div className="profile-large-avatar">
              {profile?.avatarInitials ||
                getInitials(profile?.username || profile?.name)}
            </div>

            <h3>
              {profile?.username ||
                profile?.name ||
                'User'}
            </h3>

            <p className="profile-email-display">
              {profile?.email || ''}
            </p>

            <div className="profile-info-list">

              <div className="profile-info-row">
                <span>Username</span>
                <strong>
                  {profile?.username ||
                    profile?.name ||
                    'User'}
                </strong>
              </div>

              <div className="profile-info-row">
                <span>Email</span>
                <strong>
                  {profile?.email || ''}
                </strong>
              </div>

            </div>

            <div className="profile-actions">
               <button
                type="button"
               className="profile-action-btn"
               onClick={() => {
               resetMessages()
               setNewUsername(profile?.username || '')
               setUsernameStatus('')
                setView('username')
                            }}
                >
                Change Username
               </button>
              <button
                type="button"
                className="profile-action-btn"
                onClick={() => {
                  resetMessages()
                  setView('email')
                }}
              >
                Change Email
              </button>

              <button
                type="button"
                className="profile-action-btn"
                onClick={() => {
                  resetMessages()
                  setView('password')
                }}
              >
                Change Password
              </button>

            </div>

            <button
              type="button"
              className="profile-logout-btn-large"
              onClick={onLogout}
            >
              Log Out
            </button>

          </div>
        )}
        {/* CHANGE USERNAME */}
{view === 'username' && (
  <form
    className="profile-form"
    onSubmit={handleUsernameChange}
  >
    <label>
      New Username
      <input
        type="text"
        value={newUsername}
        onChange={(e) => {
          setNewUsername(e.target.value)
          setUsernameStatus('')
          setError('')
          setMessage('')
        }}
        placeholder="Enter new username"
      />
    </label>

    {usernameStatus === 'available' && (
      <div className="username-available">
        ✓ Username is available
      </div>
    )}

    {usernameStatus === 'taken' && (
      <div className="username-taken">
        ✕ Username is already taken
      </div>
    )}

    <button
      type="submit"
      className="profile-submit-btn"
      disabled={checkingUsername}
    >
      {checkingUsername ? 'Checking...' : 'Update Username'}
    </button>
  </form>
)}
        {/* CHANGE PASSWORD */}
        {view === 'password' && (
          <form
            className="profile-form"
            onSubmit={handleChangePassword}
          >
            <label>
              Current Password
              <input
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(e.target.value)
                }
                placeholder="Enter current password"
              />
            </label>

            <label>
              New Password
              <input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                placeholder="8–12 characters"
              />
            </label>

            <label>
              Confirm New Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Repeat new password"
              />
            </label>

            <button
              type="submit"
              className="profile-submit-btn"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        {/* CHANGE EMAIL */}
        {view === 'email' && (
          <form
            className="profile-form"
            onSubmit={handleChangeEmail}
          >
            <label>
              New Email
              <input
                type="email"
                value={newEmail}
                onChange={(e) =>
                  setNewEmail(e.target.value)
                }
                placeholder="Enter new email"
              />
            </label>

            <label>
              Current Password
              <input
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(e.target.value)
                }
                placeholder="Confirm with your password"
              />
            </label>

            <button
              type="submit"
              className="profile-submit-btn"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Email'}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}

export default ProfileModal