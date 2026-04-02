import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, X } from 'lucide-react'

/* ── Types ── */
interface SafetyBannerProps {
  title?: string
  message: string
  variant?: 'info' | 'warning' | 'success'
  dismissible?: boolean
  storageKey?: string
  className?: string
}

const variantStyles: Record<string, { bg: string; border: string; icon: string }> = {
  info: {
    bg: 'bg-[var(--color-info-bg)] dark:bg-blue-950/30',
    border: 'border-[var(--color-info)]/30',
    icon: 'text-[var(--color-info)]',
  },
  warning: {
    bg: 'bg-[var(--color-warning-bg)] dark:bg-yellow-950/30',
    border: 'border-[var(--color-warning)]/30',
    icon: 'text-[var(--color-warning)]',
  },
  success: {
    bg: 'bg-[var(--color-success-bg)] dark:bg-green-950/30',
    border: 'border-[var(--color-success)]/30',
    icon: 'text-[var(--color-success)]',
  },
}

/* ── Component ── */
export default function SafetyBanner({
  title = 'Stay Safe',
  message,
  variant = 'info',
  dismissible = true,
  storageKey,
  className = '',
}: SafetyBannerProps) {
  const [dismissed, setDismissed] = useState(() => {
    if (storageKey) {
      return sessionStorage.getItem(`safety-banner-${storageKey}`) === 'dismissed'
    }
    return false
  })

  const handleDismiss = () => {
    setDismissed(true)
    if (storageKey) {
      sessionStorage.setItem(`safety-banner-${storageKey}`, 'dismissed')
    }
  }

  const styles = variantStyles[variant]

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.25 }}
          className={`overflow-hidden ${className}`}
        >
          <div
            className={[
              'flex items-start gap-3 rounded-2xl border p-4',
              styles.bg,
              styles.border,
            ].join(' ')}
          >
            <ShieldCheck className={`w-5 h-5 mt-0.5 flex-shrink-0 ${styles.icon}`} />

            <div className="flex-1 min-w-0">
              {title && (
                <p className="text-sm font-bold text-[var(--color-text)] mb-0.5">
                  {title}
                </p>
              )}
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {message}
              </p>
            </div>

            {dismissible && (
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
