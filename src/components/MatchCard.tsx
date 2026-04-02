import { useState } from 'react'
import { Heart, X, MapPin, Sparkles, User } from 'lucide-react'
import { PotentialMatch } from '../services/discoveryService'

interface MatchCardProps {
  user: PotentialMatch
  onLike: () => void
  onPass: () => void
  style?: React.CSSProperties
}

const MatchCard = ({ user, onLike, onPass, style }: MatchCardProps) => {
  const [_showDetails, _setShowDetails] = useState(false)

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

  const age = calculateAge(user.dateOfBirth)
  const primaryPhoto = user.profilePictures[0]
  const compatibility = user.compatibility || 0

  // Determine compatibility color
  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500'
    if (score >= 60) return 'from-blue-500 to-cyan-500'
    if (score >= 40) return 'from-yellow-500 to-orange-500'
    return 'from-gray-400 to-gray-500'
  }

  return (
    <div
      className="absolute w-full h-full select-none"
      style={style}
    >
      <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Image Section */}
        <div className="relative h-[55%] sm:h-2/3">
          {primaryPhoto ? (
            <img
              src={primaryPhoto}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-full h-full object-cover"
              draggable="false"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-200 to-secondary-200 flex items-center justify-center">
              <User className="w-32 h-32 text-white opacity-50" />
            </div>
          )}

          {/* Compatibility Badge */}
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
            <div className={`bg-gradient-to-r ${getCompatibilityColor(compatibility)} text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full shadow-lg flex items-center gap-1 sm:gap-2`}>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-bold text-sm sm:text-lg">{compatibility}%</span>
            </div>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent"></div>

          {/* Name and Age */}
          <div className="absolute bottom-4 left-3 sm:left-4 right-3 sm:right-4">
            <h2 className="text-white text-xl sm:text-3xl font-bold drop-shadow-lg truncate">
              {user.firstName} {user.lastName}, {age}
            </h2>
            {(user.locationCity || user.locationCountry) && (
              <div className="flex items-center gap-1 text-white/90 mt-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">
                  {user.locationCity}
                  {user.locationCity && user.locationCountry && ', '}
                  {user.locationCountry}
                  {user.breakdown?.distance && (
                    <span className="ml-1">• {user.breakdown.distance} km away</span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="h-[45%] sm:h-1/3 p-3 sm:p-6 overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
          {/* Bio */}
          {user.bio && (
            <p className="text-gray-700 text-sm mb-3 line-clamp-2">
              {user.bio}
            </p>
          )}

          {/* Shared Hobbies */}
          {user.breakdown?.sharedHobbies && user.breakdown.sharedHobbies.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">
                Shared Hobbies
              </p>
              <div className="flex flex-wrap gap-1">
                {user.breakdown.sharedHobbies.slice(0, 3).map((hobby, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 rounded-full text-xs font-medium"
                  >
                    {hobby}
                  </span>
                ))}
                {user.breakdown.sharedHobbies.length > 3 && (
                  <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">
                    +{user.breakdown.sharedHobbies.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Shared Talents */}
          {user.breakdown?.sharedTalents && user.breakdown.sharedTalents.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">
                Shared Talents
              </p>
              <div className="flex flex-wrap gap-1">
                {user.breakdown.sharedTalents.slice(0, 3).map((talent, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gradient-to-r from-secondary-100 to-secondary-200 text-secondary-700 rounded-full text-xs font-medium"
                  >
                    {talent}
                  </span>
                ))}
                {user.breakdown.sharedTalents.length > 3 && (
                  <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">
                    +{user.breakdown.sharedTalents.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Vibe Tags */}
          {user.vibeTags && user.vibeTags.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {user.vibeTags.slice(0, 4).map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold"
                  >
                    <span>{tag.emoji}</span>
                    <span>{tag.label}</span>
                  </span>
                ))}
                {user.vibeTags.length > 4 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                    +{user.vibeTags.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Looking For */}
          <div className="flex items-center gap-2 text-sm">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-gray-600 capitalize">
              Looking for {user.lookingFor}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons - Overlay on the card */}
      <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 flex justify-center gap-4 sm:gap-6 px-4 sm:px-6">
        <button
          onClick={onPass}
          className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full shadow-xl flex items-center justify-center text-red-500 hover:bg-red-50 hover:scale-110 transition-all duration-200 border-2 border-red-200"
        >
          <X className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2.5} />
        </button>
        <button
          onClick={onLike}
          className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full shadow-xl flex items-center justify-center text-white hover:scale-110 transition-all duration-200"
        >
          <Heart className="w-7 h-7 sm:w-10 sm:h-10" fill="currentColor" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

export default MatchCard
