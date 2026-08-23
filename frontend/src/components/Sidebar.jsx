import './Sidebar.css'

const navItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    id: 'categories',
    label: 'Categories',
    icon: (
       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
       <path d="M20 13l-7 7-9-9V4h7l9 9z" />
       <circle cx="7.5" cy="7.5" r="1.2" />
  </svg>
),
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
   icon: (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="7" />
    <circle cx="12" cy="12" r="2.5" />
  </svg>
),
  },
]

function Sidebar({
  user,
  activeNav,
  onNavChange,
  isOpen,
  onClose,
  onLogout,
}) {
  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </div>
          <span className="brand-name">TaskFlow</span>
        </div>

        <nav className="sidebar-nav" aria-label="Main">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => {
                onNavChange(item.id)
                onClose()
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-profile">
          <div className="profile-avatar" aria-hidden="true">
            {user?.avatarInitials || 'TF'}
          </div>
          <div className="profile-info">
            <p className="profile-name">{user?.name || 'User'}</p>
            <p className="profile-email">{user?.email || ''}</p>
          </div>
          <button
            type="button"
            className="btn-icon profile-logout-btn"
            title="Sign Out"
            onClick={onLogout}
            aria-label="Sign Out"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
