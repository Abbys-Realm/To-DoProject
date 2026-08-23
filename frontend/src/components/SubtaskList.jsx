import { useState } from 'react'
import './SubtaskList.css'

function SubtaskList({
  subtasks = [],
  loading = false,
  onToggleSubtask,
  onAddSubtask,
  onEditSubtask,
  onDeleteSubtask,
  newSubtaskTitle,
  onNewSubtaskChange,
}) {
  const [editingSubtaskId, setEditingSubtaskId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')

  const completedCount = subtasks.filter((s) => s.completed).length
  const total = subtasks.length
  const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100)

  const handleStartEdit = (subtask) => {
    setEditingSubtaskId(subtask.id)
    setEditingTitle(subtask.title)
  }

  const handleSaveEdit = (subtaskId) => {
    if (editingTitle.trim()) {
      onEditSubtask(subtaskId, editingTitle.trim())
    }
    setEditingSubtaskId(null)
  }

  const handleCancelEdit = () => {
    setEditingSubtaskId(null)
    setEditingTitle('')
  }

  return (
    <div className="subtask-panel">
      <div className="subtask-header">
        <h4>Subtasks</h4>
        <span className="subtask-progress-label">
          {completedCount}/{total} completed
        </span>
      </div>

      {total > 0 && (
        <div className="subtask-progress-bar" aria-hidden="true">
          <div className="subtask-progress-fill" style={{ width: `${percent}%` }} />
        </div>
      )}

      {loading ? (
        <div className="subtask-loading">
          <div className="spinner subtask-spinner" aria-hidden="true" />
          <span>Loading subtasks...</span>
        </div>
      ) : total === 0 ? (
        <p className="subtask-empty">No subtasks yet. Break this task into smaller steps.</p>
      ) : (
        <ul className="subtask-list">
          {subtasks.map((subtask) => (
            <li key={subtask.id} className={`subtask-row ${subtask.completed ? 'done' : ''}`}>
              {editingSubtaskId === subtask.id ? (
                <div className="subtask-edit-row">
                  <input
                    type="text"
                    className="subtask-edit-input"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(subtask.id)
                      if (e.key === 'Escape') handleCancelEdit()
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="btn-icon subtask-btn save-btn"
                    title="Save"
                    onClick={() => handleSaveEdit(subtask.id)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="btn-icon subtask-btn cancel-btn"
                    title="Cancel"
                    onClick={handleCancelEdit}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="subtask-item">
                  <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={subtask.completed}
                    onChange={() => onToggleSubtask(subtask.id)}
                    aria-label={`Toggle subtask ${subtask.title}`}
                  />
                  <span className="subtask-title-text" onClick={() => onToggleSubtask(subtask.id)}>
                    {subtask.title}
                  </span>

                  <div className="subtask-actions">
                    <button
                      type="button"
                      className="btn-icon subtask-btn edit-btn"
                      title="Edit subtask"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartEdit(subtask)
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="btn-icon subtask-btn delete-btn"
                      title="Delete subtask"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteSubtask(subtask.id)
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <form
        className="add-subtask-form"
        onSubmit={(e) => {
          e.preventDefault()
          onAddSubtask()
        }}
      >
        <input
          type="text"
          placeholder="Add a subtask..."
          value={newSubtaskTitle}
          onChange={(e) => onNewSubtaskChange(e.target.value)}
          aria-label="New subtask title"
        />
        <button type="submit" className="btn btn-secondary" disabled={!newSubtaskTitle?.trim()}>
          Add
        </button>
      </form>
    </div>
  )
}

export default SubtaskList
