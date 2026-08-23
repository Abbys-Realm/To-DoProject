import { useState } from 'react'
import './Categories.css'

function Categories({ tasks = [] }) {
  const [selectedCategory, setSelectedCategory] = useState(null)

  const categoryMap = tasks.reduce((acc, task) => {
    const category = task.category?.trim() || 'Uncategorized'

    if (!acc[category]) {
      acc[category] = []
    }

    acc[category].push(task)
    return acc
  }, {})

  const categories = Object.entries(categoryMap)

  // ── Category selected ───────────────────────────────────────────────
  if (selectedCategory) {
    const categoryTasks = categoryMap[selectedCategory] || []

    return (
      <div className="categories-page">

        <div className="categories-header category-tasks-header">
          <div>
            <button
              type="button"
              className="category-back-btn"
              onClick={() => setSelectedCategory(null)}
            >
              ← Back to Categories
            </button>

            <h1>{selectedCategory}</h1>

            <p>
              {categoryTasks.length}{' '}
              {categoryTasks.length === 1 ? 'task' : 'tasks'} in this category.
            </p>
          </div>
        </div>

        {categoryTasks.length === 0 ? (
          <div className="categories-empty">
            <h3>No tasks in this category</h3>
          </div>
        ) : (
          <div className="category-task-list">
            {categoryTasks.map((task) => (
              <div
                className="category-task-card"
                key={task.id}
              >
                <div className="category-task-check">
                  {task.completed ? '✓' : ''}
                </div>

                <div className="category-task-info">
                  <h3>
                    {task.taskname || task.title || 'Untitled Task'}
                  </h3>

                  {task.description && (
                    <p>{task.description}</p>
                  )}

                  <div className="category-task-meta">

                    {task.priority && (
                      <span className={`task-priority ${task.priority}`}>
                        {task.priority}
                      </span>
                    )}

                    {task.due_date && (
                      <span>
                        Due:{' '}
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}

                    {task.completed && (
                      <span className="task-completed-label">
                        Completed
                      </span>
                    )}

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Category list ───────────────────────────────────────────────────
  return (
    <div className="categories-page">

      <div className="categories-header">
        <div>
          <h1>Categories</h1>
          <p>
            Organize and view your tasks by category.
          </p>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="categories-empty">
          <h3>No categories yet</h3>
          <p>
            Add a category to a task and it will appear here.
          </p>
        </div>
      ) : (
        <div className="categories-grid">

          {categories.map(([category, categoryTasks]) => (
            <button
              key={category}
              type="button"
              className="category-card"
              onClick={() => setSelectedCategory(category)}
            >

              <div className="category-card-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 13l-7 7-9-9V4h7l9 9z" />
                  <circle cx="7.5" cy="7.5" r="1.2" />
                </svg>
              </div>

              <div className="category-card-content">
                <h3>{category}</h3>

                <p>
                  {categoryTasks.length}{' '}
                  {categoryTasks.length === 1
                    ? 'task'
                    : 'tasks'}
                </p>
              </div>

              <svg
                className="category-arrow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>

            </button>
          ))}

        </div>
      )}
    </div>
  )
}

export default Categories