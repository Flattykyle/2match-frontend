import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'

// BEFORE: Stored token in sessionStorage, sent as Authorization: Bearer header
// AFTER: No token in JS — httpOnly cookies handle auth. Only user profile is persisted.
interface AuthState {
  user: User | null
  // BEFORE: token: string | null — removed, tokens live in httpOnly cookies now
  isAuthenticated: boolean
  setAuth: (user: User) => void
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      // BEFORE: setAuth: (user, token) => set({ user, token, isAuthenticated: true })
      // AFTER: No token parameter — cookies are set by the browser automatically
      setAuth: (user) =>
        set({ user, isAuthenticated: true }),
      setUser: (user) =>
        set({ user }),
      // BEFORE: logout cleared token from store
      // AFTER: No token to clear — just reset user state (cookies cleared by /auth/logout response)
      logout: () =>
        set({ user: null, isAuthenticated: false }),
    }),
    {
      name: '2match-auth-storage',
      storage: {
        getItem: (name) => {
          const value = sessionStorage.getItem(name)
          return value ? JSON.parse(value) : null
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name)
        },
      },
    }
  )
)
