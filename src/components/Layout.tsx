import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Search, Heart, Users, MessageCircle, Settings, Compass } from 'lucide-react'
import InstallPrompt from './InstallPrompt'

const Layout = () => {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { path: '/search', icon: Search, label: 'Search', gradient: 'from-blue-500 to-cyan-500' },
    { path: '/discovery', icon: Compass, label: 'Discover', gradient: 'from-purple-500 to-pink-500' },
    { path: '/likes', icon: Heart, label: 'Likes', gradient: 'from-rose-500 to-red-500' },
    { path: '/matches', icon: Users, label: 'Matches', gradient: 'from-green-500 to-emerald-500' },
    { path: '/messages', icon: MessageCircle, label: 'Messages', gradient: 'from-orange-500 to-amber-500' },
    { path: '/settings', icon: Settings, label: 'Settings', gradient: 'from-indigo-500 to-violet-500' },
  ]

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Desktop Top Navigation */}
      <nav className="hidden md:block bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg dark:shadow-gray-900/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-3xl font-bold gradient-text">2-Match</span>
            </Link>

            <div className="flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`font-medium transition-colors ${
                        isActive(item.path)
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                      {user?.firstName?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg dark:shadow-gray-900/50 sticky top-0 z-50">
        <div className="flex justify-between items-center px-4 h-14">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold gradient-text">2-Match</span>
          </Link>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isAuthenticated && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 z-50 shadow-2xl safe-area-inset-bottom">
          <div className="grid grid-cols-6 h-14 sm:h-16 px-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center justify-center relative group"
                >
                  {/* Active indicator */}
                  {active && (
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 sm:w-12 h-1 rounded-b-full bg-gradient-to-r ${item.gradient}`} />
                  )}

                  {/* Icon container with gradient background when active */}
                  <div className={`
                    relative transition-all duration-300 ease-out
                    ${active ? 'scale-110 -translate-y-0.5' : 'group-hover:scale-105'}
                  `}>
                    {active ? (
                      <div className={`p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg`}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.5} />
                      </div>
                    ) : (
                      <div className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors" strokeWidth={2} />
                      </div>
                    )}
                  </div>

                  {/* Label - only show for active item on larger screens */}
                  <span className={`
                    text-[8px] sm:text-[10px] font-semibold mt-0.5 transition-all duration-300 hidden xs:block
                    ${active ? 'opacity-100 bg-gradient-to-r bg-clip-text text-transparent ' + item.gradient : 'opacity-0'}
                  `}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </nav>
      )}

      <main>
        <Outlet />
      </main>

      {/* PWA Install Prompt for authenticated users */}
      {isAuthenticated && <InstallPrompt />}
    </div>
  )
}

export default Layout
