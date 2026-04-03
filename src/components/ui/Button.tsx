import { forwardRef, ReactNode } from 'react'
import { motion } from 'framer-motion'

/* ── Variant + Size types ── */
type ButtonVariant = 'primary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
  children?: ReactNode
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

/* ── Style maps ── */
const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-primary-forest text-white',
    'hover:bg-primary-forest/90',
    'shadow-forest-glow hover:shadow-lg',
    'active:scale-[0.97]',
  ].join(' '),

  ghost: [
    'bg-transparent text-[var(--color-text)]',
    'hover:bg-primary-light dark:hover:bg-white/10',
    'border border-primary-sage/40 dark:border-primary-sage/20',
  ].join(' '),

  danger: [
    'bg-danger text-white',
    'hover:bg-danger/90',
    'shadow-sm hover:shadow-md',
  ].join(' '),
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-sm px-3 py-1.5 rounded-lg gap-1.5',
  md: 'text-base px-5 py-2.5 rounded-xl gap-2',
  lg: 'text-lg px-7 py-3.5 rounded-2xl gap-2.5',
}

const iconSizes: Record<ButtonSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

/* ── Component ── */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      fullWidth = false,
      children,
      disabled,
      className = '',
      type = 'button',
      onClick,
    },
    ref,
  ) => {
    const isDisabled = disabled || loading

    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={onClick}
        whileTap={isDisabled ? undefined : { scale: 0.97 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
        disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center font-semibold',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-forest focus-visible:ring-offset-2',
          'dark:focus-visible:ring-offset-neutral-darkBg',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? 'w-full' : '',
          className,
        ].join(' ')}
      >
        {loading ? (
          <svg
            className={`animate-spin ${iconSizes[size]}`}
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : icon ? (
          <span className={iconSizes[size]}>{icon}</span>
        ) : null}
        {children}
      </motion.button>
    )
  },
)

Button.displayName = 'Button'
export default Button
