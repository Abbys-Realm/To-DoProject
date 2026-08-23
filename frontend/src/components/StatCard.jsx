import './StatCard.css'

function StatCard({ label, value, icon, accent }) {
  return (
    <article className={`stat-card accent-${accent}`}>
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
