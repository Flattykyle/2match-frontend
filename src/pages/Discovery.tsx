import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle, RefreshCw, Heart, X, Filter, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { getPotentialMatches, likeUser, passUser, PotentialMatch } from '../services/discoveryService'
import { vibeTagService, VibeTag } from '../services/vibeTagService'
import MatchCard from '../components/MatchCard'

const Discovery = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [matches, setMatches] = useState<PotentialMatch[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [matchPopup, setMatchPopup] = useState<any>(null)

  // Vibe tag filter state
  const [allVibeTags, setAllVibeTags] = useState<VibeTag[]>([])
  const [selectedFilterTags, setSelectedFilterTags] = useState<Set<string>>(new Set())
  const [showVibeFilter, setShowVibeFilter] = useState(false)

  // Load vibe tags for filter
  useEffect(() => {
    vibeTagService.getAll().then((grouped) => {
      setAllVibeTags(Object.values(grouped).flat())
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    fetchMatches()
  }, [user, navigate])

  const fetchMatches = useCallback(async (vibeTagIds?: string[]) => {
    setLoading(true)
    setError(null)

    try {
      const tagFilter = vibeTagIds || Array.from(selectedFilterTags)
      const response = await getPotentialMatches(1, 20, 0, 'compatibility', undefined, false, tagFilter.length > 0 ? tagFilter : undefined)
      setMatches(response.users)
      setCurrentIndex(0)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching matches')
    } finally {
      setLoading(false)
    }
  }, [selectedFilterTags])

  const handleToggleFilterTag = (tagId: string) => {
    setSelectedFilterTags((prev) => {
      const next = new Set(prev)
      if (next.has(tagId)) {
        next.delete(tagId)
      } else {
        next.add(tagId)
      }
      // Re-fetch with new filter
      const tagIds = Array.from(next)
      fetchMatches(tagIds)
      return next
    })
  }

  const clearFilters = () => {
    setSelectedFilterTags(new Set())
    fetchMatches([])
  }

  const handleLike = async () => {
    if (animating || currentIndex >= matches.length) return

    const currentUser = matches[currentIndex]
    setAnimating(true)

    try {
      const response = await likeUser(currentUser.id)

      // Show match popup if it's a mutual match
      if (response.isMatch) {
        setMatchPopup(response.match)
        // Auto-close after 8 seconds
        setTimeout(() => setMatchPopup(null), 8000)
      }

      // Animate card out to the right
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1)
        setAnimating(false)

        // Load more matches if running low
        if (currentIndex >= matches.length - 3) {
          fetchMatches()
        }
      }, 300)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error liking user')
      setAnimating(false)
    }
  }

  const handlePass = async () => {
    if (animating || currentIndex >= matches.length) return

    const currentUser = matches[currentIndex]
    setAnimating(true)

    try {
      await passUser(currentUser.id)

      // Animate card out to the left
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1)
        setAnimating(false)

        // Load more matches if running low
        if (currentIndex >= matches.length - 3) {
          fetchMatches()
        }
      }, 300)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error passing on user')
      setAnimating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Finding your perfect matches...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="card max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => fetchMatches()} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (matches.length === 0 || currentIndex >= matches.length) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="card max-w-md text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            <span className="gradient-text">No More Matches</span>
          </h2>
          <p className="text-gray-600 mb-6">
            You've seen all potential matches! Check back later or adjust your preferences.
          </p>
          <button
            onClick={() => navigate('/profile/edit')}
            className="btn-primary mb-2"
          >
            Update Preferences
          </button>
          <button
            onClick={() => fetchMatches()}
            className="btn-secondary flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
    )
  }

  const currentUser = matches[currentIndex]
  const nextUser = currentIndex + 1 < matches.length ? matches[currentIndex + 1] : null

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">Discover</span>
          </h1>
          <p className="text-gray-600 mt-1">
            {matches.length - currentIndex} potential {matches.length - currentIndex === 1 ? 'match' : 'matches'}
          </p>
        </div>

        {/* Vibe Tag Filter */}
        <div className="mb-4">
          <button
            onClick={() => setShowVibeFilter(!showVibeFilter)}
            className="flex items-center gap-2 mx-auto px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:border-primary-400 hover:text-primary-500 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filter by Vibe
            {selectedFilterTags.size > 0 && (
              <span className="bg-primary-400 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {selectedFilterTags.size}
              </span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showVibeFilter ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showVibeFilter && allVibeTags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-3"
              >
                <div className="card p-4">
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {allVibeTags.map((tag) => {
                      const isActive = selectedFilterTags.has(tag.id)
                      return (
                        <button
                          key={tag.id}
                          onClick={() => handleToggleFilterTag(tag.id)}
                          className={[
                            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all',
                            isActive
                              ? 'bg-primary-400 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600',
                          ].join(' ')}
                        >
                          <span>{tag.emoji}</span>
                          <span>{tag.label}</span>
                        </button>
                      )
                    })}
                  </div>
                  {selectedFilterTags.size > 0 && (
                    <button
                      onClick={clearFilters}
                      className="mt-2 text-xs font-semibold text-gray-500 hover:text-primary-500 transition-colors"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card Stack */}
        <div className="relative h-[calc(100vh-280px)] min-h-[400px] max-h-[600px] mb-4">
          {/* Next Card (background) */}
          {nextUser && (
            <MatchCard
              user={nextUser}
              onLike={() => {}}
              onPass={() => {}}
              style={{
                transform: 'scale(0.95)',
                opacity: 0.5,
                zIndex: 1,
              }}
            />
          )}

          {/* Current Card */}
          <MatchCard
            user={currentUser}
            onLike={handleLike}
            onPass={handlePass}
            style={{
              zIndex: 2,
              transition: animating ? 'transform 0.3s ease-out' : 'none',
            }}
          />
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-gray-500">
          <p>Tap the heart to like, or the X to pass</p>
        </div>
      </div>

      {/* Match Popup */}
      {matchPopup && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMatchPopup(null)
          }}
        >
          <div className="card max-w-sm w-full text-center relative animate-scaleIn">
            {/* Close button */}
            <button
              onClick={() => setMatchPopup(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Heart className="w-12 h-12 text-white" fill="currentColor" />
            </div>
            <h2 className="text-3xl font-bold mb-2">
              <span className="gradient-text">It's a Match!</span>
            </h2>
            <p className="text-gray-600 mb-4">
              You and {matchPopup.user2?.firstName} liked each other!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setMatchPopup(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Keep Swiping
              </button>
              <button
                onClick={() => navigate('/messages')}
                className="flex-1 btn-primary"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Discovery
