import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search,
  Compass,
  Heart,
  Users,
  MessageCircle,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

/* ── Types ── */
interface AppShellProps {
  children: ReactNode
  rightPanel?: ReactNode
}

interface NavItem {
  path: string
  icon: React.FC<{ className?: string }>
  label: string
}

/* ── Nav items ── */
const navItems: NavItem[] = [
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/discovery', icon: Compass, label: 'Discover' },
  { path: '/likes', icon: Heart, label: 'Likes' },
  { path: '/matches', icon: Users, label: 'Matches' },
  { path: '/messages', icon: MessageCircle, label: 'Messages' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

/* ── Sidebar icon button ── */
function NavIcon({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon

  return (
    <Link
      to={item.path}
      className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors group"
      aria-label={item.label}
    >
      {/* Active indicator bar */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[var(--color-primary)]"
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        />
      )}

      <div
        className={[
          'flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200',
          isActive
            ? 'bg-[var(--color-primary-50)] dark:bg-primary-900/30 text-[var(--color-primary)]'
            : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] hover:bg-black/5 dark:hover:bg-white/10',
        ].join(' ')}
      >
        <Icon className="w-5 h-5" />
      </div>

      {/* Tooltip */}
      <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-[var(--color-plum)] text-white text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
        {item.label}
      </div>
    </Link>
  )
}

/* ── Component ── */
export default function AppShell({ children, rightPanel }: AppShellProps) {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const isActive = (path: string) => location.pathname === path

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-surface)]">
      {/* ── Sidebar (64px) — hidden on mobile ── */}
      <aside className="hidden md:flex flex-col items-center w-16 py-4 border-r border-gray-200 dark:border-gray-800 bg-[var(--color-surface-raised)]">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-primary)] text-white font-extrabold text-lg mb-6 shadow-primary-glow"
        >
          2M
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col items-center gap-1 flex-1">
          {navItems.map((item) => (
            <NavIcon key={item.path} item={item} isActive={isActive(item.path)} />
          ))}
        </nav>

        {/* Bottom: avatar + logout */}
        <div className="flex flex-col items-center gap-2 mt-auto">
          <Link
            to="/settings"
            className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-plum)] flex items-center justify-center text-white text-sm font-bold ring-2 ring-[var(--color-surface-raised)]"
          >
            {user?.firstName?.charAt(0).toUpperCase() ?? '?'}
          </Link>
          <button
            onClick={logout}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </div>
      </main>

      {/* ── Right panel (280px) — hidden below lg ── */}
      {rightPanel && (
        <aside className="hidden lg:block w-[280px] border-l border-gray-200 dark:border-gray-800 bg-[var(--color-surface-raised)] overflow-y-auto">
          <div className="p-4">{rightPanel}</div>
        </aside>
      )}

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-[var(--z-nav)] bg-[var(--color-surface-raised)]/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 safe-area-inset-bottom">
        <div className="grid grid-cols-6 h-14 px-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center gap-0.5"
              >
                <div
                  className={[
                    'flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200',
                    active
                      ? 'bg-[var(--color-primary)] text-white shadow-sm scale-110'
                      : 'text-[var(--color-text-tertiary)]',
                  ].join(' ')}
                >
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                {active && (
                  <span className="text-[9px] font-bold text-[var(--color-primary)]">
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
