import { useMemo, useState } from 'react'
import './CalendarCard.css'

function CalendarCard({ tasks = [] }) {
  const today = new Date()

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )

  const [selectedDate, setSelectedDate] = useState(today)

  const monthName = currentDate.toLocaleString('default', {
    month: 'long',
  })

  const year = currentDate.getFullYear()

  const daysInMonth = new Date(
    year,
    currentDate.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    year,
    currentDate.getMonth(),
    1
  ).getDay()

  const days = useMemo(() => {
    const calendarDays = []

    // Empty spaces before the first day
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(null)
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day)
    }

    return calendarDays
  }, [firstDayOfMonth, daysInMonth])

  const previousMonth = () => {
    setCurrentDate(
      new Date(year, currentDate.getMonth() - 1, 1)
    )
  }

  const nextMonth = () => {
    setCurrentDate(
      new Date(year, currentDate.getMonth() + 1, 1)
    )
  }

  const isToday = (day) => {
    if (!day) return false

    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  const isSelected = (day) => {
    if (!day || !selectedDate) return false

    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    )
  }

  const getTasksForDate = (date) => {
    if (!date) return []

    return tasks.filter((task) => {
      if (!task.due_date) return false

      const taskDate = new Date(task.due_date)

      return (
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getDate() === date.getDate()
      )
    })
  }

  const hasTasks = (day) => {
    if (!day) return false

    const date = new Date(
      year,
      currentDate.getMonth(),
      day
    )

    return getTasksForDate(date).length > 0
  }

  const selectedTasks = getTasksForDate(selectedDate)

  const formatTaskTime = (task) => {
    if (!task.due_date) return ''

    const date = new Date(task.due_date)

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <section className="calendar-card">
      <div className="calendar-header">
        <div>
          <h2>Calendar</h2>
          <p>
            {monthName} {year}
          </p>
        </div>

        <div className="calendar-navigation">
          <button
            type="button"
            onClick={previousMonth}
            aria-label="Previous month"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={nextMonth}
            aria-label="Next month"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="calendar-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
          (day) => (
            <span key={day}>{day}</span>
          )
        )}
      </div>

      <div className="calendar-grid">
        {days.map((day, index) => {
          if (!day) {
            return (
              <span
                key={`empty-${index}`}
                className="calendar-day empty"
              />
            )
          }

          const date = new Date(
            year,
            currentDate.getMonth(),
            day
          )

          return (
            <button
              key={day}
              type="button"
              className={[
                'calendar-day',
                isToday(day) ? 'today' : '',
                isSelected(day) ? 'selected' : '',
                hasTasks(day) ? 'has-task' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setSelectedDate(date)}
            >
              <span>{day}</span>

              {hasTasks(day) && (
                <span
                  className="calendar-task-dot"
                  aria-hidden="true"
                />
              )}
            </button>
          )
        })}
      </div>

      <div className="calendar-schedule">
        <div className="schedule-header">
          <div>
            <h3>
              {isToday(selectedDate)
                ? "Today's Schedule"
                : selectedDate.toLocaleDateString('default', {
                    month: 'short',
                    day: 'numeric',
                  })}
            </h3>

            <span>
              {selectedTasks.length}{' '}
              {selectedTasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>
        </div>

        {selectedTasks.length > 0 ? (
          <div className="schedule-list">
            {selectedTasks.map((task) => (
              <div
                key={task.id}
                className="schedule-item"
              >
                <div className="schedule-time">
                  {formatTaskTime(task)}
                </div>

                <div className="schedule-task">
                  <p>
                    {task.taskname ||
                      task.title ||
                      'Untitled task'}
                  </p>

                  {task.category && (
                    <span>{task.category}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="schedule-empty">
            <p>No tasks scheduled.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default CalendarCard