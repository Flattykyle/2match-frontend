import { ReactNode } from 'react'

type BadgeVariant = 'intention' | 'vibe'
type IntentionType = 'serious' | 'casual' | 'friendship' | 'exploring'

interface BadgeProps {
  variant?: BadgeVariant
  intention?: IntentionType
  icon?: ReactNode
  children: ReactNode
  className?: string
}

const intentionConfig: Record<IntentionType, { bg: string; text: string; darkBg: string; darkText: string }> = {
  serious: {
    bg: 'bg-primary-light',
    text: 'text-primary-forest',
    darkBg: 'dark:bg-primary-forest/20',
    darkText: 'dark:text-primary-sage',
  },
  casual: {
    bg: 'bg-accent-warm',
    text: 'text-accent-terracotta',
    darkBg: 'dark:bg-accent-terracotta/20',
    darkText: 'dark:text-accent-warm',
  },
  friendship: {
    bg: 'bg-info-light',
    text: 'text-info',
    darkBg: 'dark:bg-info/20',
    darkText: 'dark:text-info-light',
  },
  exploring: {
    bg: 'bg-warning-light',
    text: 'text-warning',
    darkBg: 'dark:bg-warning/20',
    darkText: 'dark:text-warning-light',
  },
}

export default function Badge({
  variant = 'vibe',
  intention = 'exploring',
  icon,
  children,
  className = '',
}: BadgeProps) {
  if (variant === 'intention') {
    const config = intentionConfig[intention]
    return (
      <span
        className={[
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium',
          config.bg,
          config.text,
          config.darkBg,
          config.darkText,
          className,
        ].join(' ')}
      >
        {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
        {children}
      </span>
    )
  }

  // Vibe tag pill
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium',
        'bg-primary-sage/20 text-primary-forest',
        'dark:bg-primary-sage/10 dark:text-primary-sage',
        'border border-primary-sage/30 dark:border-primary-sage/20',
        'transition-colors duration-200',
        className,
      ].join(' ')}
    >
      {icon && <span className="w-3.5 h-3.5 flex-shrink-0">{icon}</span>}
      {children}
    </span>
  )
}
