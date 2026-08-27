import './ProgressCard.css'

function ProgressCard({ completed, remaining, total, upcomingTasks = [] }) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
  
  const size = 120
  const stroke = 10
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <aside className="overview-panel">
      <section className="progress-card">
        <h2>Overall Progress</h2>
        <p className="progress-subtitle">Keep the momentum going.</p>

        <div className="progress-ring-wrap">
          <svg className="progress-ring" width={size} height={size} aria-hidden="true">
            <circle
              className="progress-ring-bg"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={stroke}
            />
            <circle
              className="progress-ring-fill"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="progress-percent">
            <span className="percent-value">{percent}%</span>
            <span className="percent-label">done</span>
          </div>
        </div>

        <div className="progress-counts">
          <div className="count-item">
            <span className="count-value completed">{completed}</span>
            <span className="count-label">Completed</span>
          </div>
          <div className="count-divider" aria-hidden="true" />
          <div className="count-item">
            <span className="count-value remaining">{remaining}</span>
            <span className="count-label">Remaining</span>
          </div>
        </div>
      </section>

      <section className="upcoming-card">
        <h3>Active Tasks</h3>
        {upcomingTasks.length === 0 ? (
          <p className="upcoming-empty">No active tasks.</p>
        ) : (
          <ul className="upcoming-list">
            {upcomingTasks.map((task) => (
              <li key={task.id}>
                <span className="upcoming-dot" />
                <div className="upcoming-info">
                  <p className="upcoming-title">{task.taskname || task.title}</p>
                  <p className="upcoming-meta">{task.category}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  )
}

export default ProgressCard
