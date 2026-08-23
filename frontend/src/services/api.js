/**
 * TaskFlow API Service
 * Communicates with the Express backend on port 8080.
 * Token is stored under 'taskflow_token'.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
export const TOKEN_KEY = 'taskflow_token'
export const USER_KEY = 'taskflow_user'

// ─── Token / User storage ────────────────────────────────────────────────────

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function getStoredUser() {
  const user = localStorage.getItem(USER_KEY)
  if (!user) return null
  try {
    return JSON.parse(user)
  } catch {
    return null
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

export function removeStoredUser() {
  localStorage.removeItem(USER_KEY)
}

export function logout() {
  removeToken()
  removeStoredUser()
  window.dispatchEvent(new Event('taskflow:logout'))
}

// ─── Core fetch helper ───────────────────────────────────────────────────────

async function request(endpoint, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const config = {
    ...options,
    headers,
  }

  let response
  try {
    response = await fetch(`${API_URL}${endpoint}`, config)
  } catch {
    throw new Error('Unable to connect to the server. Please check if the backend is running.')
  }

  let data = null
  try {
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      data = { message: text }
    }
  } catch {
    // Ignore JSON parse errors for non-JSON responses
  }

  if (!response.ok) {
    if (response.status === 401) {
      logout()
      const message = data?.message || 'Session expired. Please log in again.'
      throw new Error(message)
    }

    const message =
      data?.message ||
      (response.status === 404
        ? 'Resource not found'
        : response.status === 403
        ? 'Access forbidden'
        : response.status >= 500
        ? 'Server error occurred'
        : 'Request failed')
    throw new Error(message)
  }

  return data
}

// ─── API methods ─────────────────────────────────────────────────────────────

export const api = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  async login({ email, password }) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (res.JWTtoken) {
      setToken(res.JWTtoken)
    }
    return res
  },

  async register({ username, email, password }) {
    return await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    })
  },

  // ── Tasks ─────────────────────────────────────────────────────────────────

  /**
   * GET /tasks
   * Supported query params:
   *   taskname, category, completed, priority, important,
   *   sort, order, page, limit
   */
  async getTasks(params = {}) {
    const query = new URLSearchParams()
    if (params.taskname)  query.append('taskname',  params.taskname)
    if (params.category)  query.append('category',  params.category)
    if (params.priority)  query.append('priority',  params.priority)
    if (params.important !== undefined && params.important !== null) {
      query.append('important', String(params.important))
    }
    if (params.completed !== undefined && params.completed !== null && params.completed !== 'all') {
      query.append('completed', String(params.completed))
    }
    if (params.sort)  query.append('sort',  params.sort)
    if (params.order) query.append('order', params.order)
    if (params.page)  query.append('page',  String(params.page))
    if (params.limit) query.append('limit', String(params.limit))

    const queryString = query.toString()
    const endpoint = `/tasks${queryString ? `?${queryString}` : ''}`
    return await request(endpoint, { method: 'GET' })
  },

  async getTask(id) {
    return await request(`/tasks/${id}`, { method: 'GET' })
  },

  /**
   * POST /tasks
   * Sends all supported task fields.
   * Only taskname and category are required by the backend.
   */
  async createTask({
    taskname,
    category,
    completed = false,
    description = null,
    priority = 'medium',
    due_date = null,
    important = false,
    frequency = null,
  }) {
    return await request('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        taskname,
        category,
        completed,
        description,
        priority,
        due_date,
        important,
        frequency,
      }),
    })
  },

  /**
   * PUT /tasks/update/:id
   * Full replacement — all fields required by backend.
   */
  async updateTask(id, {
    taskname,
    category,
    completed,
    description = null,
    priority = 'medium',
    due_date = null,
    important = false,
    frequency = null,
  }) {
    return await request(`/tasks/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        taskname,
        category,
        completed,
        description,
        priority,
        due_date,
        important,
        frequency,
      }),
    })
  },

  /**
   * PATCH /tasks/:id
   * Partial update — pass only the fields you want to change.
   */
  async patchTask(id, fields = {}) {
    return await request(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(fields),
    })
  },

  async deleteTask(id) {
    return await request(`/tasks/delete/${id}`, { method: 'DELETE' })
  },

  // ── Subtasks ──────────────────────────────────────────────────────────────

  async getSubtasks(taskId, params = {}) {
    const query = new URLSearchParams()
    if (params.title) query.append('title', params.title)
    if (params.completed !== undefined && params.completed !== null) {
      query.append('completed', String(params.completed))
    }
    if (params.sort)  query.append('sort',  params.sort)
    if (params.order) query.append('order', params.order)

    const queryString = query.toString()
    const endpoint = `/tasks/${taskId}/subtasks${queryString ? `?${queryString}` : ''}`
    return await request(endpoint, { method: 'GET' })
  },

  async getSubtask(taskId, subtaskId) {
    return await request(`/tasks/${taskId}/subtasks/${subtaskId}`, { method: 'GET' })
  },

  async createSubtask(taskId, { title, completed = false }) {
    return await request(`/tasks/${taskId}/subtasks/add`, {
      method: 'POST',
      body: JSON.stringify({ title, completed }),
    })
  },

  async updateSubtask(taskId, subtaskId, { title, completed }) {
    return await request(`/tasks/${taskId}/subtasks/update/${subtaskId}`, {
      method: 'PUT',
      body: JSON.stringify({ title, completed }),
    })
  },

  async patchSubtask(taskId, subtaskId, fields = {}) {
    return await request(`/tasks/${taskId}/subtasks/partial/${subtaskId}`, {
      method: 'PATCH',
      body: JSON.stringify(fields),
    })
  },

  async deleteSubtask(taskId, subtaskId) {
    return await request(`/tasks/${taskId}/subtasks/delete/${subtaskId}`, { method: 'DELETE' })
  },
}

export default api
