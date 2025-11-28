import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiClient } from '../services/api'

const AuthContext = createContext(null)

const TOKEN_KEY = 'primecode_token'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const { data } = await apiClient.get('profile')
        setUser(data.user)
      } catch (error) {
        logout()
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [token])

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }, [token])

  const login = async (credentials) => {
    const { data } = await apiClient.post('auth/login', credentials)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  const register = async (payload) => {
    const { data } = await apiClient.post('auth/register', payload)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    setUser(null)
    setToken(null)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      setUser,
    }),
    [user, token, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
