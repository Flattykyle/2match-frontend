import { useState, useEffect } from 'react'
import { MessageCircle, ArrowLeft, Inbox, Check, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ConversationsList from '../components/ConversationsList'
import ChatInterface from '../components/ChatInterface'
import { Conversation, ChatRequest, getChatRequests, acceptChatRequest, declineChatRequest } from '../services/messageService'
import { formatDistanceToNow } from 'date-fns'

type Tab = 'inbox' | 'requests'

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('inbox')
  const [requests, setRequests] = useState<ChatRequest[]>([])
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (activeTab === 'requests') loadRequests()
  }, [activeTab])

  const loadRequests = async () => {
    try {
      setRequestsLoading(true)
      const data = await getChatRequests()
      setRequests(data)
    } catch (error) {
      console.error('Error loading chat requests:', error)
    } finally {
      setRequestsLoading(false)
    }
  }

  const handleAccept = async (conversationId: string) => {
    setProcessingId(conversationId)
    try {
      await acceptChatRequest(conversationId)
      setRequests((prev) => prev.filter((r) => r.conversationId !== conversationId))
    } catch (error) {
      console.error('Error accepting request:', error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleDecline = async (conversationId: string) => {
    setProcessingId(conversationId)
    try {
      await declineChatRequest(conversationId)
      setRequests((prev) => prev.filter((r) => r.conversationId !== conversationId))
    } catch (error) {
      console.error('Error declining request:', error)
    } finally {
      setProcessingId(null)
    }
  }

  const getProfilePicture = () => selectedConversation?.otherUser.profilePictures?.[0] || null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Chat View */}
      {selectedConversation && (
        <div className="lg:hidden fixed inset-0 z-40 bg-gray-50 flex flex-col" style={{ top: '56px', bottom: '56px' }}>
          <div className="bg-white shadow-sm flex-shrink-0">
            <div className="flex items-center px-4 py-2 border-b border-gray-100">
              <button onClick={() => setSelectedConversation(null)} className="p-1 text-primary-600 hover:bg-gray-100 rounded-full mr-2">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-bold gradient-text flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Messages
              </h1>
            </div>
            <div className="flex flex-col items-center py-3 border-b border-gray-200">
              {getProfilePicture() ? (
                <img src={getProfilePicture()!} alt="" className="w-12 h-12 rounded-full object-cover mb-1" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg mb-1">
                  {selectedConversation.otherUser.firstName.charAt(0).toUpperCase()}
                </div>
              )}
              <h2 className="font-semibold text-gray-900">
                {selectedConversation.otherUser.firstName} {selectedConversation.otherUser.lastName}
              </h2>
              <p className="text-xs text-gray-500">@{selectedConversation.otherUser.username}</p>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ChatInterface conversation={selectedConversation} isMobileFullScreen={true} />
          </div>
        </div>
      )}

      {/* Desktop & Mobile list view */}
      <div className={`pt-4 ${selectedConversation ? 'hidden lg:block' : 'block'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
              <MessageCircle className="w-8 h-8" />
              Messages
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(100vh-200px)]">
              {/* Left panel: tabs + list */}
              <div className="lg:col-span-1 border-r border-gray-200 overflow-hidden flex flex-col">
                {/* Tab switcher */}
                <div className="flex border-b border-gray-200 flex-shrink-0">
                  <button
                    onClick={() => setActiveTab('inbox')}
                    className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
                      activeTab === 'inbox'
                        ? 'text-primary-600 border-b-2 border-primary-500'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4 inline mr-1.5" />
                    Inbox
                  </button>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className={`flex-1 py-3 text-sm font-semibold text-center transition-colors relative ${
                      activeTab === 'requests'
                        ? 'text-primary-600 border-b-2 border-primary-500'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Inbox className="w-4 h-4 inline mr-1.5" />
                    Requests
                    {requests.length > 0 && activeTab !== 'requests' && (
                      <span className="ml-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full inline-flex items-center justify-center">
                        {requests.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Tab content */}
                {activeTab === 'inbox' ? (
                  <ConversationsList
                    selectedConversationId={selectedConversation?.id || null}
                    onSelectConversation={setSelectedConversation}
                  />
                ) : (
                  <div className="flex-1 overflow-y-auto">
                    {requestsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                      </div>
                    ) : requests.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <Inbox className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No pending requests</p>
                        <p className="text-sm text-gray-400 mt-1">New match messages appear here first</p>
                      </div>
                    ) : (
                      <AnimatePresence>
                        {requests.map((req) => {
                          const pic = req.from.profilePictures?.[0]
                          const isProcessing = processingId === req.conversationId

                          return (
                            <motion.div
                              key={req.conversationId}
                              initial={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="p-4 border-b border-gray-200"
                            >
                              <div className="flex items-start gap-3">
                                {pic ? (
                                  <img src={pic} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                    {req.from.firstName.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-gray-900 truncate">
                                      {req.from.firstName} {req.from.lastName}
                                    </h4>
                                    <span className="text-xs text-gray-400">
                                      {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                                    </span>
                                  </div>
                                  {req.lastMessage && (
                                    <p className="text-sm text-gray-500 truncate mt-0.5">{req.lastMessage.content}</p>
                                  )}
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      onClick={() => handleAccept(req.conversationId)}
                                      disabled={isProcessing}
                                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => handleDecline(req.conversationId)}
                                      disabled={isProcessing}
                                      className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      Decline
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </AnimatePresence>
                    )}
                  </div>
                )}
              </div>

              {/* Desktop Chat Interface */}
              <div className="hidden lg:block lg:col-span-2 h-full">
                {selectedConversation ? (
                  <ChatInterface conversation={selectedConversation} />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center p-4">
                      <MessageCircle className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a conversation</h3>
                      <p className="text-gray-500">Choose a conversation from the list to start chatting</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Messages
