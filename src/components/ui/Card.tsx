import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  as?: 'div' | 'article' | 'section'
  onClick?: () => void
}

export default function Card({
  children,
  className = '',
  hover = true,
  as: Tag = 'div',
  onClick,
}: CardProps) {
  return (
    <Tag
      onClick={onClick}
      className={[
        'rounded-2xl p-6',
        'bg-white dark:bg-[var(--color-surface-raised)]',
        'shadow-card',
        hover && [
          'transition-all duration-200',
          'hover:shadow-card-hover hover:-translate-y-0.5',
        ].join(' '),
        onClick && 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  )
}
