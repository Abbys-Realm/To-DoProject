import TaskCard from './TaskCard'
import './TaskList.css'

function TaskList({
  tasks = [],
  subtasksMap = {},
  subtasksLoadingMap = {},
  sortBy,
  onSortChange,
  expandedTaskId,
  onToggleExpand,
  onToggleComplete,
  onToggleImportant,
  onEditTask,
  onDeleteTask,
  onToggleSubtask,
  onAddSubtask,
  onEditSubtask,
  onDeleteSubtask,
  onOpenAddModal,
  onRetry,
  loading,
  error,
}) {
  return (
    <section className="task-section">
      <div className="task-section-header">
        <h2>My Tasks</h2>
        <button type="button" className="btn btn-primary" onClick={onOpenAddModal}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Task
        </button>
      </div>

<div className="task-toolbar">
  <div className="toolbar-right">
    <label className="sort-control">
      <span className="sr-only">Sort by</span>
      <select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
        <option value="id">Sort: Recent</option>
        <option value="title">Sort: Name</option>
        <option value="category">Sort: Category</option>
        <option value="priority">Sort: Priority</option>
        <option value="due_date">Sort: Due Date</option>
            </select>
            </label>
          </div>
      </div>

      {loading && (
        <div className="state-box loading-state" role="status">
          <div className="spinner" aria-hidden="true" />
          <p>Loading tasks from server...</p>
        </div>
      )}

      {!loading && error && (
        <div className="state-box error-state" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" />
          </svg>
          <p>{error}</p>
          <button type="button" className="btn btn-secondary" onClick={onRetry}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && tasks.length === 0 && (
        <div className="state-box empty-state">
          <div className="empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <h3>No tasks found</h3>
          <p>Try a different search, or add a new task to get started.</p>
          <button type="button" className="btn btn-primary" onClick={onOpenAddModal}>
            Add Task
          </button>
        </div>
      )}

      {!loading && !error && tasks.length > 0 && (
        <div className="task-list">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isExpanded={expandedTaskId === task.id}
              subtasks={subtasksMap[task.id] || []}
              subtasksLoading={Boolean(subtasksLoadingMap[task.id])}
              onToggleExpand={onToggleExpand}
              onToggleComplete={onToggleComplete}
              onToggleImportant={onToggleImportant}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onToggleSubtask={onToggleSubtask}
              onAddSubtask={onAddSubtask}
              onEditSubtask={onEditSubtask}
              onDeleteSubtask={onDeleteSubtask}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default TaskList
