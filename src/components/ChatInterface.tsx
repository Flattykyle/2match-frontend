import { useEffect, useState, useRef, useCallback } from 'react'
import { Send, Smile, Loader2, Lock, Check, CheckCheck, AlertTriangle, Mic, MessageCircle, Music, MoreHorizontal, Flag, Ban } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { getMessages, Message, Conversation, MessageReaction } from '../services/messageService'
import { useSocket } from '../context/SocketContext'
import { useAuthStore } from '../store/authStore'
import { format } from 'date-fns'
import SlowBurnChat from './SlowBurnChat'
import VoicePlayer from './VoicePlayer'
import VoiceRecorder from './VoiceRecorder'
import PlaylistTab from './PlaylistTab'
import { voiceMemoService } from '../services/voiceMemoService'
import { safetyService, DateCheckin } from '../services/safetyService'
import ReportModal from './ReportModal'
import { reportService } from '../services/reportService'

/* ── Types ── */
interface MatchInfo {
  id: string
  slowBurnEnabled: boolean
  chatUnlocked: boolean
  exchangeCount: number
}

interface ChatInterfaceProps {
  conversation: Conversation
  isMobileFullScreen?: boolean
  icebreakerUnlocked?: boolean
  matchInfo?: MatchInfo | null
}

const REACTION_EMOJIS = ['❤️', '😂', '👏', '😮', '😢', '🔥']
const TYPING_TIMEOUT_MS = 3000

/* ── Component ── */
const ChatInterface = ({ conversation, isMobileFullScreen = false, icebreakerUnlocked = true, matchInfo = null }: ChatInterfaceProps) => {
  const [slowBurnLocked, setSlowBurnLocked] = useState(
    matchInfo?.slowBurnEnabled && !matchInfo?.chatUnlocked
  )
  const [activeTab, setActiveTab] = useState<'chat' | 'playlist'>('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [reactionPickerMessageId, setReactionPickerMessageId] = useState<string | null>(null)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [holdTimer, setHoldTimer] = useState<ReturnType<typeof setTimeout> | null>(null)
  const [pendingCheckin, setPendingCheckin] = useState<DateCheckin | null>(null)
  const [showCheckinButton, setShowCheckinButton] = useState(false)
  const [safeToast, setSafeToast] = useState<string | null>(null)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [blockToast, setBlockToast] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingAutoHideRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { socket, sendMessage, startTyping, stopTyping } = useSocket()
  const { user } = useAuthStore()

  // Load messages + mark as read
  useEffect(() => {
    loadMessages()
    if (socket) {
      socket.emit('message_read', { conversationId: conversation.id })
    }
  }, [conversation.id])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (message: Message) => {
      if (message.conversationId === conversation.id) {
        setMessages((prev) => [...prev, message])
        socket.emit('message_read', { conversationId: conversation.id })
        scrollToBottom()
      }
    }

    const handleUserTyping = (data: { userId: string; conversationId: string }) => {
      if (data.conversationId === conversation.id && data.userId === conversation.otherUser.id) {
        setIsTyping(true)
        scrollToBottom()
        // Auto-hide after 3 seconds of no typing event
        if (typingAutoHideRef.current) clearTimeout(typingAutoHideRef.current)
        typingAutoHideRef.current = setTimeout(() => setIsTyping(false), TYPING_TIMEOUT_MS)
      }
    }

    const handleUserStoppedTyping = (data: { userId: string; conversationId: string }) => {
      if (data.conversationId === conversation.id && data.userId === conversation.otherUser.id) {
        setIsTyping(false)
        if (typingAutoHideRef.current) clearTimeout(typingAutoHideRef.current)
      }
    }

    // Read receipt: mark all own messages in this conversation as read
    const handleReadReceipt = (data: { conversationId: string; readAt: string }) => {
      if (data.conversationId === conversation.id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId === user?.id && !m.readAt
              ? { ...m, isRead: true, readAt: data.readAt }
              : m
          )
        )
      }
    }

    // Reaction added
    const handleReactionAdded = (data: { messageId: string; reaction: MessageReaction; conversationId: string }) => {
      if (data.conversationId === conversation.id) {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== data.messageId) return m
            // Replace existing reaction from same user, or add new
            const filtered = (m.reactions || []).filter((r) => r.userId !== data.reaction.userId)
            return { ...m, reactions: [...filtered, data.reaction] }
          })
        )
      }
    }

    // Reaction removed
    const handleReactionRemoved = (data: { messageId: string; userId: string; conversationId: string }) => {
      if (data.conversationId === conversation.id) {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== data.messageId) return m
            return { ...m, reactions: (m.reactions || []).filter((r) => r.userId !== data.userId) }
          })
        )
      }
    }

    socket.on('new_message', handleNewMessage)
    socket.on('user_typing', handleUserTyping)
    socket.on('user_stopped_typing', handleUserStoppedTyping)
    socket.on('read_receipt', handleReadReceipt)
    socket.on('reaction_added', handleReactionAdded)
    socket.on('reaction_removed', handleReactionRemoved)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('user_typing', handleUserTyping)
      socket.off('user_stopped_typing', handleUserStoppedTyping)
      socket.off('read_receipt', handleReadReceipt)
      socket.off('reaction_added', handleReactionAdded)
      socket.off('reaction_removed', handleReactionRemoved)
      if (typingAutoHideRef.current) clearTimeout(typingAutoHideRef.current)
    }
  }, [socket, conversation.id, conversation.otherUser.id, user?.id])

  // Check for pending date check-in (show "Got home safe" button 4h after creation)
  useEffect(() => {
    const checkForPendingCheckin = async () => {
      try {
        const checkins = await safetyService.getDateCheckins()
        const pending = checkins.find((c) => {
          if (c.status !== 'PENDING') return false
          const created = new Date(c.createdAt).getTime()
          const fourHoursLater = created + 4 * 60 * 60 * 1000
          return Date.now() >= fourHoursLater
        })
        if (pending) {
          setPendingCheckin(pending)
          setShowCheckinButton(true)
        } else {
          setShowCheckinButton(false)
        }
      } catch {
        // silent
      }
    }
    checkForPendingCheckin()
  }, [conversation.id])

  // Listen for partner's safety confirmation
  useEffect(() => {
    if (!socket || !matchInfo) return

    const handleSafetyConfirmed = (data: { firstName: string; matchId: string }) => {
      if (data.matchId === matchInfo.id) {
        setSafeToast(`\uD83D\uDC9A ${data.firstName} is home safe`)
        setTimeout(() => setSafeToast(null), 5000)
      }
    }

    socket.on('safety:confirmed', handleSafetyConfirmed)
    return () => { socket.off('safety:confirmed', handleSafetyConfirmed) }
  }, [socket, matchInfo?.id])

  const handleGotHomeSafe = async () => {
    if (!pendingCheckin) return
    try {
      await safetyService.respondToDateCheckin(pendingCheckin.id)
      setShowCheckinButton(false)
      setPendingCheckin(null)
    } catch {
      // silent
    }
  }

  const loadMessages = async () => {
    try {
      setLoading(true)
      const data = await getMessages(conversation.id)
      setMessages(data)
      scrollToBottom()
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = newMessage.trim()
    if (!content || !socket || sending) return

    try {
      setSending(true)
      sendMessage({
        conversationId: conversation.id,
        receiverId: conversation.otherUser.id,
        content,
      })
      setNewMessage('')
      stopTyping(conversation.id)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    if (socket && e.target.value.trim()) {
      startTyping(conversation.id)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => stopTyping(conversation.id), 2000)
    } else if (socket) {
      stopTyping(conversation.id)
    }
  }

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  // Long press for reaction picker
  const handleMessagePressStart = useCallback((messageId: string) => {
    longPressTimerRef.current = setTimeout(() => {
      setReactionPickerMessageId(messageId)
    }, 500) // 500ms long press
  }, [])

  const handleMessagePressEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  const handleReact = (messageId: string, emoji: string) => {
    if (!socket) return
    socket.emit('react_message', { messageId, emoji, conversationId: conversation.id })
    setReactionPickerMessageId(null)
  }

  // ── Helpers ──
  const formatMessageTime = (date: string) => {
    try { return format(new Date(date), 'h:mm a') } catch { return '' }
  }

  const formatMessageDate = (date: string) => {
    try {
      const d = new Date(date)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      if (d.toDateString() === today.toDateString()) return 'Today'
      if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
      return format(d, 'MMM d, yyyy')
    } catch { return '' }
  }

  const shouldShowDateSeparator = (curr: Message, prev?: Message) => {
    if (!prev) return true
    return new Date(curr.sentAt).toDateString() !== new Date(prev.sentAt).toDateString()
  }

  // Check for expiry warning: any message from the other user that expires within 2 days
  const expiryWarning = messages.find((m) => {
    if (!m.expiresAt || m.senderId === user?.id) return false
    const daysLeft = (new Date(m.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return daysLeft > 0 && daysLeft <= 2
  })

  const getExpiryDaysLeft = (expiresAt: string) => {
    const hours = (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)
    if (hours <= 24) return 'less than a day'
    return `${Math.ceil(hours / 24)} days`
  }

  // Read receipt icon for own messages
  const ReadStatus = ({ message }: { message: Message }) => {
    if (message.senderId !== user?.id) return null

    if (message.readAt) {
      // Double coral tick — read
      return <CheckCheck className="w-3.5 h-3.5 text-primary-400 inline-block ml-1" />
    }
    if (message.isRead) {
      // Double gray — delivered + read (legacy)
      return <CheckCheck className="w-3.5 h-3.5 text-white/60 inline-block ml-1" />
    }
    // Single gray tick — sent
    return <Check className="w-3.5 h-3.5 text-white/50 inline-block ml-1" />
  }

  const profilePic = conversation.otherUser.profilePictures?.[0] || null

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    )
  }

  // Slow Burn: if locked, render SlowBurnChat with crossfade
  if (slowBurnLocked && matchInfo) {
    return (
      <div className="h-full flex flex-col">
        {/* Chat Header */}
        {!isMobileFullScreen && (
          <div className="bg-white border-b border-gray-200 p-4 flex items-center space-x-3 flex-shrink-0">
            {profilePic ? (
              <img src={profilePic} alt={`${conversation.otherUser.firstName}'s profile`} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                {conversation.otherUser.firstName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="font-semibold text-gray-900">
                {conversation.otherUser.firstName} {conversation.otherUser.lastName}
              </h2>
              <p className="text-sm text-gray-500">@{conversation.otherUser.username}</p>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key="slowburn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 min-h-0"
          >
            <SlowBurnChat
              matchId={matchInfo.id}
              onUnlocked={() => setSlowBurnLocked(false)}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      {!isMobileFullScreen && (
        <div className="bg-white border-b border-gray-200 p-4 flex items-center space-x-3 flex-shrink-0">
          {profilePic ? (
            <img src={profilePic} alt={`${conversation.otherUser.firstName}'s profile`} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
              {conversation.otherUser.firstName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">
              {conversation.otherUser.firstName} {conversation.otherUser.lastName}
            </h2>
            <p className="text-sm text-gray-500">@{conversation.otherUser.username}</p>
          </div>
          {/* "..." menu */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </button>
            <AnimatePresence>
              {showMoreMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30"
                >
                  <button
                    onClick={() => { setShowMoreMenu(false); setShowReportModal(true) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Flag className="w-4 h-4 text-gray-400" />
                    Report
                  </button>
                  <button
                    onClick={async () => {
                      setShowMoreMenu(false)
                      try {
                        await reportService.blockUser(conversation.otherUser.id)
                        setBlocked(true)
                        setBlockToast(true)
                        setTimeout(() => setBlockToast(false), 3000)
                      } catch {}
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Ban className="w-4 h-4" />
                    Block
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Tab switcher — Chat / Playlist */}
      {matchInfo && (
        <div className="flex border-b border-gray-200 flex-shrink-0 bg-white">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'chat'
                ? 'text-primary-forest border-b-2 border-primary-forest'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Messages
          </button>
          <button
            onClick={() => setActiveTab('playlist')}
            className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'playlist'
                ? 'text-primary-forest border-b-2 border-primary-forest'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            Playlist
          </button>
        </div>
      )}

      {/* Playlist tab */}
      {activeTab === 'playlist' && matchInfo ? (
        <div className="flex-1 min-h-0">
          <PlaylistTab matchId={matchInfo.id} />
        </div>
      ) : (
      <>
      {/* Expiry warning banner */}
      {expiryWarning?.expiresAt && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-2 text-amber-700 text-sm flex-shrink-0">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            This chat expires in <strong>{getExpiryDaysLeft(expiryWarning.expiresAt)}</strong> — say something!
          </span>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-0" onClick={() => setReactionPickerMessageId(null)}>
        {messages.map((message, index) => {
          const isOwnMessage = message.senderId === user?.id
          const showDate = shouldShowDateSeparator(message, messages[index - 1])
          const reactions = message.reactions || []

          return (
            <div key={message.id}>
              {showDate && (
                <div className="flex justify-center my-4">
                  <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatMessageDate(message.sentAt)}
                  </span>
                </div>
              )}

              <div className={`flex mb-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className="relative">
                  {/* Message bubble — long press for reactions */}
                  <div
                    onMouseDown={() => handleMessagePressStart(message.id)}
                    onMouseUp={handleMessagePressEnd}
                    onMouseLeave={handleMessagePressEnd}
                    onTouchStart={() => handleMessagePressStart(message.id)}
                    onTouchEnd={handleMessagePressEnd}
                    className={`max-w-[85%] sm:max-w-xs lg:max-w-md xl:max-w-lg ${
                      isOwnMessage
                        ? message.type === 'VOICE' ? 'bg-primary-forest/10' : 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                        : 'bg-white text-gray-900'
                    } rounded-2xl px-3 sm:px-4 py-2 shadow-sm select-none`}
                  >
                    {message.type === 'VOICE' && message.audioUrl ? (
                      <div className="min-w-[200px] sm:min-w-[260px]">
                        <VoicePlayer
                          audioUrl={message.audioUrl}
                          duration={message.audioDuration || 0}
                          senderName={message.sender?.firstName}
                          compact
                        />
                      </div>
                    ) : (
                      <p className="break-words">{message.content}</p>
                    )}
                    <p className={`text-xs mt-1 flex items-center ${isOwnMessage && message.type !== 'VOICE' ? 'text-white/70' : 'text-gray-500'}`}>
                      {formatMessageTime(message.sentAt)}
                      <ReadStatus message={message} />
                    </p>
                  </div>

                  {/* Reactions display */}
                  {reactions.length > 0 && (
                    <div className={`flex gap-0.5 mt-0.5 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      {reactions.map((r) => (
                        <span
                          key={r.id}
                          className="text-sm bg-white rounded-full px-1.5 py-0.5 shadow-sm border border-gray-100 cursor-pointer hover:scale-110 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (r.userId === user?.id && socket) {
                              socket.emit('remove_reaction', { messageId: message.id, conversationId: conversation.id })
                            }
                          }}
                        >
                          {r.emoji}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Reaction picker */}
                  <AnimatePresence>
                    {reactionPickerMessageId === message.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute ${isOwnMessage ? 'right-0' : 'left-0'} -top-12 z-20 bg-white rounded-full shadow-lg border border-gray-100 px-2 py-1 flex gap-1`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {REACTION_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleReact(message.id, emoji)}
                            className="text-xl hover:scale-125 transition-transform px-0.5"
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )
        })}

        {/* Typing indicator — animated 3-dot bubble */}
        {isTyping && (
          <div className="flex justify-start mb-3">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Safety toast — partner got home safe */}
      <AnimatePresence>
        {safeToast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center py-2 text-sm font-semibold flex-shrink-0"
            style={{ backgroundColor: '#E1F5EE', color: '#2D5C4F' }}
          >
            {safeToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* "Got home safe" button — appears 4h after date check-in */}
      {showCheckinButton && (
        <div className="px-4 py-2 flex-shrink-0" style={{ backgroundColor: '#E1F5EE' }}>
          <button
            onClick={handleGotHomeSafe}
            className="w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-all active:scale-[0.98]"
            style={{ backgroundColor: '#2D5C4F' }}
          >
            Got home safe \uD83D\uDC9A
          </button>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-2 sm:p-4 relative flex-shrink-0">
        {!icebreakerUnlocked ? (
          <div className="flex items-center justify-center gap-2 py-2 text-gray-400">
            <Lock className="w-5 h-5" />
            <span className="text-sm font-medium">Complete the icebreaker to unlock chat</span>
          </div>
        ) : (
          <>
            {showEmojiPicker && (
              <div className="absolute bottom-16 left-2 right-2 sm:left-auto sm:right-4 z-10 max-w-full overflow-hidden">
                <EmojiPicker onEmojiClick={handleEmojiClick} width="100%" />
              </div>
            )}

            {/* Voice recorder panel */}
            <AnimatePresence>
              {showVoiceRecorder && matchInfo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden mb-2"
                >
                  <VoiceRecorder
                    maxDuration={60}
                    label="Hold to record, release to stop"
                    onConfirm={async (blob, onProgress) => {
                      await voiceMemoService.sendVoiceMessage(matchInfo.id, blob, onProgress)
                      setShowVoiceRecorder(false)
                    }}
                    onCancel={() => setShowVoiceRecorder(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Smile className="w-6 h-6" />
              </button>

              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={sending}
              />

              {/* Hold-to-record mic button */}
              {matchInfo && !newMessage.trim() && (
                <button
                  type="button"
                  onMouseDown={() => {
                    const timer = setTimeout(() => {
                      setShowVoiceRecorder(true)
                    }, 300)
                    setHoldTimer(timer)
                  }}
                  onMouseUp={() => {
                    if (holdTimer) {
                      clearTimeout(holdTimer)
                      setHoldTimer(null)
                    }
                  }}
                  onMouseLeave={() => {
                    if (holdTimer) {
                      clearTimeout(holdTimer)
                      setHoldTimer(null)
                    }
                  }}
                  onTouchStart={() => {
                    const timer = setTimeout(() => {
                      setShowVoiceRecorder(true)
                    }, 300)
                    setHoldTimer(timer)
                  }}
                  onTouchEnd={() => {
                    if (holdTimer) {
                      clearTimeout(holdTimer)
                      setHoldTimer(null)
                    }
                  }}
                  className="p-2 rounded-full transition-colors"
                  style={{ color: '#2D5C4F' }}
                  title="Hold to record voice message"
                >
                  <Mic className="w-6 h-6" />
                </button>
              )}

              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
              </button>
            </form>
          </>
        )}
      </div>
      </>
      )}

      {/* Block toast */}
      <AnimatePresence>
        {blockToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full shadow-lg text-sm font-semibold"
            style={{ backgroundColor: '#2D5C4F', color: '#fff' }}
          >
            Done. You're safe.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        userId={conversation.otherUser.id}
        firstName={conversation.otherUser.firstName}
        onBlocked={() => {
          setBlocked(true)
          setBlockToast(true)
          setTimeout(() => setBlockToast(false), 3000)
        }}
      />
    </div>
  )
}

export default ChatInterface
