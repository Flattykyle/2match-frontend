import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { getConversations, Conversation } from '../services/messageService'
import { useSocket } from '../context/SocketContext'
import { formatDistanceToNow } from 'date-fns'

interface ConversationsListProps {
  selectedConversationId: string | null
  onSelectConversation: (conversation: Conversation) => void
}

const ConversationsList = ({
  selectedConversationId,
  onSelectConversation,
}: ConversationsListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const { socket } = useSocket()

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (!socket) return

    // Listen for new messages to update conversations
    const handleNewMessage = () => {
      loadConversations()
    }

    const handleMessagesRead = () => {
      loadConversations()
    }

    socket.on('new_message', handleNewMessage)
    socket.on('messages_read', handleMessagesRead)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('messages_read', handleMessagesRead)
    }
  }, [socket])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const data = await getConversations()
      setConversations(data)
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProfilePicture = (user: Conversation['otherUser']) => {
    return user.profilePictures?.[0] || null
  }

  const formatTimestamp = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch {
      return ''
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500">Loading conversations...</p>
        </div>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No conversations yet</p>
          <p className="text-sm text-gray-400">
            Start matching to begin chatting!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      {conversations.map((conversation) => {
        const isSelected = conversation.id === selectedConversationId
        const profilePic = getProfilePicture(conversation.otherUser)
        const isUnread = conversation.unreadCount > 0

        return (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className={`p-4 border-b border-gray-200 cursor-pointer transition-colors hover:bg-gray-50 ${
              isSelected ? 'bg-primary-50' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              {/* Profile Picture */}
              <div className="relative flex-shrink-0">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt={`${conversation.otherUser.firstName}'s profile`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                    {conversation.otherUser.firstName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Conversation Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3
                    className={`font-semibold truncate ${
                      isUnread ? 'text-gray-900' : 'text-gray-700'
                    }`}
                  >
                    {conversation.otherUser.firstName} {conversation.otherUser.lastName}
                  </h3>
                  {conversation.lastMessage && (
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {formatTimestamp(conversation.lastMessage.sentAt)}
                    </span>
                  )}
                </div>

                {conversation.lastMessage && (
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-sm truncate ${
                        isUnread ? 'font-semibold text-gray-900' : 'text-gray-600'
                      }`}
                    >
                      {conversation.lastMessage.content}
                    </p>
                    {isUnread && (
                      <span className="ml-2 flex-shrink-0 w-6 h-6 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ConversationsList
