import { useState } from 'react'
import './AddTaskModal.css'

const emptyForm = {
  taskname: '',
  category: 'Work',
  description: '',
  priority: 'medium',
  due_date: '',
  important: false,
  frequency: 'none',
}

function AddTaskModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm)

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleClose = () => {
    setForm(emptyForm)
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.taskname.trim()) return

    onSubmit({
      taskname:    form.taskname.trim(),
      category:    form.category,
      completed:   false,
      description: form.description.trim() || null,
      priority:    form.priority,
      due_date:    form.due_date || null,
      important:   form.important,
      frequency:   form.frequency === 'none' ? null : form.frequency,
    })

    setForm(emptyForm)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={handleClose} role="presentation">
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-task-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="add-task-title">Add Task</h2>
          <button type="button" className="btn-icon" onClick={handleClose} aria-label="Close">
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

          {/* Important toggle */}
          <label className="form-field-inline">
            <input
              type="checkbox"
              name="important"
              className="task-checkbox"
              checked={form.important}
              onChange={handleChange}
            />
            <span>⭐ Mark as important</span>
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddTaskModal
