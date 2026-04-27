import axios from 'axios'
import useAuthStore from '../store/authStore.js'
import { normalizeError } from '../lib/errors.js'
import { ENDPOINTS } from './endpoints.js'

const LOGIN_PATH = ENDPOINTS.auth.login

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  if (config.url === LOGIN_PATH) return config
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearToken()
      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
    }
    return Promise.reject(normalizeError(error))
  }
)

export default client
