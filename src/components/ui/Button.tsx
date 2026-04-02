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
    'bg-[var(--color-primary)] text-white',
    'hover:bg-[var(--color-primary-dark)]',
    'shadow-primary-glow hover:shadow-lg',
    'active:scale-[0.97]',
  ].join(' '),

  ghost: [
    'bg-transparent text-[var(--color-text)]',
    'hover:bg-black/5 dark:hover:bg-white/10',
    'border border-gray-200 dark:border-gray-700',
  ].join(' '),

  danger: [
    'bg-[var(--color-danger)] text-white',
    'hover:bg-red-600',
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
          'inline-flex items-center justify-center font-bold',
          'transition-colors duration-[var(--transition-base)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
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
