import { useState, useEffect } from 'react'
import { Eye, Users, TrendingUp, Loader2, Heart } from 'lucide-react'
import { profileViewService } from '../services/profileViewService'
import { useNavigate } from 'react-router-dom'
import OnlineStatus from '../components/OnlineStatus'
import VerifiedBadge from '../components/VerifiedBadge'

export default function ProfileViews() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'viewers' | 'viewed'>('viewers')
  const [viewers, setViewers] = useState<any[]>([])
  const [viewedProfiles, setViewedProfiles] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsData] = await Promise.all([
        profileViewService.getProfileViewStats(),
        activeTab === 'viewers'
          ? loadViewers()
          : loadViewedProfiles(),
      ])
      setStats(statsData)
    } catch (error) {
      console.error('Error loading profile views:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadViewers = async () => {
    try {
      const data = await profileViewService.getProfileViewers()
      setViewers(data.viewers)
    } catch (error) {
      console.error('Error loading viewers:', error)
    }
  }

  const loadViewedProfiles = async () => {
    try {
      const data = await profileViewService.getViewedProfiles()
      setViewedProfiles(data.profiles)
    } catch (error) {
      console.error('Error loading viewed profiles:', error)
    }
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return d.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-orange-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Profile Views
          </h1>
          <p className="text-gray-600">
            See who's interested in your profile and who you've checked out
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-rose-500" />
                <span className="text-sm text-gray-600">Total Views</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.totalViews}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-gray-600">Unique Viewers</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.uniqueViewers}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-gray-600">Last 7 Days</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.recentViews}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-pink-500" />
                <span className="text-sm text-gray-600">Mutual Views</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.mutualViews}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('viewers')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'viewers'
                  ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Who Viewed Me
            </button>
            <button
              onClick={() => setActiveTab('viewed')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'viewed'
                  ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              I Viewed
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
              </div>
            ) : activeTab === 'viewers' ? (
              viewers.length === 0 ? (
                <div className="text-center py-12">
                  <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No one has viewed your profile yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {viewers.map((viewer) => (
                    <div
                      key={viewer.id}
                      onClick={() => navigate(`/profile/${viewer.id}`)}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
                    >
                      {/* Profile Picture */}
                      <div className="relative">
                        <img
                          src={viewer.profilePictures?.[0] || '/default-avatar.png'}
                          alt={viewer.username}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1">
                          <OnlineStatus
                            isOnline={viewer.isOnline}
                            lastActive={viewer.lastActive}
                            size="md"
                          />
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800 truncate">
                            {viewer.firstName} {viewer.lastName}
                          </h3>
                          <VerifiedBadge
                            emailVerified={viewer.emailVerified}
                            phoneVerified={viewer.phoneVerified}
                            photoVerified={viewer.photoVerified}
                            size="sm"
                          />
                          {viewer.isMutual && (
                            <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full font-medium">
                              Mutual
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">@{viewer.username}</p>
                        {viewer.bio && (
                          <p className="text-sm text-gray-600 truncate mt-1">{viewer.bio}</p>
                        )}
                      </div>

                      {/* View Time */}
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{formatDate(viewer.viewedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              viewedProfiles.length === 0 ? (
                <div className="text-center py-12">
                  <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">You haven't viewed any profiles yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {viewedProfiles.map((profile) => (
                    <div
                      key={profile.id}
                      onClick={() => navigate(`/profile/${profile.id}`)}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
                    >
                      {/* Profile Picture */}
                      <div className="relative">
                        <img
                          src={profile.profilePictures?.[0] || '/default-avatar.png'}
                          alt={profile.username}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1">
                          <OnlineStatus
                            isOnline={profile.isOnline}
                            lastActive={profile.lastActive}
                            size="md"
                          />
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800 truncate">
                            {profile.firstName} {profile.lastName}
                          </h3>
                          <VerifiedBadge
                            emailVerified={profile.emailVerified}
                            phoneVerified={profile.phoneVerified}
                            photoVerified={profile.photoVerified}
                            size="sm"
                          />
                        </div>
                        <p className="text-sm text-gray-500 truncate">@{profile.username}</p>
                        {profile.bio && (
                          <p className="text-sm text-gray-600 truncate mt-1">{profile.bio}</p>
                        )}
                      </div>

                      {/* View Time */}
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{formatDate(profile.viewedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
