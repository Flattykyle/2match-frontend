import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  sendMessage: (data: SendMessageData) => void
  markAsRead: (conversationId: string) => void
  startTyping: (conversationId: string) => void
  stopTyping: (conversationId: string) => void
}

interface SendMessageData {
  conversationId: string
  receiverId: string
  content: string
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

interface SocketProviderProps {
  children: ReactNode
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  // BEFORE: const { token: accessToken, isAuthenticated } = useAuthStore()
  // AFTER: No token needed — httpOnly cookies are sent automatically with socket handshake
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    // BEFORE: if (!isAuthenticated || !accessToken) { ... }
    // AFTER: Only check isAuthenticated — no JS-accessible token
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    // Remove /api from the URL for Socket.io connection
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const socketUrl = apiUrl.replace('/api', '')

    // BEFORE: io(socketUrl, { auth: { token: accessToken }, ... })
    // AFTER: withCredentials: true — browser sends httpOnly cookies with handshake
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id)
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsConnected(false)
    })

    setSocket(newSocket)

    // Cleanup on unmount or when auth changes
    return () => {
      newSocket.disconnect()
    }
  // BEFORE: [isAuthenticated, accessToken]
  // AFTER: Only isAuthenticated — no token to watch
  }, [isAuthenticated])

  const sendMessage = (data: SendMessageData) => {
    if (socket && isConnected) {
      socket.emit('send_message', data)
    }
  }

  const markAsRead = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('mark_as_read', { conversationId })
    }
  }

  const startTyping = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('typing_start', { conversationId })
    }
  }

  const stopTyping = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', { conversationId })
    }
  }

  const value: SocketContextType = {
    socket,
    isConnected,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
