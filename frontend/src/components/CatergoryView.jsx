import { useMemo, useState } from 'react'
import './CategoriesView.css'

function CategoriesView({ tasks = [] }) {
  const [selectedCategory, setSelectedCategory] = useState(null)

  const categories = useMemo(() => {
    const grouped = {}

    tasks.forEach((task) => {
      const category = task.category?.trim() || 'Uncategorized'

      if (!grouped[category]) {
        grouped[category] = []
      }

      grouped[category].push(task)
    })

    return grouped
  }, [tasks])

  const categoryNames = Object.keys(categories)

  // Show tasks inside selected category
  if (selectedCategory) {
    const categoryTasks = categories[selectedCategory] || []

    return (
      <section className="categories-view">

        <div className="categories-header">
          <button
            className="back-to-categories"
            onClick={() => setSelectedCategory(null)}
          >
            ← Back to Categories
          </button>

          <h1>{selectedCategory}</h1>

          <p>
            {categoryTasks.length}{' '}
            {categoryTasks.length === 1 ? 'task' : 'tasks'}
          </p>
        </div>

        <div className="category-task-list">
          {categoryTasks.map((task) => (
            <div className="category-task-card" key={task.id}>
              <div
                className={`category-task-status ${
                  task.completed ? 'completed' : ''
                }`}
              />

              <div className="category-task-info">
                <h3>{task.taskname || task.title}</h3>

                {task.description && (
                  <p>{task.description}</p>
                )}
              </div>

              {task.priority && (
                <span className={`priority-${task.priority}`}>
                  {task.priority}
                </span>
              )}
            </div>
          ))}
        </div>

      </section>
    )
  }

  return (
    <section className="categories-view">

      <div className="categories-header">
        <h1>Categories</h1>
        <p>
          Organize your tasks by category.
        </p>
      </div>

      {categoryNames.length === 0 ? (
        <div className="categories-empty">
          <h3>No categories yet</h3>
          <p>
            Add a category when creating a task and it will appear here.
          </p>
        </div>
      ) : (
        <div className="category-grid">
          {categoryNames.map((category) => {
            const taskCount = categories[category].length

            return (
              <button
                key={category}
                className="category-card"
                onClick={() => setSelectedCategory(category)}
              >
                <div className="category-card-icon">
                  {category.charAt(0).toUpperCase()}
                </div>

                <div className="category-card-content">
                  <h3>{category}</h3>

                  <p>
                    {taskCount}{' '}
                    {taskCount === 1 ? 'task' : 'tasks'}
                  </p>
                </div>

                <span className="category-arrow">
                  →
                </span>
              </button>
            )
          })}
        </div>
      )}

    </section>
  )
}

export default CategoriesView