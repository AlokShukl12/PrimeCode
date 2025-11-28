import { useEffect, useMemo, useState } from 'react'
import TopNav from '../components/TopNav'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../services/api'

const emptyTask = { title: '', description: '', priority: 'medium', status: 'todo', tags: '' }

const statusStyles = {
  todo: 'bg-slate-800/80 text-slate-200',
  'in-progress': 'bg-amber-500/20 text-amber-200',
  done: 'bg-emerald-500/20 text-emerald-300',
}

const priorityStyles = {
  low: 'bg-slate-800/80 text-slate-200',
  medium: 'bg-sky-500/20 text-sky-200',
  high: 'bg-rose-500/20 text-rose-200',
}

const TaskCard = ({ task, onEdit, onDelete, onStatus }) => (
  <div className="flex flex-col gap-4 rounded-2xl border border-slate-700/70 bg-slate-soft/70 p-4 shadow-card">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-400">Task</p>
        <h4 className="text-lg font-semibold text-white">{task.title}</h4>
        {task.description && <p className="mt-1 text-sm text-slate-300">{task.description}</p>}
      </div>
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[task.status]}`}>{task.status}</span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      {task.tags?.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-slate-900/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300"
        >
          {tag}
        </span>
      ))}
      {!task.tags?.length && <span className="text-xs text-slate-500">No tags</span>}
    </div>

    <div className="flex flex-wrap items-center gap-3">
      <select
        value={task.status}
        onChange={(e) => onStatus(task.id, e.target.value)}
        className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-100 outline-none transition focus:border-accent"
      >
        <option value="todo">Todo</option>
        <option value="in-progress">In progress</option>
        <option value="done">Done</option>
      </select>
      <button
        type="button"
        onClick={() => onEdit(task)}
        className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-accent hover:text-accent"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={() => onDelete(task.id)}
        className="rounded-xl border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20"
      >
        Delete
      </button>
    </div>
  </div>
)

const DashboardPage = () => {
  const { user, setUser } = useAuth()
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', bio: user?.bio || '' })
  const [profileMessage, setProfileMessage] = useState('')
  const [profileErrors, setProfileErrors] = useState({})
  const [savingProfile, setSavingProfile] = useState(false)

  const [tasks, setTasks] = useState([])
  const [taskForm, setTaskForm] = useState(emptyTask)
  const [taskErrors, setTaskErrors] = useState({})
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [tasksLoading, setTasksLoading] = useState(false)
  const [filters, setFilters] = useState({ search: '', status: 'all' })
  const [taskMessage, setTaskMessage] = useState('')

  useEffect(() => {
    setProfileForm({ name: user?.name || '', bio: user?.bio || '' })
  }, [user])

  const fetchTasks = async (activeFilters = filters) => {
    setTasksLoading(true)
    setTaskMessage('')
    try {
      const params = {
        ...(activeFilters.search ? { search: activeFilters.search } : {}),
        ...(activeFilters.status !== 'all' ? { status: activeFilters.status } : {}),
      }
      const { data } = await apiClient.get('tasks', { params })
      setTasks(data.tasks || [])
    } catch (error) {
      setTaskMessage(error.message || 'Unable to load tasks right now.')
    } finally {
      setTasksLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => fetchTasks(), 250)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.status])

  const validateTaskForm = () => {
    const errs = {}
    if (!taskForm.title || taskForm.title.trim().length < 2) {
      errs.title = 'Title should be at least 2 characters'
    }
    if (taskForm.description && taskForm.description.length > 400) {
      errs.description = 'Description must be under 400 characters'
    }
    return errs
  }

  const normalizeTags = (value) =>
    value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

  const handleTaskSubmit = async (event) => {
    event.preventDefault()
    const errs = validateTaskForm()
    setTaskErrors(errs)
    if (Object.keys(errs).length) return

    const payload = {
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      priority: taskForm.priority,
      status: taskForm.status,
      tags: normalizeTags(taskForm.tags),
    }

    try {
      if (editingTaskId) {
        const { data } = await apiClient.put(`tasks/${editingTaskId}`, payload)
        setTasks((prev) => prev.map((task) => (task.id === editingTaskId ? data.task : task)))
      } else {
        const { data } = await apiClient.post('tasks', payload)
        setTasks((prev) => [data.task, ...prev])
      }
      setTaskMessage('')
      setTaskForm(emptyTask)
      setEditingTaskId(null)
      setTaskErrors({})
    } catch (error) {
      setTaskErrors({ form: error.message || 'Failed to save task' })
    }
  }

  const handleEditTask = (task) => {
    setEditingTaskId(task.id)
    setTaskForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      tags: (task.tags || []).join(', '),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteTask = async (id) => {
    try {
      await apiClient.delete(`tasks/${id}`)
      setTasks((prev) => prev.filter((task) => task.id !== id))
    } catch (error) {
      setTaskMessage(error.message || 'Unable to delete task')
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      const { data } = await apiClient.put(`tasks/${id}`, { status })
      setTasks((prev) => prev.map((task) => (task.id === id ? data.task : task)))
    } catch (error) {
      setTaskMessage(error.message || 'Unable to update status')
    }
  }

  const validateProfile = () => {
    const errs = {}
    if (!profileForm.name || profileForm.name.trim().length < 2) {
      errs.name = 'Name is required'
    }
    if (profileForm.bio.length > 240) {
      errs.bio = 'Bio must be under 240 characters'
    }
    return errs
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    setProfileMessage('')
    const errs = validateProfile()
    setProfileErrors(errs)
    if (Object.keys(errs).length) return

    setSavingProfile(true)
    try {
      const { data } = await apiClient.put('profile', {
        name: profileForm.name.trim(),
        bio: profileForm.bio,
      })
      setUser(data.user)
      setProfileMessage('Profile saved')
    } catch (error) {
      setProfileMessage(error.message || 'Unable to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const stats = useMemo(() => {
    const total = tasks.length
    const done = tasks.filter((t) => t.status === 'done').length
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length
    const todo = tasks.filter((t) => t.status === 'todo').length
    return [
      { label: 'Total', value: total, accent: 'from-accent to-indigo-500' },
      { label: 'Done', value: done, accent: 'from-emerald-400 to-emerald-600' },
      { label: 'In progress', value: inProgress, accent: 'from-amber-400 to-orange-500' },
      { label: 'Todo', value: todo, accent: 'from-slate-300 to-slate-500' },
    ]
  }, [tasks])

  return (
    <div className="min-h-screen bg-ink text-slate-100">
      <TopNav ctaLabel="Dashboard" />
      <div className="mx-auto w-full px-6 pb-14 pt-6">
        <div className="glass-panel rounded-3xl p-6 shadow-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Protected dashboard</p>
              <h1 className="text-2xl font-semibold text-white">Welcome, {user?.name}</h1>
              <p className="text-sm text-slate-300">Manage your profile and tasks with secure JWT-backed requests.</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-soft/80 px-4 py-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-indigo-500" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Profile</p>
                <p className="text-sm font-semibold text-white">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-700/70 bg-slate-soft/70 p-4 shadow-card">
              <p className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold text-white">{stat.value}</p>
              <div className={`mt-3 h-1 rounded-full bg-gradient-to-r ${stat.accent}`} />
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1.2fr]">
          <section className="glass-panel rounded-3xl p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Profile</p>
                <h2 className="text-xl font-semibold text-white">Your identity</h2>
              </div>
              {profileMessage && <span className="text-xs text-emerald-300">{profileMessage}</span>}
            </div>
            <form className="mt-4 space-y-4" onSubmit={handleProfileSubmit}>
              <div>
                <label className="text-sm text-slate-300">Full name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 ${
                    profileErrors.name ? 'border-red-500/70 bg-red-500/5' : 'border-slate-700 bg-slate-900/60 focus:border-accent'
                  }`}
                  placeholder="Taylor Metrics"
                />
                {profileErrors.name && <p className="mt-1 text-xs text-red-400">{profileErrors.name}</p>}
              </div>
              <div>
                <label className="text-sm text-slate-300">Bio</label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  rows={4}
                  className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 ${
                    profileErrors.bio ? 'border-red-500/70 bg-red-500/5' : 'border-slate-700 bg-slate-900/60 focus:border-accent'
                  }`}
                  placeholder="What are you building next?"
                />
                {profileErrors.bio && <p className="mt-1 text-xs text-red-400">{profileErrors.bio}</p>}
              </div>
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full rounded-2xl bg-gradient-to-r from-accent to-indigo-500 px-4 py-3 text-sm font-semibold text-ink shadow-card transition hover:-translate-y-0.5 hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {savingProfile ? 'Saving...' : 'Save profile'}
              </button>
            </form>
          </section>

          <section className="glass-panel rounded-3xl p-6 shadow-card">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tasks</p>
                <h2 className="text-xl font-semibold text-white">Search & manage</h2>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="search"
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  placeholder="Search title or description"
                  className="w-full min-w-[180px] rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-accent"
                />
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                  className="rounded-2xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm font-semibold text-slate-100 outline-none transition focus:border-accent"
                >
                  <option value="all">All</option>
                  <option value="todo">Todo</option>
                  <option value="in-progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            <form className="mt-4 space-y-3 rounded-2xl border border-slate-700/80 bg-slate-900/50 p-4" onSubmit={handleTaskSubmit}>
              <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Title</label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 ${
                      taskErrors.title ? 'border-red-500/70 bg-red-500/5' : 'border-slate-700 bg-slate-800/60 focus:border-accent'
                    }`}
                    placeholder="Ship onboarding flow"
                  />
                  {taskErrors.title && <p className="mt-1 text-xs text-red-400">{taskErrors.title}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</label>
                    <select
                      value={taskForm.status}
                      onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm font-semibold text-slate-100 outline-none transition focus:border-accent"
                    >
                      <option value="todo">Todo</option>
                      <option value="in-progress">In progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Priority</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm font-semibold text-slate-100 outline-none transition focus:border-accent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={3}
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 ${
                    taskErrors.description
                      ? 'border-red-500/70 bg-red-500/5'
                      : 'border-slate-700 bg-slate-800/60 focus:border-accent'
                  }`}
                  placeholder="Add enough context so you can finish fast."
                />
                {taskErrors.description && <p className="mt-1 text-xs text-red-400">{taskErrors.description}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tags (comma separated)</label>
                <input
                  type="text"
                  value={taskForm.tags}
                  onChange={(e) => setTaskForm({ ...taskForm, tags: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-accent"
                  placeholder="ops, billing, ux"
                />
              </div>

              {taskErrors.form && (
                <div className="rounded-xl border border-red-500/60 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                  {taskErrors.form}
                </div>
              )}
              {taskMessage && !taskErrors.form && (
                <div className="rounded-xl border border-amber-500/60 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                  {taskMessage}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-accent to-indigo-500 px-5 py-2 text-sm font-semibold text-ink shadow-card transition hover:-translate-y-0.5 hover:shadow-indigo-500/30"
                >
                  {editingTaskId ? 'Update task' : 'Create task'}
                </button>
                {editingTaskId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTaskId(null)
                      setTaskForm(emptyTask)
                      setTaskErrors({})
                    }}
                    className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-accent hover:text-accent"
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </form>

            <div className="mt-4 space-y-3">
              {tasksLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-accent" />
                  Loading tasks...
                </div>
              ) : tasks.length === 0 ? (
                <div className="rounded-2xl border border-slate-700/70 bg-slate-900/50 p-4 text-sm text-slate-300">
                  No tasks yet. Create your first task to get going.
                </div>
              ) : (
                tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onStatus={handleStatusChange}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
