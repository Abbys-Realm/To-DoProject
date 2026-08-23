/**
 * Mock data for the UI.
 * Later, replace these with real API responses from services/api.js
 */

export const mockUser = {
  id: 1,
  name: 'Abigi',
  email: 'abigi@example.com',
  avatarInitials: 'AB',
}

export const mockTasks = [
  {
    id: 1,
    title: 'Complete CrossFit workout',
    description: 'Full WOD including strength and conditioning.',
    category: 'Fitness',
    priority: 'High',
    dueDate: '2026-08-15',
    status: 'active',
    important: true,
    frequency: 'Daily',
    subtasks: [
      { id: 101, title: 'Warm-up', completed: true },
      { id: 102, title: 'Mobility', completed: true },
      { id: 103, title: 'Strength training', completed: true },
      { id: 104, title: 'Conditioning', completed: false },
      { id: 105, title: 'Cool down', completed: false },
    ],
  },
  {
    id: 2,
    title: 'Study Database Fundamentals',
    description: 'Review normalization, indexes, and joins.',
    category: 'Learning',
    priority: 'High',
    dueDate: '2026-08-16',
    status: 'active',
    important: true,
    frequency: 'Once',
    subtasks: [
      { id: 201, title: 'Read chapter on indexes', completed: true },
      { id: 202, title: 'Practice join queries', completed: false },
      { id: 203, title: 'Summarize key concepts', completed: false },
    ],
  },
  {
    id: 3,
    title: 'Finish REST API documentation',
    description: 'Document auth, tasks, and subtask endpoints.',
    category: 'Work',
    priority: 'Medium',
    dueDate: '2026-08-17',
    status: 'active',
    important: false,
    frequency: 'Once',
    subtasks: [
      { id: 301, title: 'Auth endpoints', completed: true },
      { id: 302, title: 'Task endpoints', completed: false },
      { id: 303, title: 'Subtask endpoints', completed: false },
    ],
  },
  {
    id: 4,
    title: 'Review JavaScript notes',
    description: 'Go over closures, promises, and async/await.',
    category: 'Learning',
    priority: 'Medium',
    dueDate: '2026-08-18',
    status: 'active',
    important: false,
    frequency: 'Weekly',
    subtasks: [
      { id: 401, title: 'Closures', completed: false },
      { id: 402, title: 'Promises', completed: false },
    ],
  },
  {
    id: 5,
    title: 'Work on Events Hub',
    description: 'Polish the events listing and filter UI.',
    category: 'Projects',
    priority: 'High',
    dueDate: '2026-08-19',
    status: 'active',
    important: true,
    frequency: 'Once',
    subtasks: [
      { id: 501, title: 'Fix filter bugs', completed: true },
      { id: 502, title: 'Improve card layout', completed: true },
      { id: 503, title: 'Add empty state', completed: false },
    ],
  },
  {
    id: 6,
    title: 'Practice PostgreSQL queries',
    description: 'Write SELECT, JOIN, and aggregate practice queries.',
    category: 'Learning',
    priority: 'Low',
    dueDate: '2026-08-20',
    status: 'completed',
    important: false,
    frequency: 'Weekly',
    subtasks: [
      { id: 601, title: 'Basic SELECT practice', completed: true },
      { id: 602, title: 'JOIN practice', completed: true },
      { id: 603, title: 'GROUP BY practice', completed: true },
    ],
  },
  {
    id: 7,
    title: 'Plan weekly meal prep',
    description: 'Choose recipes and shopping list for the week.',
    category: 'Personal',
    priority: 'Low',
    dueDate: '2026-08-21',
    status: 'completed',
    important: false,
    frequency: 'Weekly',
    subtasks: [
      { id: 701, title: 'Pick recipes', completed: true },
      { id: 702, title: 'Write shopping list', completed: true },
    ],
  },
  {
    id: 8,
    title: 'Refactor task controller helpers',
    description: 'Clean up shared validation helpers in the backend.',
    category: 'Work',
    priority: 'Medium',
    dueDate: '2026-08-22',
    status: 'active',
    important: false,
    frequency: 'Once',
    subtasks: [],
  },
]

/** Helper to compute dashboard stats from a task list */
export function getTaskStats(tasks) {
  const total = tasks.length
  const completed = tasks.filter((t) => t.status === 'completed').length
  const inProgress = tasks.filter((t) => t.status === 'active').length
  const important = tasks.filter((t) => t.important).length

  return { total, completed, inProgress, important }
}
