import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Heart,
  MessageCircle,
  Users,
  Search,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Eye,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { getPotentialMatches } from '../services/discoveryService'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    newMatches: 0,
    messages: 0,
    profileViews: 0,
    compatibility: 0,
  })
  const [recentMatches, setRecentMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load recent potential matches for preview
      const matches = await getPotentialMatches(1, 6, 0)
      setRecentMatches(matches.users.slice(0, 6))

      // Simulate stats (in real app, these would come from API)
      setStats({
        newMatches: matches.pagination.total,
        messages: 0,
        profileViews: Math.floor(Math.random() * 100),
        compatibility: matches.users[0]?.compatibility || 0,
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, <span className="gradient-text">{user?.firstName || 'there'}!</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Here's what's happening with your dating journey
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
          {/* New Matches */}
          <div className="card group hover:shadow-xl transition-all cursor-pointer" onClick={() => navigate('/discovery')}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold gradient-text mb-1">{stats.newMatches}</div>
            <div className="text-sm text-gray-600">Potential Matches</div>
          </div>

          {/* Messages */}
          <div className="card group hover:shadow-xl transition-all cursor-pointer" onClick={() => navigate('/messages')}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">{stats.messages}</div>
            <div className="text-sm text-gray-600">Unread Messages</div>
          </div>

          {/* Profile Views */}
          <div className="card group hover:shadow-xl transition-all cursor-pointer" onClick={() => navigate('/profile')}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-1">{stats.profileViews}</div>
            <div className="text-sm text-gray-600">Profile Views</div>
          </div>

          {/* Top Compatibility */}
          <div className="card group hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">{stats.compatibility}%</div>
            <div className="text-sm text-gray-600">Top Match</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <button
            onClick={() => navigate('/discovery')}
            className="card text-left group hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Discover</h3>
                <p className="text-sm text-gray-600">Find new matches</p>
              </div>
            </div>
            <div className="flex items-center text-primary-600 font-medium group-hover:gap-2 transition-all">
              Start swiping <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => navigate('/search')}
            className="card text-left group hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Search className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Search</h3>
                <p className="text-sm text-gray-600">Advanced filters</p>
              </div>
            </div>
            <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
              Find specific matches <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => navigate('/messages')}
            className="card text-left group hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Messages</h3>
                <p className="text-sm text-gray-600">Chat with matches</p>
              </div>
            </div>
            <div className="flex items-center text-green-600 font-medium group-hover:gap-2 transition-all">
              View conversations <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Recent Matches Carousel */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Top Matches For You</h2>
            <button
              onClick={() => navigate('/discovery')}
              className="text-primary-600 font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : recentMatches.length === 0 ? (
            <div className="card text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Matches Yet</h3>
              <p className="text-gray-600 mb-4">Complete your profile to start discovering matches!</p>
              <button
                onClick={() => navigate('/profile/edit')}
                className="btn-primary"
              >
                Complete Profile
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {recentMatches.map((match) => (
                <div
                  key={match.id}
                  className="group cursor-pointer"
                  onClick={() => navigate('/discovery')}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2 shadow-lg group-hover:shadow-2xl transition-all">
                    {match.profilePictures && match.profilePictures.length > 0 ? (
                      <img
                        src={match.profilePictures[0]}
                        alt={match.firstName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                        <span className="text-4xl text-white font-bold">
                          {match.firstName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-primary-600">
                      {match.compatibility}%
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900 truncate">
                    {match.firstName}, {calculateAge(match.dateOfBirth)}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {match.locationCity || 'Location hidden'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 md:p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Pro Tip!</h3>
              <p className="text-white/90">
                Complete your profile with photos, hobbies, and talents to get 3x more matches.
                Profiles with all sections filled get the best compatibility scores!
              </p>
              <button
                onClick={() => navigate('/profile/edit')}
                className="mt-4 bg-white text-primary-600 font-semibold px-6 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
