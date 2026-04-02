import { motion } from 'framer-motion'

interface VibeTagProps {
  emoji: string
  label: string
  variant?: 'default' | 'active' | 'muted'
  size?: 'sm' | 'md'
  onClick?: () => void
  className?: string
}

const variantStyles: Record<VibeTagProps['variant'] & string, string> = {
  default: 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)] dark:bg-secondary-800 dark:text-primary-300',
  active: 'bg-[var(--color-primary)] text-white shadow-sm',
  muted: 'bg-gray-100 text-[var(--color-text-tertiary)] dark:bg-gray-800 dark:text-gray-500',
}

const sizeStyles: Record<'sm' | 'md', string> = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-3 py-1 gap-1.5',
}

export default function VibeTag({
  emoji,
  label,
  variant = 'default',
  size = 'sm',
  onClick,
  className = '',
}: VibeTagProps) {
  const Tag = onClick ? motion.button : motion.span

  return (
    <Tag
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      onClick={onClick}
      className={[
        'inline-flex items-center rounded-full font-semibold select-none',
        'transition-colors duration-[var(--transition-fast)]',
        variantStyles[variant],
        sizeStyles[size],
        onClick ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      <span className="leading-none">{emoji}</span>
      <span>{label}</span>
    </Tag>
  )
}
