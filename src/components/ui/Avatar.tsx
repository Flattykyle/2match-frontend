type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  src?: string | null
  alt?: string
  size?: AvatarSize
  online?: boolean
  className?: string
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
}

const indicatorSizes: Record<AvatarSize, string> = {
  sm: 'w-2 h-2 border',
  md: 'w-2.5 h-2.5 border-2',
  lg: 'w-3 h-3 border-2',
  xl: 'w-4 h-4 border-2',
}

const textSizes: Record<AvatarSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
  xl: 'text-2xl',
}

export default function Avatar({
  src,
  alt = '',
  size = 'md',
  online,
  className = '',
}: AvatarProps) {
  const initials = alt
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={[
            sizeStyles[size],
            'rounded-full object-cover',
            'ring-2 ring-neutral-cream dark:ring-neutral-darkBg',
          ].join(' ')}
        />
      ) : (
        <div
          className={[
            sizeStyles[size],
            textSizes[size],
            'rounded-full flex items-center justify-center font-semibold',
            'bg-primary-light text-primary-forest',
            'dark:bg-primary-forest/30 dark:text-primary-sage',
          ].join(' ')}
        >
          {initials || '?'}
        </div>
      )}

      {online !== undefined && (
        <span
          className={[
            'absolute bottom-0 right-0 rounded-full',
            indicatorSizes[size],
            'border-white dark:border-neutral-darkBg',
            online ? 'bg-success' : 'bg-neutral-cream dark:bg-neutral-almostBlack',
          ].join(' ')}
        />
      )}
    </div>
  )
}
