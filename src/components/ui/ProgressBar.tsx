interface ProgressBarProps {
  /** Progress value from 0 to 100 */
  value: number
  /** Optional label shown above the bar */
  label?: string
  /** Show percentage text */
  showPercent?: boolean
  /** Color variant */
  variant?: 'primary' | 'success' | 'warning' | 'danger'
  /** Size of the bar */
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const variantFills: Record<string, string> = {
  primary: 'bg-primary-forest dark:bg-primary-sage',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

const trackColors: Record<string, string> = {
  primary: 'bg-primary-light dark:bg-primary-forest/20',
  success: 'bg-success-light dark:bg-success/20',
  warning: 'bg-warning-light dark:bg-warning/20',
  danger: 'bg-danger-light dark:bg-danger/20',
}

const barSizes: Record<string, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

export default function ProgressBar({
  value,
  label,
  showPercent = false,
  variant = 'primary',
  size = 'md',
  className = '',
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={className}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">
              {label}
            </span>
          )}
          {showPercent && (
            <span className="text-sm font-semibold text-[var(--color-text)]">
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}

      <div
        className={[
          'w-full rounded-full overflow-hidden',
          trackColors[variant],
          barSizes[size],
        ].join(' ')}
      >
        <div
          className={[
            'h-full rounded-full transition-all duration-500 ease-out',
            variantFills[variant],
          ].join(' ')}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
