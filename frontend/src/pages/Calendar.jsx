import { useMemo, useState } from 'react'
import './Calendar.css'

function Calendar({ tasks = [], onAddTask }) {
  const today = new Date()

  const [currentDate, setCurrentDate] = useState(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )
  )
  const [selectedDate, setSelectedDate] = useState(today)
  const [view, setView] = useState('week')

  // --------------------------------------------------
  // Get the Monday of the current week
  // --------------------------------------------------
  const getStartOfWeek = (date) => {
    const result = new Date(date)
    const day = result.getDay()

    const difference = day === 0 ? -6 : 1 - day

    result.setDate(result.getDate() + difference)
    result.setHours(0, 0, 0, 0)

    return result
  }

  const weekStart = useMemo(
    () => getStartOfWeek(currentDate),
    [currentDate]
  )

  // --------------------------------------------------
  // Generate the 7 days
  // --------------------------------------------------
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart)

      date.setDate(weekStart.getDate() + index)

      return date
    })
  }, [weekStart])

  // --------------------------------------------------
  // Navigation
  // --------------------------------------------------
  const previousWeek = () => {
    setCurrentDate((date) => {
      const next = new Date(date)
      next.setDate(next.getDate() - 7)
      return next
    })
  }

  const nextWeek = () => {
    setCurrentDate((date) => {
      const next = new Date(date)
      next.setDate(next.getDate() + 7)
      return next
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // --------------------------------------------------
  // Check whether a date is today
  // --------------------------------------------------
  const isToday = (date) => {
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    )
  }

  // --------------------------------------------------
  // Get tasks for a specific date
  // --------------------------------------------------
  const getTasksForDate = (date) => {
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

  // --------------------------------------------------
  // Format calendar title
  // --------------------------------------------------
  const calendarTitle = useMemo(() => {
    const start = weekDays[0]
    const end = weekDays[6]

    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleString('default', {
        month: 'long',
      })} ${start.getFullYear()}`
    }

    return `${start.toLocaleString('default', {
      month: 'short',
    })} ${start.getFullYear()} – ${end.toLocaleString(
      'default',
      {
        month: 'short',
        year: 'numeric',
      }
    )}`
  }, [weekDays])

  // --------------------------------------------------
  // Format task time
  // --------------------------------------------------
  const formatTime = (task) => {
    if (!task.due_date) return ''

    const date = new Date(task.due_date)

    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getTaskPosition = (task) => {
  if (!task.due_date) return 0

  const date = new Date(task.due_date)

  const startHour = 7
  const minutesPerHour = 63
  
  const totalMinutes =
    (date.getHours() - startHour) * minutesPerHour +
    date.getMinutes()

  // Each calendar hour row should be 60px tall.
  return totalMinutes
}
  // --------------------------------------------------
  // Format day
  // --------------------------------------------------
  const formatDayName = (date) => {
    return date.toLocaleString('default', {
      weekday: 'short',
    })
  }

  // --------------------------------------------------
  // Format date number
  // --------------------------------------------------
  const formatDayNumber = (date) => {
    return date.getDate()
  }

  return (
    <div className="calendar-page">

      {/* ================= HEADER ================= */}
      <div className="calendar-page-header">

        <div>
          <h1>Calendar</h1>

          <p>
            Plan and organize your tasks.
          </p>
        </div>

        <div className="calendar-page-actions">

          <button
            type="button"
            className="calendar-today-btn"
            onClick={goToToday}
          >
            Today
          </button>

          <div className="calendar-view-switcher">

            <button
              type="button"
              className={view === 'week' ? 'active' : ''}
              onClick={() => setView('week')}
            >
              Week
            </button>

            <button
              type="button"
              className={view === 'month' ? 'active' : ''}
              onClick={() => setView('month')}
            >
              Month
            </button>

          </div>

        </div>
      </div>

      {/* ================= CALENDAR TOOLBAR ================= */}
      <div className="calendar-toolbar">

        <div className="calendar-toolbar-left">

          <button
            type="button"
            className="calendar-nav-btn"
            onClick={previousWeek}
            aria-label="Previous week"
          >
            ‹
          </button>

          <button
            type="button"
            className="calendar-nav-btn"
            onClick={nextWeek}
            aria-label="Next week"
          >
            ›
          </button>

          <h2>{calendarTitle}</h2>

        </div>

      </div>

      {/* ================= WEEK CALENDAR ================= */}
      {view === 'week' && (
        <div className="calendar-week-container">

          {/* Day headers */}
          <div className="calendar-week-header">

            <div className="calendar-time-header" />

            {weekDays.map((date) => (
              <div
                key={date.toISOString()}
                className={`calendar-column-header ${
                  isToday(date) ? 'today' : ''
                } ${
                  selectedDate &&
                  date.toDateString() === selectedDate.toDateString()
                  ? 'selected'
                  : ''
                }`}
              >
                <span className="calendar-weekday">
                  {formatDayName(date)}
                </span>

                <span className="calendar-day-number">
                  {formatDayNumber(date)}
                </span>
              </div>
            ))}

          </div>

          {/* Calendar body */}
          <div className="calendar-week-body">

            <div className="calendar-time-column">

              {Array.from(
                { length: 13 },
                (_, index) => {
                  const hour = index + 7

                  return (
                    <div
                      className="calendar-time-slot"
                      key={hour}
                    >
                      {hour > 12
                        ? `${hour - 12} PM`
                        : hour === 12
                        ? '12 PM'
                        : `${hour} AM`}
                    </div>
                  )
                }
              )}

            </div>

            {weekDays.map((date) => {
              const dayTasks = getTasksForDate(date)

              return (
                <div   
                className={`calendar-day-column ${
                  isToday(date) ? 'today-column' : ''
                } ${
                   selectedDate &&
                   date.toDateString() === selectedDate.toDateString()
                    ? 'selected-column'
                    : ''
                  }`}
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  >
                  {Array.from(
                    { length: 13 },
                    (_, index) => (
                      <div
                        className="calendar-hour-cell"
                        key={index}
                      />
                    )
                  )}

                  <div className="calendar-day-tasks">

                    {dayTasks.map((task) => (
                      <div
                        className={`calendar-task-block ${
                          task.completed
                            ? 'completed'
                            : ''
                        }`}
                        key={task.id}
                        style={{
                          top:`${getTaskPosition(task)}px`
                        }}
                      >

                        <div className="calendar-task-time">
                          {formatTime(task)}
                        </div>

                        <div className="calendar-task-title">
                          {task.taskname ||
                            task.title ||
                            'Untitled task'}
                        </div>

                        {task.category && (
                          <div className="calendar-task-category">
                            {task.category}
                          </div>
                        )}

                      </div>
                    ))}

                  </div>

                </div>
              )
            })}

          </div>
        </div>
      )}
     {selectedDate && (
  <div className="selected-day-panel">

    <div className="selected-day-header">

      <div>
        <span className="selected-day-label">
          Selected Day
        </span>

        <h2>
          {selectedDate.toLocaleDateString('default', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </h2>

        <p>
          {getTasksForDate(selectedDate).length}{' '}
          {getTasksForDate(selectedDate).length === 1
            ? 'task'
            : 'tasks'}{' '}
          scheduled
        </p>
      </div>

      <button
        type="button"
        className="calendar-add-task-btn"
        onClick={() => onAddTask?.(selectedDate)}
      >
        <span>+</span>
        Add Task
      </button>

    </div>

    {getTasksForDate(selectedDate).length > 0 ? (
      <div className="selected-day-task-list">

        {getTasksForDate(selectedDate).map((task) => (
          <div
            key={task.id}
            className={`selected-day-task ${
              task.completed ? 'completed' : ''
            }`}
          >

            <div className="selected-task-indicator" />

            <div className="selected-task-content">

              <h3>
                {task.taskname ||
                  task.title ||
                  'Untitled task'}
              </h3>

              <div className="selected-task-meta">

                {task.due_date && (
                  <span>
                    {new Date(
                      task.due_date
                    ).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                )}

                {task.category && (
                  <span>{task.category}</span>
                )}

                {task.priority && (
                  <span className={`priority-${task.priority}`}>
                    {task.priority}
                  </span>
                )}

                {task.completed && (
                  <span>Completed</span>
                )}

              </div>

              {task.description && (
                <p>{task.description}</p>
              )}

            </div>

          </div>
        ))}

      </div>
    ) : (
      <div className="selected-day-empty">

        <div className="selected-day-empty-icon">
          +
        </div>

        <h3>No tasks for this day</h3>

        <p>
          Nothing scheduled yet. Add a task to this date.
        </p>

        <button
          type="button"
          onClick={() => onAddTask?.(selectedDate)}
        >
          Add Task
        </button>

      </div>
    )}

  </div>
)}
      {/* ================= MONTH PLACEHOLDER ================= */}
      {view === 'month' && (
        <div className="calendar-month-placeholder">
          <div>
            <h2>Month View</h2>

            <p>
              The monthly calendar view will be added
              next.
            </p>
          </div>
        </div>
      )}

    </div>
  )
}

export default Calendar