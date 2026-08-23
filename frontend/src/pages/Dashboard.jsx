import { useEffect, useMemo, useState, useCallback } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import StatCard from '../components/StatCard'
import TaskList from '../components/TaskList'
import ProgressCard from '../components/ProgressCard'
import CalendarCard from '../components/CalendarCard'
import Categories from '../components/Categories'
import AddTaskModal from '../components/AddTaskModal'
import EditTaskModal from '../components/EditTaskModal'
import ConfirmModal from '../components/ConfirmModal'
import { api } from '../services/api'
import './Dashboard.css'

// ── Priority sort order (high first) ─────────────────────────────────────────
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

function Dashboard({ user, onLogout, darkMode, setDarkMode }){
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
  const TASKS_PER_PAGE = 5

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deletingTask, setDeletingTask] = useState(null)
  

  // ── Fetch all tasks from backend ─────────────────────────────────────────
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
    let ignore = false

    const loadInitialTasks = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.getTasks({ limit: 100 })
        if (!ignore) {
          setTasks(res?.data || [])
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Failed to load tasks from server.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadInitialTasks()

    return () => {
      ignore = true
    }
  }, [])

  // ── Lazy subtask loading ─────────────────────────────────────────────────
  const fetchSubtasks = useCallback(async (taskId) => {
    setSubtasksLoadingMap((prev) => ({ ...prev, [taskId]: true }))
    try {
      const res = await api.getSubtasks(taskId)
      setSubtasksMap((prev) => ({ ...prev, [taskId]: res?.data || [] }))
    } catch (err) {
      console.error(`Failed to load subtasks for task ${taskId}:`, err)
    } finally {
      setSubtasksLoadingMap((prev) => ({ ...prev, [taskId]: false }))
    }
  }, [])

  // ── Stats ────────────────────────────────────────────────────────────────
const stats = useMemo(() => {
  const total = tasks.length

  const completed = tasks.filter(
    (t) => Boolean(t.completed || t.status === 'completed')
  ).length

  const inProgress = total - completed

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const overdue = tasks.filter((t) => {
    if (t.completed || t.status === 'completed') return false
    if (!t.due_date) return false

    const dueDate = new Date(t.due_date)
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

  // ── Filter & Sort ────────────────────────────────────────────────────────
  const visibleTasks = useMemo(() => {
    let result = [...tasks]
  // Dashboard stat-card filter
  if (statusFilter === 'active') {
    result = result.filter(
      (t) => !t.completed && t.status !== 'completed'
    )
  } else if (statusFilter === 'overdue') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    result = result.filter((t) => {
      if (t.completed || t.status === 'completed') return false
      if (!t.due_date) return false

      const dueDate = new Date(t.due_date)
      dueDate.setHours(0, 0, 0, 0)

      return dueDate < today
    })
  } else if (statusFilter === 'completed') {
    result = result.filter(
      (t) => Boolean(t.completed || t.status === 'completed')
    )
  }
    // Search filter
  const query = headerSearch.trim().toLowerCase()

  if (query) {
    result = result.filter((t) => {
      const title = (t.taskname || t.title || '').toLowerCase()
      const category = (t.category || '').toLowerCase()
      const desc = (t.description || '').toLowerCase()

      return (
        title.includes(query) ||
        category.includes(query) ||
        desc.includes(query)
      )
    })
  }

  // Sorting
  result.sort((a, b) => {
    if (sortBy === 'title') {
      return (a.taskname || a.title || '').localeCompare(
        b.taskname || b.title || ''
      )
    }

    if (sortBy === 'category') {
      return (a.category || '').localeCompare(b.category || '')
    }

    if (sortBy === 'priority') {
      const pa = PRIORITY_ORDER[a.priority] ?? 1
      const pb = PRIORITY_ORDER[b.priority] ?? 1
      return pa - pb
    }

    if (sortBy === 'due_date') {
      const da = a.due_date
        ? new Date(a.due_date).getTime()
        : Infinity

      const db = b.due_date
        ? new Date(b.due_date).getTime()
        : Infinity

      return da - db
    }

    return b.id - a.id
  })
    return result
  }, [tasks, statusFilter, headerSearch, sortBy])


  //Pagination
   const totalPages = Math.ceil(visibleTasks.length / TASKS_PER_PAGE)

const paginatedTasks = useMemo(() => {
  const startIndex = (currentPage - 1) * TASKS_PER_PAGE

  return visibleTasks.slice(
    startIndex,
    startIndex + TASKS_PER_PAGE
  )
}, [visibleTasks, currentPage])

useEffect(() => {
  setCurrentPage(1)
}, [statusFilter, headerSearch, sortBy])

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((t) => !t.completed && t.status !== 'completed')
      .slice(0, 4)
  }, [tasks])
  const overdueTasks = useMemo(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return tasks.filter((t) => {
    if (t.completed || t.status === 'completed') return false
    if (!t.due_date) return false

    const dueDate = new Date(t.due_date)
    dueDate.setHours(0, 0, 0, 0)

    return dueDate < today
  })
}, [tasks])

  // ── Accordion ────────────────────────────────────────────────────────────
  const handleToggleExpand = (taskId) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null)
    } else {
      setExpandedTaskId(taskId)
      if (!subtasksMap[taskId]) {
        fetchSubtasks(taskId)
      }
    }
  }

  // ── Toggle Complete ───────────────────────────────────────────────────────
  const handleToggleComplete = async (taskId) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    const newCompleted = !task.completed

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: newCompleted } : t))
    )

    try {
      await api.patchTask(taskId, { completed: newCompleted })
    } catch (err) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: !newCompleted } : t))
      )
      alert(err.message || 'Failed to update task status.')
    }
  }

  // ── Toggle Important (PATCH /tasks/:id) ──────────────────────────────────
  const handleToggleImportant = async (taskId, newImportant) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, important: newImportant } : t))
    )

    try {
      await api.patchTask(taskId, { important: newImportant })
    } catch (err) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, important: !newImportant } : t))
      )
      alert(err.message || 'Failed to update important status.')
    }
  }

  // ── Create Task ───────────────────────────────────────────────────────────
  const handleAddTask = async (formData) => {
    try {
      const res = await api.createTask({
        taskname:    formData.taskname,
        category:    formData.category,
        completed:   false,
        description: formData.description,
        priority:    formData.priority,
        due_date:    formData.due_date,
        important:   formData.important,
        frequency:   formData.frequency,
      })
      const createdTask = res?.data
      if (createdTask) {
        setTasks((prev) => [createdTask, ...prev])
      } else {
        fetchTasks()
      }
    } catch (err) {
      alert(err.message || 'Failed to create task.')
    }
  }

  // ── Full Update (PUT) ─────────────────────────────────────────────────────
  const handleUpdateTask = async (taskId, formData) => {
    try {
      const res = await api.updateTask(taskId, {
        taskname:    formData.taskname,
        category:    formData.category,
        completed:   formData.completed,
        description: formData.description,
        priority:    formData.priority,
        due_date:    formData.due_date,
        important:   formData.important,
        frequency:   formData.frequency,
      })
      const updatedTask = res?.data
      if (updatedTask) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)))
      } else {
        fetchTasks()
      }
      setEditingTask(null)
    } catch (err) {
      alert(err.message || 'Failed to update task.')
    }
  }

  // ── Delete Task ───────────────────────────────────────────────────────────
  const handleConfirmDeleteTask = async () => {
    if (!deletingTask) return
    const taskId = deletingTask.id

    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    setDeletingTask(null)

    try {
      await api.deleteTask(taskId)
    } catch (err) {
      fetchTasks()
      alert(err.message || 'Failed to delete task.')
    }
  }

  // ── Subtask handlers ─────────────────────────────────────────────────────
  const handleAddSubtask = async (taskId, title) => {
    try {
      const res = await api.createSubtask(taskId, { title, completed: false })
      const createdSubtask = res?.data
      if (createdSubtask) {
        setSubtasksMap((prev) => ({
          ...prev,
          [taskId]: [...(prev[taskId] || []), createdSubtask],
        }))
      } else {
        fetchSubtasks(taskId)
      }
    } catch (err) {
      alert(err.message || 'Failed to add subtask.')
    }
  }

  const handleToggleSubtask = async (taskId, subtaskId) => {
    const subtask = (subtasksMap[taskId] || []).find((s) => s.id === subtaskId)
    if (!subtask) return
    const newCompleted = !subtask.completed

    setSubtasksMap((prev) => ({
      ...prev,
      [taskId]: prev[taskId].map((s) =>
        s.id === subtaskId ? { ...s, completed: newCompleted } : s
      ),
    }))

    try {
      await api.patchSubtask(taskId, subtaskId, { completed: newCompleted })
    } catch (err) {
      setSubtasksMap((prev) => ({
        ...prev,
        [taskId]: prev[taskId].map((s) =>
          s.id === subtaskId ? { ...s, completed: !newCompleted } : s
        ),
      }))
      alert(err.message || 'Failed to update subtask.')
    }
  }

  const handleEditSubtask = async (taskId, subtaskId, title) => {
    try {
      await api.patchSubtask(taskId, subtaskId, { title })
      setSubtasksMap((prev) => ({
        ...prev,
        [taskId]: prev[taskId].map((s) => (s.id === subtaskId ? { ...s, title } : s)),
      }))
    } catch (err) {
      alert(err.message || 'Failed to rename subtask.')
    }
  }

  const handleDeleteSubtask = async (taskId, subtaskId) => {
    setSubtasksMap((prev) => ({
      ...prev,
      [taskId]: prev[taskId].filter((s) => s.id !== subtaskId),
    }))

    try {
      await api.deleteSubtask(taskId, subtaskId)
    } catch (err) {
      fetchSubtasks(taskId)
      alert(err.message || 'Failed to delete subtask.')
    }
  }
 const handleStatCardClick = (filter) => {
  setStatusFilter(filter)
}
    return (
  <div className="dashboard-layout">
    <Sidebar
      user={user}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      isOpen={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
      onLogout={onLogout}
    />

    <div className="dashboard-main">
      <Header
        user={user}
        searchQuery={headerSearch}
        onSearchChange={setHeaderSearch}
        onMenuClick={() => setSidebarOpen(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {activeNav === 'dashboard' && (
        <>
          <div className="stats-row">
            <StatCard
              label="Total Tasks"
              value={stats.total}
              accent="teal"
              onClick={() => handleStatCardClick('all')}
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
              value={stats.completed}
              accent="green"
              onClick={() => handleStatCardClick('completed')}
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M8 12l3 3 5-6" />
                </svg>
              }
            />

            <StatCard
              label="In Progress"
              value={stats.inProgress}
              accent="amber"
              onClick={() => handleStatCardClick('active')}
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              }
            />

            <StatCard
              label="Overdue"
              value={stats.overdue}
              accent="red"
              onClick={() => handleStatCardClick('overdue')}
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
            {/* LEFT: TASKS */}
            <div className="dashboard-tasks">
              <TaskList
                tasks={paginatedTasks}
                subtasksMap={subtasksMap}
                subtasksLoadingMap={subtasksLoadingMap}
                sortBy={sortBy}
                onSortChange={setSortBy}
                expandedTaskId={expandedTaskId}
                onToggleExpand={handleToggleExpand}
                onToggleComplete={handleToggleComplete}
                onToggleImportant={handleToggleImportant}
                onEditTask={(task) => setEditingTask(task)}
                onDeleteTask={(task) => setDeletingTask(task)}
                onToggleSubtask={handleToggleSubtask}
                onAddSubtask={handleAddSubtask}
                onEditSubtask={handleEditSubtask}
                onDeleteSubtask={handleDeleteSubtask}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onRetry={fetchTasks}
                loading={loading}
                error={error}
              />

              {totalPages > 1 && (
                <div className="task-pagination">
                  <button
                    onClick={() =>
                      setCurrentPage((page) => Math.max(page - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    ←
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((page) => (
                    <button
                      key={page}
                      className={currentPage === page ? 'active' : ''}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(page + 1, totalPages)
                      )
                    }
                    disabled={currentPage === totalPages}
                  >
                    →
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT: CALENDAR */}
            <div className="dashboard-calendar">
              <CalendarCard tasks={tasks} />
            </div>

            {/* RIGHT: PROGRESS */}
            <div className="dashboard-progress">
              <ProgressCard
                completed={stats.completed}
                remaining={stats.inProgress}
                total={stats.total}
                upcomingTasks={upcomingTasks}
              />
            </div>
          </div>
        </>
      )}

      {activeNav === 'categories' && (
        <Categories
          tasks={tasks}
          onBack={() => setActiveNav('dashboard')}
        />
      )}

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTask}
      />

      <EditTaskModal
        isOpen={Boolean(editingTask)}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleUpdateTask}
      />

      <ConfirmModal
        isOpen={Boolean(deletingTask)}
        title="Delete Task"
        message={`Are you sure you want to delete "${
          deletingTask?.taskname ||
          deletingTask?.title ||
          'this task'
        }"?`}
        confirmText="Delete Task"
        onConfirm={handleConfirmDeleteTask}
        onClose={() => setDeletingTask(null)}
      />
    </div>
  </div>
)

}

export default Dashboard