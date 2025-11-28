import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const TopNav = ({ ctaLabel = 'Launch dashboard' }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initials = user?.name
    ?.split(' ')
    .map((chunk) => chunk[0])
    .join('')
    .slice(0, 2)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 backdrop-blur">
      <div className="mx-auto flex w-full items-center justify-between px-6 py-4">
        <Link to="/" className="group flex items-center gap-3 text-lg font-semibold tracking-tight text-white">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-accent to-indigo-500 transition-transform group-hover:scale-105" />
          <div>
            <div>PrimeTrade</div>
            <p className="text-xs font-normal text-slate-400">Secure workspace</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden text-sm text-slate-300 md:block">Welcome back, {user.name}</div>
              <div className="flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-soft/60 px-3 py-1 text-sm text-slate-200 shadow-card">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-accent text-sm font-semibold text-ink">
                  {initials}
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="hidden text-xs font-semibold uppercase tracking-wide text-accent md:inline"
                >
                  {ctaLabel}
                </button>
                <div className="hidden h-5 w-px bg-slate-700 md:block" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:text-accent"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-slate-700/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-accent hover:text-accent"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-gradient-to-r from-accent to-indigo-500 px-5 py-2 text-sm font-semibold text-ink shadow-card transition hover:shadow-lg hover:shadow-indigo-500/30"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default TopNav
