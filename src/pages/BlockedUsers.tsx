import { useState, useEffect } from 'react'
import { ShieldOff, Loader2, UserX } from 'lucide-react'
import { getBlockedUsers, unblockUser } from '../services/discoveryService'

export default function BlockedUsers() {
  const [blockedUsers, setBlockedUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [unblocking, setUnblocking] = useState<string | null>(null)

  useEffect(() => {
    loadBlockedUsers()
  }, [])

  const loadBlockedUsers = async () => {
    try {
      const data = await getBlockedUsers()
      setBlockedUsers(data.blockedUsers)
    } catch (error) {
      console.error('Error loading blocked users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnblock = async (userId: string) => {
    if (!confirm('Are you sure you want to unblock this user?')) return

    setUnblocking(userId)
    try {
      await unblockUser(userId)
      setBlockedUsers(blockedUsers.filter((user) => user.id !== userId))
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to unblock user')
    } finally {
      setUnblocking(null)
    }
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-orange-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldOff className="w-8 h-8 text-gray-700" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Blocked Users
            </h1>
          </div>
          <p className="text-gray-600">
            Manage users you've blocked. They won't be able to see your profile or contact you.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            </div>
          ) : blockedUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Blocked Users
              </h3>
              <p className="text-gray-500">
                You haven't blocked anyone yet. Blocked users will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {blockedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  {/* Profile Picture */}
                  <img
                    src={user.profilePictures?.[0] || '/default-avatar.png'}
                    alt={user.username}
                    className="w-16 h-16 rounded-full object-cover"
                  />

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Blocked on {formatDate(user.blockedAt)}
                    </p>
                  </div>

                  {/* Unblock Button */}
                  <button
                    onClick={() => handleUnblock(user.id)}
                    disabled={unblocking === user.id}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {unblocking === user.id ? 'Unblocking...' : 'Unblock'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
