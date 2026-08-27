import { useEffect, useMemo, useState, useCallback } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import StatCard from '../components/StatCard'
import TaskList from '../components/TaskList'
import ProfileModal from '../components/ProfileModal'
import ProgressCard from '../components/ProgressCard'
import CalendarCard from '../components/CalendarCard'
import Categories from '../components/Categories'
import Calendar from './Calendar'
import AddTaskModal from '../components/AddTaskModal'
import EditTaskModal from '../components/EditTaskModal'
import ConfirmModal from '../components/ConfirmModal'
import { api } from '../services/api'
import './Dashboard.css'

const PRIORITY_ORDER = {
  high: 0,
  medium: 1,
  low: 2,
}

const TASKS_PER_PAGE = 5

function Dashboard({
  user,
  onLogout,
  darkMode,
  setDarkMode,
  onOpenProfile,
}) {
  const [currentUser, setCurrentUser] = useState(user)

  const [tasks, setTasks] = useState([])
  const [subtasksMap, setSubtasksMap] = useState({})
  const [subtasksLoadingMap, setSubtasksLoadingMap] = useState({})

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [activeNav, setActiveNav] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [headerSearch, setHeaderSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('id')

  const [expandedTaskId, setExpandedTaskId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentTime, setCurrentTime] = useState(Date.now())

  const [profileOpen, setProfileOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [calendarTaskDate, setCalendarTaskDate] = useState('')

  const [editingTask, setEditingTask] = useState(null)
  const [deletingTask, setDeletingTask] = useState(null)

  // =========================================================
  // FETCH TASKS
  // =========================================================

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await api.getTasks({ limit: 100 })
      setTasks(res?.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load tasks from server.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])


  useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(Date.now())
  }, 1000)

  return () => clearInterval(timer)
}, [])

  // =========================================================
  // FETCH SUBTASKS
  // =========================================================

  const fetchSubtasks = useCallback(async (taskId) => {
    setSubtasksLoadingMap((prev) => ({
      ...prev,
      [taskId]: true,
    }))

    try {
      const res = await api.getSubtasks(taskId)

      setSubtasksMap((prev) => ({
        ...prev,
        [taskId]: res?.data || [],
      }))
    } catch (err) {
      console.error(
        `Failed to load subtasks for task ${taskId}:`,
        err
      )
    } finally {
      setSubtasksLoadingMap((prev) => ({
        ...prev,
        [taskId]: false,
      }))
    }
  }, [])

  // =========================================================
  // DASHBOARD TASKS
  //
  // Dashboard is temporary.
  //
  // Completed:
  //   visible for 2 days after completed_at
  //
  // Incomplete:
  //   visible for 2 days after created_at
  //
  // IMPORTANT:
  // Calendar/Categories still use `tasks`, not this list.
  // =========================================================

 const dashboardTasks = useMemo(() => {
  const RETENTION_TIME = 2* 24 * 60 * 60 * 1000 // 10 seconds for testing

  return tasks.filter((task) => {
    // =====================================================
    // COMPLETED TASK
    // =====================================================

    if (task.completed) {
      // If completed_at is missing, keep it visible
      if (!task.completed_at) {
        return true
      }

      const completedAt = new Date(
        task.completed_at
      ).getTime()

      // Invalid date → keep visible
      if (Number.isNaN(completedAt)) {
        return true
      }

      // Keep visible for 10 seconds after completion
      return currentTime - completedAt < RETENTION_TIME
    }

    // =====================================================
    // INCOMPLETE TASK
    // =====================================================

    if (task.created_at) {
      const createdAt = new Date(
        task.created_at
      ).getTime()

      // Invalid date → keep visible
      if (Number.isNaN(createdAt)) {
        return true
      }

      // Keep visible for 10 seconds after creation
      return currentTime - createdAt < RETENTION_TIME
    }

    // No created_at → keep visible
    return true
  })
}, [tasks, currentTime])
  // =========================================================
  // STATS
  //
  // Stats are based on ALL tasks.
  // This means disappearing from Dashboard does NOT delete
  // the task from statistics/calendar.
  // =========================================================

  const stats = useMemo(() => {
    const total = tasks.length

    const completed = tasks.filter(
      (task) =>
        Boolean(
          task.completed ||
          task.status === 'completed'
        )
    ).length

    const inProgress = total - completed

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const overdue = tasks.filter((task) => {
      if (
        task.completed ||
        task.status === 'completed'
      ) {
        return false
      }

      if (!task.due_date) {
        return false
      }

      const dueDate = new Date(task.due_date)
      dueDate.setHours(0, 0, 0, 0)

      return dueDate < today
    }).length

    return {
      total,
      completed,
      inProgress,
      overdue,
    }
  }, [tasks])

  // =========================================================
  // VISIBLE DASHBOARD TASKS
  // =========================================================

  const visibleTasks = useMemo(() => {
    // IMPORTANT:
    // Start from dashboardTasks, NOT tasks.
    let result = [...dashboardTasks]

    // -------------------------------------------------------
    // STAT CARD FILTER
    // -------------------------------------------------------

    if (statusFilter === 'active') {
      result = result.filter(
        (task) =>
          !task.completed &&
          task.status !== 'completed'
      )
    }

    if (statusFilter === 'overdue') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      result = result.filter((task) => {
        if (
          task.completed ||
          task.status === 'completed'
        ) {
          return false
        }

        if (!task.due_date) {
          return false
        }

        const dueDate = new Date(task.due_date)
        dueDate.setHours(0, 0, 0, 0)

        return dueDate < today
      })
    }

    if (statusFilter === 'completed') {
      result = result.filter(
        (task) =>
          Boolean(
            task.completed ||
            task.status === 'completed'
          )
      )
    }

    // -------------------------------------------------------
    // SEARCH
    // -------------------------------------------------------

    const query = headerSearch.trim().toLowerCase()

    if (query) {
      result = result.filter((task) => {
        const title = (
          task.taskname ||
          task.title ||
          ''
        ).toLowerCase()

        const category = (
          task.category || ''
        ).toLowerCase()

        const description = (
          task.description || ''
        ).toLowerCase()

        return (
          title.includes(query) ||
          category.includes(query) ||
          description.includes(query)
        )
      })
    }

    // -------------------------------------------------------
    // SORTING
    // -------------------------------------------------------

    result.sort((a, b) => {
      if (sortBy === 'title') {
        return (
          a.taskname ||
          a.title ||
          ''
        ).localeCompare(
          b.taskname ||
          b.title ||
          ''
        )
      }

      if (sortBy === 'category') {
        return (
          a.category || ''
        ).localeCompare(
          b.category || ''
        )
      }

      if (sortBy === 'priority') {
        const priorityA =
          PRIORITY_ORDER[a.priority] ?? 1

        const priorityB =
          PRIORITY_ORDER[b.priority] ?? 1

        return priorityA - priorityB
      }

      if (sortBy === 'due_date') {
        const dateA = a.due_date
          ? new Date(a.due_date).getTime()
          : Infinity

        const dateB = b.due_date
          ? new Date(b.due_date).getTime()
          : Infinity

        return dateA - dateB
      }

      return b.id - a.id
    })

    return result
  }, [
    dashboardTasks,
    statusFilter,
    headerSearch,
    sortBy,
  ])

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages = Math.ceil(
    visibleTasks.length / TASKS_PER_PAGE
  )

  const paginatedTasks = useMemo(() => {
    const startIndex =
      (currentPage - 1) * TASKS_PER_PAGE

    return visibleTasks.slice(
      startIndex,
      startIndex + TASKS_PER_PAGE
    )
  }, [visibleTasks, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [
    statusFilter,
    headerSearch,
    sortBy,
  ])

  // If the current page becomes invalid after a task
  // disappears, move back to the last available page.
  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  // =========================================================
  // UPCOMING TASKS
  // =========================================================

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter(
        (task) =>
          !task.completed &&
          task.status !== 'completed'
      )
      .slice(0, 4)
  }, [tasks])

  // =========================================================
  // TOGGLE EXPAND
  // =========================================================

  const handleToggleExpand = (taskId) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null)
      return
    }

    setExpandedTaskId(taskId)

    if (!subtasksMap[taskId]) {
      fetchSubtasks(taskId)
    }
  }

  // =========================================================
  // TOGGLE MAIN TASK COMPLETE
  // =========================================================

  const handleToggleComplete = async (taskId) => {
    const task = tasks.find(
      (item) => item.id === taskId
    )

    if (!task) return

    const newCompleted = !task.completed

    // Optimistic update
    setTasks((prev) =>
      prev.map((item) =>
        item.id === taskId
          ? {
              ...item,
              completed: newCompleted,
              completed_at: newCompleted
                ? new Date().toISOString()
                : null,
            }
          : item
      )
    )

    // Update subtasks immediately
    setSubtasksMap((prev) => ({
      ...prev,
      [taskId]: (
        prev[taskId] || []
      ).map((subtask) => ({
        ...subtask,
        completed: newCompleted,
      })),
    }))

    try {
      const response = await api.patchTask(
        taskId,
        {
          completed: newCompleted,
        }
      )

      // Use backend's actual completed_at
      // if it was returned.
      const updatedTask =
        response?.task ||
        response?.data

      if (updatedTask) {
        setTasks((prev) =>
          prev.map((item) =>
            item.id === taskId
              ? {
                  ...item,
                  ...updatedTask,
                }
              : item
          )
        )
      }
    } catch (err) {
      // Roll back
      setTasks((prev) =>
        prev.map((item) =>
          item.id === taskId
            ? {
                ...item,
                completed: !newCompleted,
                completed_at:
                  task.completed_at || null,
              }
            : item
        )
      )

      setSubtasksMap((prev) => ({
        ...prev,
        [taskId]: (
          prev[taskId] || []
        ).map((subtask) => ({
          ...subtask,
          completed: !newCompleted,
        })),
      }))

      alert(
        err.message ||
          'Failed to update task status.'
      )
    }
  }

  // =========================================================
  // TOGGLE IMPORTANT
  // =========================================================

  const handleToggleImportant = async (
    taskId,
    newImportant
  ) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              important: newImportant,
            }
          : task
      )
    )

    try {
      const response =
        await api.patchTask(
          taskId,
          {
            important: newImportant,
          }
        )

      const updatedTask =
        response?.task ||
        response?.data

      if (updatedTask) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  ...updatedTask,
                }
              : task
          )
        )
      }
    } catch (err) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                important: !newImportant,
              }
            : task
        )
      )

      alert(
        err.message ||
          'Failed to update important status.'
      )
    }
  }

  // =========================================================
  // CREATE TASK
  // =========================================================

  const handleAddTask = async (formData) => {
    try {
      const response =
        await api.createTask({
          taskname: formData.taskname,
          category: formData.category,
          completed: false,
          description: formData.description,
          priority: formData.priority,
          due_date: formData.due_date,
          important: formData.important,
          frequency: formData.frequency,
        })

      const createdTask =
        response?.data

      if (createdTask) {
        setTasks((prev) => [
          createdTask,
          ...prev,
        ])
      } else {
        await fetchTasks()
      }
    } catch (err) {
      alert(
        err.message ||
          'Failed to create task.'
      )
    }
  }

  // =========================================================
  // UPDATE TASK
  // =========================================================

  const handleUpdateTask = async (
    taskId,
    formData
  ) => {
    try {
      const response =
        await api.updateTask(
          taskId,
          {
            taskname:
              formData.taskname,
            category:
              formData.category,
            completed:
              formData.completed,
            description:
              formData.description,
            priority:
              formData.priority,
            due_date:
              formData.due_date,
            important:
              formData.important,
            frequency:
              formData.frequency,
          }
        )

      const updatedTask =
        response?.data ||
        response?.task

      if (updatedTask) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? updatedTask
              : task
          )
        )
      } else {
        await fetchTasks()
      }

      setEditingTask(null)
    } catch (err) {
      alert(
        err.message ||
          'Failed to update task.'
      )
    }
  }

  // =========================================================
  // DELETE TASK
  // =========================================================

  const handleConfirmDeleteTask =
    async () => {
      if (!deletingTask) return

      const taskId =
        deletingTask.id

      setTasks((prev) =>
        prev.filter(
          (task) =>
            task.id !== taskId
        )
      )

      setDeletingTask(null)

      try {
        await api.deleteTask(taskId)
      } catch (err) {
        await fetchTasks()

        alert(
          err.message ||
            'Failed to delete task.'
        )
      }
    }

  // =========================================================
  // ADD SUBTASK
  // =========================================================

  const handleAddSubtask = async (
    taskId,
    title
  ) => {
    try {
      const response =
        await api.createSubtask(
          taskId,
          {
            title,
            completed: false,
          }
        )

      const createdSubtask =
        response?.data

      if (createdSubtask) {
        setSubtasksMap((prev) => ({
          ...prev,
          [taskId]: [
            ...(prev[taskId] || []),
            createdSubtask,
          ],
        }))
      } else {
        fetchSubtasks(taskId)
      }
    } catch (err) {
      alert(
        err.message ||
          'Failed to add subtask.'
      )
    }
  }

  // =========================================================
  // TOGGLE SUBTASK
  // =========================================================

  const handleToggleSubtask = async (
    taskId,
    subtaskId
  ) => {
    const subtask = (
      subtasksMap[taskId] || []
    ).find(
      (item) =>
        item.id === subtaskId
    )

    if (!subtask) return

    const newCompleted =
      !subtask.completed

    // Optimistic update
    setSubtasksMap((prev) => ({
      ...prev,
      [taskId]: (
        prev[taskId] || []
      ).map((item) =>
        item.id === subtaskId
          ? {
              ...item,
              completed:
                newCompleted,
            }
          : item
      ),
    }))

    try {
      const response =
        await api.patchSubtask(
          taskId,
          subtaskId,
          {
            completed:
              newCompleted,
          }
        )

      // Backend synchronized main task
      if (response?.mainTask) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id ===
            response.mainTask.id
              ? {
                  ...task,
                  ...response.mainTask,
                }
              : task
          )
        )
      }
    } catch (err) {
      // Roll back
      setSubtasksMap((prev) => ({
        ...prev,
        [taskId]: (
          prev[taskId] || []
        ).map((item) =>
          item.id === subtaskId
            ? {
                ...item,
                completed:
                  !newCompleted,
              }
            : item
        ),
      }))

      alert(
        err.message ||
          'Failed to update subtask.'
      )
    }
  }

  // =========================================================
  // EDIT SUBTASK
  // =========================================================

  const handleEditSubtask = async (
    taskId,
    subtaskId,
    title
  ) => {
    try {
      await api.patchSubtask(
        taskId,
        subtaskId,
        { title }
      )

      setSubtasksMap((prev) => ({
        ...prev,
        [taskId]: (
          prev[taskId] || []
        ).map((subtask) =>
          subtask.id === subtaskId
            ? {
                ...subtask,
                title,
              }
            : subtask
        ),
      }))
    } catch (err) {
      alert(
        err.message ||
          'Failed to rename subtask.'
      )
    }
  }

  // =========================================================
  // DELETE SUBTASK
  // =========================================================

  const handleDeleteSubtask = async (
    taskId,
    subtaskId
  ) => {
    setSubtasksMap((prev) => ({
      ...prev,
      [taskId]: (
        prev[taskId] || []
      ).filter(
        (subtask) =>
          subtask.id !== subtaskId
      ),
    }))

    try {
      await api.deleteSubtask(
        taskId,
        subtaskId
      )
    } catch (err) {
      await fetchSubtasks(taskId)

      alert(
        err.message ||
          'Failed to delete subtask.'
      )
    }
  }

  // =========================================================
  // STAT CARD
  // =========================================================

  const handleStatCardClick = (
    filter
  ) => {
    setStatusFilter(filter)
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="dashboard-layout">

      <Sidebar
        user={currentUser}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
        onLogout={onLogout}
        onOpenProfile={onOpenProfile}
      />

      <div className="dashboard-main">

        <Header
          user={currentUser}
          onOpenProfile={() =>
            setProfileOpen(true)
          }
          searchQuery={headerSearch}
          onSearchChange={
            setHeaderSearch
          }
          onMenuClick={() =>
            setSidebarOpen(true)
          }
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* =================================================
            DASHBOARD
        ================================================= */}

        {activeNav === 'dashboard' && (
          <>
            <div className="stats-row">

              <StatCard
                label="Total Tasks"
                value={stats.total}
                accent="teal"
                onClick={() =>
                  handleStatCardClick(
                    'all'
                  )
                }
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                  </svg>
                }
              />

              <StatCard
                label="Completed"
                value={
                  stats.completed
                }
                accent="green"
                onClick={() =>
                  handleStatCardClick(
                    'completed'
                  )
                }
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                    />
                    <path d="M8 12l3 3 5-6" />
                  </svg>
                }
              />

              <StatCard
                label="In Progress"
                value={
                  stats.inProgress
                }
                accent="amber"
                onClick={() =>
                  handleStatCardClick(
                    'active'
                  )
                }
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                    />
                    <path d="M12 7v5l3 2" />
                  </svg>
                }
              />

              <StatCard
                label="Overdue"
                value={stats.overdue}
                accent="red"
                onClick={() =>
                  handleStatCardClick(
                    'overdue'
                  )
                }
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M10.3 3.9L2.6 17.2A2 2 0 004.3 20h15.4a2 2 0 001.7-2.8L13.7 3.9a2 2 0 00-3.4 0z" />
                    <path d="M12 9v4" />
                    <path d="M12 16h.01" />
                  </svg>
                }
              />

            </div>

            <div className="dashboard-content">

              {/* LEFT — TASKS */}

              <div className="dashboard-tasks">

                <TaskList
                  tasks={paginatedTasks}
                  subtasksMap={
                    subtasksMap
                  }
                  subtasksLoadingMap={
                    subtasksLoadingMap
                  }
                  sortBy={sortBy}
                  onSortChange={
                    setSortBy
                  }
                  expandedTaskId={
                    expandedTaskId
                  }
                  onToggleExpand={
                    handleToggleExpand
                  }
                  onToggleComplete={
                    handleToggleComplete
                  }
                  onToggleImportant={
                    handleToggleImportant
                  }
                  onEditTask={(task) =>
                    setEditingTask(task)
                  }
                  onDeleteTask={(task) =>
                    setDeletingTask(task)
                  }
                  onToggleSubtask={
                    handleToggleSubtask
                  }
                  onAddSubtask={
                    handleAddSubtask
                  }
                  onEditSubtask={
                    handleEditSubtask
                  }
                  onDeleteSubtask={
                    handleDeleteSubtask
                  }
                  onOpenAddModal={() =>
                    setIsAddModalOpen(
                      true
                    )
                  }
                  onRetry={fetchTasks}
                  loading={loading}
                  error={error}
                />

                {totalPages > 1 && (
                  <div className="task-pagination">

                    <button
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.max(
                              page - 1,
                              1
                            )
                        )
                      }
                      disabled={
                        currentPage === 1
                      }
                    >
                      ←
                    </button>

                    {Array.from(
                      {
                        length:
                          totalPages,
                      },
                      (_, index) =>
                        index + 1
                    ).map((page) => (
                      <button
                        key={page}
                        className={
                          currentPage ===
                          page
                            ? 'active'
                            : ''
                        }
                        onClick={() =>
                          setCurrentPage(
                            page
                          )
                        }
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.min(
                              page + 1,
                              totalPages
                            )
                        )
                      }
                      disabled={
                        currentPage ===
                        totalPages
                      }
                    >
                      →
                    </button>

                  </div>
                )}

              </div>

              {/* RIGHT — CALENDAR */}

              <div className="dashboard-calendar">
                <CalendarCard
                  tasks={tasks}
                />
              </div>

              {/* RIGHT — PROGRESS */}

              <div className="dashboard-progress">
                <ProgressCard
                  completed={
                    stats.completed
                  }
                  remaining={
                    stats.inProgress
                  }
                  total={stats.total}
                  upcomingTasks={
                    upcomingTasks
                  }
                />
              </div>

            </div>
          </>
        )}

        {/* =================================================
            CATEGORIES
        ================================================= */}

        {activeNav === 'categories' && (
          <Categories
            tasks={tasks}
            onBack={() =>
              setActiveNav(
                'dashboard'
              )
            }
          />
        )}

        {/* =================================================
            FULL CALENDAR
        ================================================= */}

        {activeNav === 'calendar' && (
          <Calendar
            tasks={tasks}
            onAddTask={(date) => {
              const localDate =
                new Date(date)

              const formattedDate =
                `${localDate.getFullYear()}-` +
                `${String(
                  localDate.getMonth() + 1
                ).padStart(2, '0')}-` +
                `${String(
                  localDate.getDate()
                ).padStart(2, '0')}T09:00`

              setCalendarTaskDate(
                formattedDate
              )

              setIsAddModalOpen(true)
            }}
          />
        )}

        {/* =================================================
            ADD TASK MODAL
        ================================================= */}

        <AddTaskModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false)
            setCalendarTaskDate('')
          }}
          onSubmit={handleAddTask}
          initialDueDate={
            calendarTaskDate
          }
        />

        {/* =================================================
            EDIT TASK MODAL
        ================================================= */}

        <EditTaskModal
          isOpen={Boolean(
            editingTask
          )}
          task={editingTask}
          onClose={() =>
            setEditingTask(null)
          }
          onSubmit={handleUpdateTask}
        />

        {/* =================================================
            DELETE CONFIRMATION
        ================================================= */}

        <ConfirmModal
          isOpen={Boolean(
            deletingTask
          )}
          title="Delete Task"
          message={`Are you sure you want to delete "${
            deletingTask?.taskname ||
            deletingTask?.title ||
            'this task'
          }"?`}
          confirmText="Delete Task"
          onConfirm={
            handleConfirmDeleteTask
          }
          onClose={() =>
            setDeletingTask(null)
          }
        />

        {/* =================================================
            PROFILE
        ================================================= */}

        <ProfileModal
          isOpen={profileOpen}
          user={currentUser}
          onClose={() =>
            setProfileOpen(false)
          }
          onLogout={onLogout}
          onUserUpdated={
            setCurrentUser
          }
          darkMode={darkMode}
        />

      </div>
    </div>
  )
}

export default Dashboard