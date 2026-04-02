import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, Loader2, AlertCircle, RefreshCw, Clock } from 'lucide-react'
import { getLikedUsers, LikedUser } from '../services/discoveryService'
import { getOrCreateConversation } from '../services/messageService'

const LikedProfiles = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [likedUsers, setLikedUsers] = useState<LikedUser[]>([])
  const [total, setTotal] = useState(0)
  const [matchesCount, setMatchesCount] = useState(0)
  const [filter, setFilter] = useState<'all' | 'matches'>('all')
  const [messagingUserId, setMessagingUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchLikedUsers()
  }, [])

  const fetchLikedUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getLikedUsers()
      setLikedUsers(response.likedUsers)
      setTotal(response.total)
      setMatchesCount(response.matchesCount)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading liked profiles')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (userId: string) => {
    try {
      setMessagingUserId(userId)
      await getOrCreateConversation(userId)
      navigate('/messages')
    } catch (err) {
      console.error('Error creating conversation:', err)
      setError('Failed to start conversation')
    } finally {
      setMessagingUserId(null)
    }
  }

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

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-blue-600 bg-blue-100'
    if (score >= 40) return 'text-orange-600 bg-orange-100'
    return 'text-gray-600 bg-gray-100'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  const filteredUsers = filter === 'matches'
    ? likedUsers.filter(user => user.isMatch)
    : likedUsers

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your liked profiles...</p>
        </div>
      </div>
    )
  }

  if (error && likedUsers.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="card max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchLikedUsers} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (total === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
              <Heart className="w-8 h-8" />
              Liked Profiles
            </h1>
          </div>

          <div className="card max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Likes Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't liked anyone yet. Start discovering potential matches!
            </p>
            <button
              onClick={() => navigate('/discovery')}
              className="btn-primary"
            >
              Start Discovering
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
                <Heart className="w-8 h-8" />
                Liked Profiles
              </h1>
              <p className="text-gray-600 mt-2">
                {total} {total === 1 ? 'profile' : 'profiles'} liked • {matchesCount} {matchesCount === 1 ? 'match' : 'matches'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                All ({total})
              </button>
              <button
                onClick={() => setFilter('matches')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'matches'
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Matches ({matchesCount})
              </button>
              <button
                onClick={fetchLikedUsers}
                className="p-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="card relative overflow-hidden hover:shadow-2xl transition-shadow group"
            >
              {/* Match Badge */}
              {user.isMatch && (
                <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                  <Heart className="w-4 h-4" fill="currentColor" />
                  Match!
                </div>
              )}

              {/* Profile Picture */}
              <div className="relative h-64 -mx-6 -mt-6 mb-4">
                {user.profilePictures && user.profilePictures.length > 0 ? (
                  <img
                    src={user.profilePictures[0]}
                    alt={`${user.firstName}'s profile`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                    <span className="text-6xl font-bold text-white">
                      {user.firstName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Compatibility Badge */}
                <div className="absolute bottom-4 left-4">
                  <div
                    className={`${getCompatibilityColor(
                      user.compatibility
                    )} px-3 py-1 rounded-full text-sm font-bold shadow-lg`}
                  >
                    {user.compatibility}% Match
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {user.firstName} {user.lastName}, {calculateAge(user.dateOfBirth)}
                  </h3>
                  {user.locationCity && (
                    <p className="text-sm text-gray-600">
                      {user.locationCity}, {user.locationCountry}
                    </p>
                  )}
                </div>

                {user.bio && (
                  <p className="text-sm text-gray-700 line-clamp-2">{user.bio}</p>
                )}

                {/* Shared Interests */}
                {user.breakdown.sharedHobbies && user.breakdown.sharedHobbies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {user.breakdown.sharedHobbies.slice(0, 3).map((hobby, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                      >
                        {hobby}
                      </span>
                    ))}
                    {user.breakdown.sharedHobbies.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{user.breakdown.sharedHobbies.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Liked At */}
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Liked {formatDate(user.likedAt)}
                </p>

                {/* Action Button */}
                {user.isMatch ? (
                  <button
                    onClick={() => handleSendMessage(user.id)}
                    disabled={messagingUserId === user.id}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    {messagingUserId === user.id ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-100 text-gray-600 rounded-xl text-center font-medium flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5" />
                    Waiting for their response...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State for Filtered View */}
        {filteredUsers.length === 0 && filter === 'matches' && (
          <div className="card max-w-md mx-auto text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Matches Yet</h3>
            <p className="text-gray-600 mb-4">
              Keep liking profiles to find your perfect match!
            </p>
            <button
              onClick={() => setFilter('all')}
              className="btn-secondary"
            >
              View All Likes
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default LikedProfiles
