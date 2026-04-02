import { useState, useRef } from 'react'
import { useGesture } from '@use-gesture/react'
import { Heart, X, MapPin, Star } from 'lucide-react'
import OnlineStatus from './OnlineStatus'
import VerifiedBadge from './VerifiedBadge'

interface SwipeableCardProps {
  user: any
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onProfileClick?: () => void
}

export default function SwipeableCard({
  user,
  onSwipeLeft,
  onSwipeRight,
  onProfileClick,
}: SwipeableCardProps) {
  const [{ x, y, rotate }, set] = useState({ x: 0, y: 0, rotate: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const bind = useGesture(
    {
      onDrag: ({ movement: [mx, my], direction: [xDir], active }) => {
        const dir = xDir < 0 ? -1 : 1

        if (!active && Math.abs(mx) > 100) {
          // Swiped far enough
          if (dir === 1) {
            // Swiped right - like
            set({ x: 200 * dir, y: my, rotate: rotate + dir * 10 })
            setTimeout(() => {
              onSwipeRight?.()
              set({ x: 0, y: 0, rotate: 0 })
            }, 300)
          } else {
            // Swiped left - pass
            set({ x: 200 * dir, y: my, rotate: rotate + dir * 10 })
            setTimeout(() => {
              onSwipeLeft?.()
              set({ x: 0, y: 0, rotate: 0 })
            }, 300)
          }
        } else {
          // Still dragging or not far enough
          set({
            x: active ? mx : 0,
            y: active ? my * 0.3 : 0,
            rotate: active ? mx / 10 : 0,
          })
        }

        setIsDragging(active)
      },
    },
    {
      drag: {
        filterTaps: true,
      },
    }
  )

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const age = user.dateOfBirth ? calculateAge(user.dateOfBirth) : null

  return (
    <div
      ref={cardRef}
      {...bind()}
      onClick={() => !isDragging && onProfileClick?.()}
      style={{
        transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg)`,
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      className="absolute inset-0 transition-all duration-300 ease-out will-change-transform"
    >
      <div className="relative w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden select-none">
        {/* Main Image */}
        <div className="relative h-full">
          <img
            src={user.profilePictures?.[0] || '/default-avatar.png'}
            alt={user.firstName}
            className="w-full h-full object-cover"
            draggable="false"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Swipe Indicators */}
          {x !== 0 && (
            <>
              {x > 0 && (
                <div
                  className="absolute top-8 left-8 transform rotate-[-15deg]"
                  style={{ opacity: Math.min(Math.abs(x) / 100, 1) }}
                >
                  <div className="px-6 py-3 bg-green-500 text-white text-2xl font-bold rounded-xl border-4 border-white shadow-lg">
                    <Heart className="w-10 h-10 fill-current" />
                  </div>
                </div>
              )}

              {x < 0 && (
                <div
                  className="absolute top-8 right-8 transform rotate-[15deg]"
                  style={{ opacity: Math.min(Math.abs(x) / 100, 1) }}
                >
                  <div className="px-6 py-3 bg-red-500 text-white text-2xl font-bold rounded-xl border-4 border-white shadow-lg">
                    <X className="w-10 h-10" />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Online Status Badge */}
          <div className="absolute top-6 right-6">
            <OnlineStatus
              isOnline={user.isOnline}
              lastActive={user.lastActive}
              size="lg"
            />
          </div>

          {/* User Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex items-end justify-between">
              <div className="flex-1 min-w-0">
                {/* Name and Age */}
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-3xl md:text-4xl font-bold text-white truncate">
                    {user.firstName}, {age}
                  </h2>
                  <VerifiedBadge
                    emailVerified={user.emailVerified}
                    phoneVerified={user.phoneVerified}
                    photoVerified={user.photoVerified}
                    size="lg"
                  />
                </div>

                {/* Location & Distance */}
                {(user.locationCity || user.distanceText) && (
                  <div className="flex items-center gap-2 text-white/90 mb-3">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <p className="text-sm md:text-base truncate">
                      {user.distanceText || `${user.locationCity}, ${user.locationCountry}`}
                    </p>
                  </div>
                )}

                {/* Bio */}
                {user.bio && (
                  <p className="text-white/80 text-sm md:text-base line-clamp-2 mb-3">
                    {user.bio}
                  </p>
                )}

                {/* Compatibility Score */}
                {user.compatibility !== undefined && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-semibold text-sm">
                      {user.compatibility}% Match
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Interests */}
            {user.interests && user.interests.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {user.interests.slice(0, 3).map((interest: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full"
                  >
                    {interest}
                  </span>
                ))}
                {user.interests.length > 3 && (
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                    +{user.interests.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
