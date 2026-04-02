import api from './api'

export interface MessageReaction {
  id: string
  userId: string
  emoji: string
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  conversationId: string
  content: string
  sentAt: string
  isRead: boolean
  readAt: string | null
  expiresAt: string | null
  reactions: MessageReaction[]
  sender: {
    id: string
    firstName: string
    lastName: string
    profilePictures: string[]
  }
}

export interface ConversationUser {
  id: string
  username: string
  firstName: string
  lastName: string
  profilePictures: string[]
}

export interface Conversation {
  id: string
  user1Id: string
  user2Id: string
  requestStatus: string
  createdAt: string
  lastMessageAt: string
  user1: ConversationUser
  user2: ConversationUser
  otherUser: ConversationUser
  lastMessage: {
    id: string
    content: string
    sentAt: string
    isRead: boolean
    senderId: string
  } | null
  unreadCount: number
}

export interface ChatRequest {
  conversationId: string
  from: ConversationUser
  lastMessage: {
    id: string
    content: string
    sentAt: string
    senderId: string
  } | null
  createdAt: string
}

export interface SendMessageData {
  content: string
}

// Get all conversations for the current user
export const getConversations = async (): Promise<Conversation[]> => {
  const response = await api.get('/messages/conversations')
  return response.data
}

// Get or create a conversation with another user
export const getOrCreateConversation = async (userId: string): Promise<Conversation> => {
  const response = await api.get(`/messages/conversations/${userId}`)
  return response.data
}

// Get messages for a conversation
export const getMessages = async (
  conversationId: string,
  limit: number = 50,
  before?: string
): Promise<Message[]> => {
  const params = new URLSearchParams({ limit: limit.toString() })
  if (before) {
    params.append('before', before)
  }
  const response = await api.get(`/messages/conversations/${conversationId}/messages?${params}`)
  return response.data
}

// Send a message (REST fallback - prefer Socket.io)
export const sendMessage = async (
  conversationId: string,
  data: SendMessageData
): Promise<Message> => {
  const response = await api.post(`/messages/conversations/${conversationId}/messages`, data)
  return response.data
}

// Mark messages in a conversation as read
export const markAsRead = async (conversationId: string): Promise<void> => {
  await api.put(`/messages/conversations/${conversationId}/read`)
}

// Get unread message count
export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get('/messages/unread-count')
  return response.data.unreadCount
}

// ── Chat Request APIs ──

export const getChatRequests = async (): Promise<ChatRequest[]> => {
  const response = await api.get<{ requests: ChatRequest[] }>('/messages/requests')
  return response.data.requests
}

export const acceptChatRequest = async (conversationId: string): Promise<void> => {
  await api.post(`/messages/requests/${conversationId}/accept`)
}

export const declineChatRequest = async (conversationId: string): Promise<void> => {
  await api.post(`/messages/requests/${conversationId}/decline`)
}
