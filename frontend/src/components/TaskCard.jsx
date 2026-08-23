import { useState, useRef, useEffect } from 'react'
import SubtaskList from './SubtaskList'
import './TaskCard.css'

// ── Priority helpers ─────────────────────────────────────────────────────────
const PRIORITY_LABELS = { high: 'High', medium: 'Medium', low: 'Low' }
const PRIORITY_CLASS  = { high: 'priority-high', medium: 'priority-medium', low: 'priority-low' }

// ── Due-date formatter ───────────────────────────────────────────────────────
function formatDueDate(isoStr) {
  if (!isoStr) return null
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return null
  const now = new Date()
  const isOverdue = d < now
  const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  return { label, isOverdue }
}

function TaskCard({
  task,
  isExpanded,
  subtasks = [],
  subtasksLoading = false,
  onToggleExpand,
  onToggleComplete,
  onToggleImportant,
  onEditTask,
  onDeleteTask,
  onToggleSubtask,
  onAddSubtask,
  onEditSubtask,
  onDeleteSubtask,
}) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const isCompleted = Boolean(task.completed || task.status === 'completed')
  const isImportant = Boolean(task.important)
  const taskTitle   = task.taskname || task.title || 'Untitled Task'
  const priority    = task.priority || 'medium'
  const dueDate     = formatDueDate(task.due_date)

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [menuOpen])

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return
    onAddSubtask(task.id, newSubtaskTitle.trim())
    setNewSubtaskTitle('')
  }

  return (
    <article
      className={`task-card ${isCompleted ? 'completed' : ''} ${isExpanded ? 'expanded' : ''} ${isImportant ? 'important' : ''}`}
    >
      <div className="task-card-main">
        {/* Completion checkbox */}
        <label className="task-check-wrap" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            className="task-checkbox"
            checked={isCompleted}
            onChange={() => onToggleComplete(task.id)}
            aria-label={`Mark "${taskTitle}" as ${isCompleted ? 'active' : 'completed'}`}
          />
        </label>

        {/* Main content button (accordion toggle) */}
        <button
          type="button"
          className="task-content"
          onClick={() => onToggleExpand(task.id)}
          aria-expanded={isExpanded}
        >
          <div className="task-title-row">
            <h3 className="task-title">{taskTitle}</h3>
          </div>

          <div className="task-meta">
            <span className="category-chip">{task.category}</span>

            <span className={`priority-badge ${PRIORITY_CLASS[priority] || 'priority-medium'}`}>
              {PRIORITY_LABELS[priority] || 'Medium'}
            </span>

            <span className={`status-pill ${isCompleted ? 'done' : 'active'}`}>
              {isCompleted ? 'Completed' : 'Active'}
            </span>

            {dueDate && (
              <span className={`due-chip ${dueDate.isOverdue && !isCompleted ? 'overdue' : ''}`}>
                📅 {dueDate.label}
              </span>
            )}

            {task.frequency && task.frequency !== 'none' && (
              <span className="frequency-chip">🔄 {task.frequency}</span>
            )}
          </div>
        </button>

        {/* Right-side action buttons */}
        <div className="task-actions">
          {/* Important star toggle */}
          <button
            type="button"
            className={`btn-icon star-btn ${isImportant ? 'starred' : ''}`}
            aria-label={isImportant ? 'Remove from important' : 'Mark as important'}
            title={isImportant ? 'Remove from important' : 'Mark as important'}
            onClick={(e) => {
              e.stopPropagation()
              onToggleImportant(task.id, !isImportant)
            }}
          >
            <svg viewBox="0 0 24 24" fill={isImportant ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>

          {/* Three-dot menu */}
          <div className="task-menu-wrap" ref={menuRef}>
            <button
              type="button"
              className="btn-icon task-more"
              aria-label="More options"
              aria-expanded={menuOpen}
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen((prev) => !prev)
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>

            {menuOpen && (
              <div className="task-dropdown-menu" role="menu" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="dropdown-item"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false)
                    onEditTask(task)
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  <span>Edit Task</span>
                </button>
                <button
                  type="button"
                  className="dropdown-item danger"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false)
                    onDeleteTask(task)
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                  <span>Delete Task</span>
                </button>
              </div>
            )}
          </div>

          {/* Expand / collapse */}
          <button
            type="button"
            className="expand-btn"
            onClick={() => onToggleExpand(task.id)}
            aria-label={isExpanded ? 'Collapse task' : 'Expand task'}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={isExpanded ? 'rotated' : ''}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded section: description + subtasks */}
      {isExpanded && (
        <div className="task-details">
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}
          <SubtaskList
            subtasks={subtasks}
            loading={subtasksLoading}
            onToggleSubtask={(subtaskId) => onToggleSubtask(task.id, subtaskId)}
            onAddSubtask={handleAddSubtask}
            onEditSubtask={(subtaskId, title) => onEditSubtask(task.id, subtaskId, title)}
            onDeleteSubtask={(subtaskId) => onDeleteSubtask(task.id, subtaskId)}
            newSubtaskTitle={newSubtaskTitle}
            onNewSubtaskChange={setNewSubtaskTitle}
          />
        </div>
      )}
    </article>
  )
}

export default TaskCard
