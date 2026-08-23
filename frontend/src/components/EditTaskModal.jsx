import { useState } from 'react'
import './AddTaskModal.css'

/**
 * EditTaskModal — Modify an existing task.
 * Uses a child component (EditTaskForm) so that useState initialises
 * from the task prop on mount without needing a useEffect setState.
 */

function EditTaskModal({ isOpen, task, onClose, onSubmit }) {
  if (!isOpen || !task) return null
  return <EditTaskForm key={task.id} task={task} onClose={onClose} onSubmit={onSubmit} />
}

function EditTaskForm({ task, onClose, onSubmit }) {
  // Helper: convert stored ISO due_date → datetime-local input value (no seconds)
  const toLocalInput = (isoStr) => {
    if (!isoStr) return ''
    try {
      const d = new Date(isoStr)
      if (isNaN(d.getTime())) return ''
      // Format: YYYY-MM-DDTHH:MM  (datetime-local format)
      const pad = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    } catch {
      return ''
    }
  }

  const [form, setForm] = useState({
    taskname:    task.taskname || task.title || '',
    category:    task.category || 'Work',
    completed:   Boolean(task.completed || task.status === 'completed'),
    description: task.description || '',
    priority:    task.priority || 'medium',
    due_date:    toLocalInput(task.due_date),
    important:   Boolean(task.important),
    frequency:   task.frequency || 'none',
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.taskname.trim()) return

    onSubmit(task.id, {
      taskname:    form.taskname.trim(),
      category:    form.category,
      completed:   form.completed,
      description: form.description.trim() || null,
      priority:    form.priority,
      due_date:    form.due_date || null,
      important:   form.important,
      frequency:   form.frequency === 'none' ? null : form.frequency,
    })

    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-task-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="edit-task-title">Edit Task</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {/* Task name */}
          <label className="form-field">
            <span>Task name <span className="required-star">*</span></span>
            <input
              type="text"
              name="taskname"
              value={form.taskname}
              onChange={handleChange}
              placeholder="What needs to be done?"
              required
              autoFocus
            />
          </label>

          {/* Description */}
          <label className="form-field">
            <span>Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional notes or details..."
              rows={3}
            />
          </label>

          {/* Category + Priority row */}
          <div className="form-row">
            <label className="form-field">
              <span>Category</span>
              <select name="category" value={form.category} onChange={handleChange}>
                <option value="Work">Work</option>
                <option value="Learning">Learning</option>
                <option value="Fitness">Fitness</option>
                <option value="Projects">Projects</option>
                <option value="Personal">Personal</option>
                <option value="Hygiene">Hygiene</option>
                <option value="Education">Education</option>
                <option value="Shopping">Shopping</option>
                <option value="Chores">Chores</option>
                <option value="Study">Study</option>
                <option value="Health">Health</option>
                <option value="Finance">Finance</option>
              </select>
            </label>

            <label className="form-field">
              <span>Priority</span>
              <select name="priority" value={form.priority} onChange={handleChange}>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </label>
          </div>

          {/* Due date + Frequency row */}
          <div className="form-row">
            <label className="form-field">
              <span>Due date</span>
              <input
                type="datetime-local"
                name="due_date"
                value={form.due_date}
                onChange={handleChange}
              />
            </label>

            <label className="form-field">
              <span>Frequency</span>
              <select name="frequency" value={form.frequency} onChange={handleChange}>
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
          </div>

          {/* Completed + Important row */}
          <div className="form-field-inline-row">
            <label className="form-field-inline">
              <input
                type="checkbox"
                name="completed"
                className="task-checkbox"
                checked={form.completed}
                onChange={handleChange}
              />
              <span>Mark as completed</span>
            </label>

            <label className="form-field-inline">
              <input
                type="checkbox"
                name="important"
                className="task-checkbox"
                checked={form.important}
                onChange={handleChange}
              />
              <span>⭐ Important</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditTaskModal
