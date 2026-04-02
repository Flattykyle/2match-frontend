import { formatDistanceToNow } from 'date-fns'

interface OnlineStatusProps {
  isOnline?: boolean
  lastActive?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export default function OnlineStatus({
  isOnline,
  lastActive,
  size = 'md',
  showText = false,
  className = '',
}: OnlineStatusProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }

  const getLastActiveText = () => {
    if (!lastActive) return 'Offline'
    try {
      return `Active ${formatDistanceToNow(new Date(lastActive), { addSuffix: true })}`
    } catch {
      return 'Offline'
    }
  }

  if (!isOnline && !lastActive) return null

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Status dot */}
      <span className="relative flex">
        <span
          className={`${sizeClasses[size]} rounded-full ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
        {isOnline && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full ${
              isOnline ? 'bg-green-400' : 'bg-gray-300'
            } opacity-75 animate-ping`}
          />
        )}
      </span>

      {/* Status text */}
      {showText && (
        <span
          className={`text-sm ${
            isOnline ? 'text-green-600 font-medium' : 'text-gray-500'
          }`}
        >
          {isOnline ? 'Active now' : getLastActiveText()}
        </span>
      )}
    </div>
  )
}
