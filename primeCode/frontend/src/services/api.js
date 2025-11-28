import axios from 'axios'

// Prefer explicit env override. If none is provided, use the local API when developing
// or previewing on localhost; otherwise default to same-origin `/api` in production deploys.
const isLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname)
const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV || isLocalhost ? 'http://localhost:5000/api' : '/api')

export const apiClient = axios.create({
  baseURL,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('primecode_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Unable to reach the API. Is the server running?'
    return Promise.reject({ ...error, message })
  },
)
