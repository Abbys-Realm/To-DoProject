import './StatCard.css'

function StatCard({ label, value, icon, accent, onClick }) {
  return (
    <article
      className={`stat-card accent-${accent} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="stat-card-top">
        <div className="stat-icon" aria-hidden="true">
          {icon}
        </div>
        <div className="stat-indicator" aria-hidden="true" />
      </div>

      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
    </article>
  )
}

export default StatCard