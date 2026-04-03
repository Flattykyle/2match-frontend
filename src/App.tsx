import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { SocketProvider } from './context/SocketContext'
import { PremiumGateProvider } from './context/PremiumGateContext'
import ErrorBoundary from './components/ErrorBoundary'
import PageLoader from './components/PageLoader'
import Layout from './components/Layout'

// Retry wrapper for lazy imports — handles stale chunks after redeployment
function lazyWithRetry(importFn: () => Promise<any>) {
  return lazy(() =>
    importFn().catch(() => {
      // Chunk likely stale after a new deployment — force reload once
      const key = '2match-chunk-retry'
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1')
        window.location.reload()
      }
      // If we already retried, clear the flag and let the error propagate
      sessionStorage.removeItem(key)
      return importFn()
    })
  )
}

// Lazy load all page components for code splitting
const Home = lazyWithRetry(() => import('./pages/Home'))
const Login = lazyWithRetry(() => import('./pages/Login'))
const Register = lazyWithRetry(() => import('./pages/Register'))
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'))
const ProfileEdit = lazyWithRetry(() => import('./pages/ProfileEdit'))
const Discovery = lazyWithRetry(() => import('./pages/Discovery'))
const Matches = lazyWithRetry(() => import('./pages/Matches'))
const Messages = lazyWithRetry(() => import('./pages/Messages'))
const LikedProfiles = lazyWithRetry(() => import('./pages/LikedProfiles'))
const Search = lazyWithRetry(() => import('./pages/Search'))
const Settings = lazyWithRetry(() => import('./pages/Settings'))
const ProfileViews = lazyWithRetry(() => import('./pages/ProfileViews'))
const BlockedUsers = lazyWithRetry(() => import('./pages/BlockedUsers'))
const Icebreaker = lazyWithRetry(() => import('./pages/Icebreaker'))
const SafetySettingsPage = lazyWithRetry(() => import('./pages/SafetySettings'))
const Upgrade = lazyWithRetry(() => import('./pages/Upgrade'))
const Onboarding = lazyWithRetry(() => import('./pages/Onboarding'))

// BEFORE: Single ErrorBoundary at the top — one route crash kills the entire app
// AFTER: ErrorBoundary wraps each route-level component individually, so a crash
//        in e.g. Discovery doesn't take down Messages or Dashboard
function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <ErrorBoundary>
      <SocketProvider>
        <PremiumGateProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<ErrorBoundary><Home /></ErrorBoundary>} />
                <Route
                  path="login"
                  element={!isAuthenticated ? <ErrorBoundary><Login /></ErrorBoundary> : <Navigate to="/dashboard" />}
                />
                <Route
                  path="register"
                  element={!isAuthenticated ? <ErrorBoundary><Register /></ErrorBoundary> : <Navigate to="/dashboard" />}
                />
                <Route
                  path="onboarding"
                  element={isAuthenticated ? <ErrorBoundary><Onboarding /></ErrorBoundary> : <Navigate to="/login" />}
                />
                <Route
                  path="dashboard"
                  element={isAuthenticated ? <ErrorBoundary><Dashboard /></ErrorBoundary> : <Navigate to="/login" />}
                />
                <Route
                  path="profile"
                  element={isAuthenticated ? <Navigate to="/settings" /> : <Navigate to="/login" />}
                />
                <Route
                  path="profile/edit"
                  element={isAuthenticated ? <ErrorBoundary><ProfileEdit /></ErrorBoundary> : <Navigate to="/login" />}
                />
                <Route
                  path="search"
                  element={isAuthenticated ? <ErrorBoundary><Search /></ErrorBoundary> : <Navigate to="/login" />}
                />
                <Route
                  path="discovery"
                  element={isAuthenticated ? <ErrorBoundary><Discovery /></ErrorBoundary> : <Navigate to="/login" />}
                />
                <Route
                  path="likes"
                  element={isAuthenticated ? <ErrorBoundary><LikedProfiles /></ErrorBoundary> : <Navigate to="/login" />}
                />
                <Route
                  path="matches"
                  element={isAuthenticated ? <ErrorBoundary><Matches /></ErrorBoundary> : <Navigate to="/login" />}
                />
                <Route
                  path="messages"
                  element={isAuthenticated ? <ErrorBoundary><Messages /></ErrorBoundary> : <Navigate to="/login" />}
                />
                <Route
                  path="settings"
                  element={isAuthenticated ? <ErrorBoundary><Settings /></ErrorBoundary> : <Navigate to="/login" />}
                />
                <Route
                  path="profile-views"
                  element={isAuthenticated ? <ErrorBoundary><ProfileViews /></ErrorBoundary> : <Navigate to="/login" />}
                />
                <Route
                  path="blocked-users"
                  element={isAuthenticated ? <ErrorBoundary><BlockedUsers /></ErrorBoundary> : <Navigate to="/login" />}
                />
                <Route
                  path="icebreaker/:matchId"
                  element={isAuthenticated ? <ErrorBoundary><Icebreaker /></ErrorBoundary> : <Navigate to="/login" />}
                />
                <Route
                  path="safety"
                  element={isAuthenticated ? <ErrorBoundary><SafetySettingsPage /></ErrorBoundary> : <Navigate to="/login" />}
                />
                <Route
                  path="upgrade"
                  element={isAuthenticated ? <ErrorBoundary><Upgrade /></ErrorBoundary> : <Navigate to="/login" />}
                />
              </Route>
            </Routes>
          </Suspense>
        </Router>
        </PremiumGateProvider>
      </SocketProvider>
    </ErrorBoundary>
  )
}

export default App
