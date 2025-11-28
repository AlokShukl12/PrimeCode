import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import { useAuth } from '../context/AuthContext'

const AuthPage = ({ mode = 'login' }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register, token } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isLogin = mode === 'login'

  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true })
    }
  }, [token, navigate])

  const validate = () => {
    const nextErrors = {}
    if (!isLogin && form.name.trim().length < 2) {
      nextErrors.name = 'Name should be at least 2 characters'
    }
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      nextErrors.email = 'Provide a valid email'
    }
    if (form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters'
    }
    if (!isLogin) {
      if (!/[A-Z]/.test(form.password)) {
        nextErrors.password = 'Include at least one uppercase letter'
      } else if (!/[a-z]/.test(form.password)) {
        nextErrors.password = 'Include at least one lowercase letter'
      } else if (!/[0-9]/.test(form.password)) {
        nextErrors.password = 'Include at least one number'
      }
    }
    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setServerError('')
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password })
      } else {
        await register({ name: form.name, email: form.email, password: form.password })
      }

      const redirectTo = location.state?.from?.pathname || '/dashboard'
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setServerError(error.message || 'Unable to authenticate right now.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink text-slate-100">
      <TopNav />
      <div className="mx-auto flex w-full flex-col items-center gap-8 px-6 pb-16 pt-10">
        <section className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Access control</p>
              <h2 className="text-xl font-semibold text-white">{isLogin ? 'Login' : 'Sign up'}</h2>
            </div>
            <Link
              to={isLogin ? '/register' : '/login'}
              className="text-sm font-semibold text-accent hover:underline"
            >
              {isLogin ? 'Need an account?' : 'Have an account?'}
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm text-slate-300">Full name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 ${
                    errors.name ? 'border-red-500/70 bg-red-500/5' : 'border-slate-700 bg-slate-900/60 focus:border-accent'
                  }`}
                  placeholder="Alex Rivers"
                />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="text-sm text-slate-300">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 ${
                  errors.email ? 'border-red-500/70 bg-red-500/5' : 'border-slate-700 bg-slate-900/60 focus:border-accent'
                }`}
                placeholder="you@company.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label className="text-sm text-slate-300">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 ${
                  errors.password ? 'border-red-500/70 bg-red-500/5' : 'border-slate-700 bg-slate-900/60 focus:border-accent'
                }`}
                placeholder={isLogin ? '••••••••' : 'Min 8 characters'}
              />
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
            </div>

            {serverError && (
              <div className="rounded-xl border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-accent to-indigo-500 px-4 py-3 text-sm font-semibold text-ink shadow-card transition hover:-translate-y-0.5 hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Working...' : isLogin ? 'Login' : 'Create account'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

export default AuthPage
