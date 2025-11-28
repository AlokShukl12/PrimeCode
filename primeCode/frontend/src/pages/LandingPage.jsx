import { Link, useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import { useAuth } from '../context/AuthContext'

const LandingPage = () => {
  const navigate = useNavigate()
  const { token } = useAuth()

  const primaryCta = () => {
    navigate(token ? '/dashboard' : '/register')
  }

  return (
    <div className="min-h-screen bg-ink text-slate-100">
      <TopNav />
      <main className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 pb-20 pt-14">
        <h1 className="text-center text-3xl font-semibold text-white sm:text-4xl">
          {token ? 'Welcome back' : 'Welcome'}
        </h1>
        <p className="max-w-2xl text-center text-base text-slate-300">Choose where you want to go next.</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={primaryCta}
            className="rounded-full bg-gradient-to-r from-accent to-indigo-500 px-7 py-3 text-base font-semibold text-ink shadow-card transition hover:-translate-y-0.5 hover:shadow-indigo-500/30"
          >
            {token ? 'Go to dashboard' : 'Create account'}
          </button>
          <Link
            to="/login"
            className="rounded-full border border-slate-700 px-6 py-3 text-base font-semibold text-slate-200 transition hover:border-accent hover:text-accent"
          >
            {token ? 'Switch account' : 'I already have an account'}
          </Link>
        </div>
      </main>
    </div>
  )
}

export default LandingPage
