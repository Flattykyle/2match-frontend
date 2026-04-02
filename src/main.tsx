import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css' /* imports theme.css via @import */

// Clean up old localStorage auth (one-time migration to sessionStorage)
localStorage.removeItem('2match-auth-storage')

// Initialize dark mode from persisted preference before render to prevent flash
const themeData = localStorage.getItem('2match-theme-storage')
if (themeData) {
  try {
    const parsed = JSON.parse(themeData)
    if (parsed?.state?.darkMode) {
      document.documentElement.classList.add('dark')
    }
  } catch {
    // ignore parse errors
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
