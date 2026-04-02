import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // BEFORE: No withCredentials — tokens were in Authorization header from localStorage
  // AFTER: withCredentials sends httpOnly cookies with every request
  withCredentials: true,
})

// BEFORE: Request interceptor added Authorization: Bearer <token> from authStore.token
// AFTER: No request interceptor needed — browser sends httpOnly cookies automatically

// ---- Refresh token interceptor ----
// BEFORE: On 401, immediately logged out and redirected to /login
// AFTER: On 401 TOKEN_EXPIRED, call /auth/refresh first, then retry the original request.
//        Only logout if the refresh itself fails.
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: InternalAxiosRequestConfig) => void
  reject: (reason: any) => void
  config: InternalAxiosRequestConfig
}> = []

const processQueue = (error: any | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(prom.config)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      const errorCode = (error.response?.data as any)?.code

      // Only attempt refresh on TOKEN_EXPIRED, not on invalid credentials etc.
      if (errorCode === 'TOKEN_EXPIRED') {
        if (isRefreshing) {
          // Queue this request — it will be retried after the refresh completes
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject, config: originalRequest })
          }).then((config) => api(config as InternalAxiosRequestConfig))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          // AFTER: Call /auth/refresh — the refresh_token cookie is sent automatically
          await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })

          // Refresh succeeded — new access_token cookie is set. Retry all queued requests.
          processQueue(null)
          return api(originalRequest)
        } catch (refreshError) {
          // Refresh failed — token is truly invalid. Logout.
          processQueue(refreshError)
          useAuthStore.getState().logout()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      // For NO_TOKEN or INVALID_TOKEN, just logout directly (no point trying refresh)
      if (errorCode === 'NO_TOKEN' || errorCode === 'INVALID_TOKEN') {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api
