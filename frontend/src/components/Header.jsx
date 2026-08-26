import './Header.css'

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function Header({
  user,
  onOpenProfile,
  searchQuery,
  onSearchChange,
  onMenuClick,
  darkMode,
  setDarkMode,
}) {
  return (
    <header className="app-header">

      {/* Left side */}
      <div className="header-left">

        <button
          type="button"
          className="menu-toggle btn-icon"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="header-greeting">
          <h1>
            {getGreeting()}, {user?.name || 'User'}
          </h1>

          <p>Let&apos;s get things done.</p>
        </div>

      </div>

      {/* Right side */}
      <div className="header-actions">

        {/* Search */}
        <div className="header-search">
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3-3" />
          </svg>

          <input
            type="search"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search tasks"
          />
        </div>

        {/* Dark mode */}
        <button
          type="button"
          className="btn-icon theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
          aria-label={
            darkMode
              ? 'Switch to light mode'
              : 'Switch to dark mode'
          }
          title={
            darkMode
              ? 'Switch to light mode'
              : 'Switch to dark mode'
          }
        >
          {darkMode ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="btn-icon"
          aria-label="Notifications"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 8a6 6 0 0112 0c0 7 3 7 3 9H3c0-2 3-2 3-9" />
            <path d="M10 21a2 2 0 004 0" />
          </svg>

          <span className="notif-dot" aria-hidden="true" />
        </button>

        {/* Profile */}
        <button
          type="button"
          className="header-avatar"
          aria-label="Open profile"
          title="Profile"
          onClick={onOpenProfile}
        >
          {user?.avatarInitials || 'TF'}
        </button>

      </div>
    </header>
  )
}

export default Header