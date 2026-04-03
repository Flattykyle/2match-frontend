import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { SocketProvider } from './context/SocketContext'
import { PremiumGateProvider } from './context/PremiumGateContext'
import ErrorBoundary from './components/ErrorBoundary'
import PageLoader from './components/PageLoader'
import Layout from './components/Layout'

// Lazy load all page components for code splitting
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ProfileEdit = lazy(() => import('./pages/ProfileEdit'))
const Discovery = lazy(() => import('./pages/Discovery'))
const Matches = lazy(() => import('./pages/Matches'))
const Messages = lazy(() => import('./pages/Messages'))
const LikedProfiles = lazy(() => import('./pages/LikedProfiles'))
const Search = lazy(() => import('./pages/Search'))
const Settings = lazy(() => import('./pages/Settings'))
const ProfileViews = lazy(() => import('./pages/ProfileViews'))
const BlockedUsers = lazy(() => import('./pages/BlockedUsers'))
const Icebreaker = lazy(() => import('./pages/Icebreaker'))
const SafetySettingsPage = lazy(() => import('./pages/SafetySettings'))
const Upgrade = lazy(() => import('./pages/Upgrade'))
const Onboarding = lazy(() => import('./pages/Onboarding'))

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
