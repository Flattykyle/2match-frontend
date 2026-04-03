import { useEffect, useState, useRef } from 'react'
import { Send, ChevronDown, Loader2, Flame } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSocket } from '../context/SocketContext'
import { useAuthStore } from '../store/authStore'
import {
  PromptExchange,
  getPromptExchanges,
  createPromptExchange,
} from '../services/slowBurnService'

const PROMPT_BANK = [
  "What's something most people don't know about you?",
  'Describe your perfect Sunday in 4 words.',
  "What's the last thing that made you laugh until you cried?",
  "If you could have dinner with anyone, living or dead, who'd it be?",
  "What's a hill you'll die on that most people disagree with?",
  'What song do you have on repeat right now?',
  "What's your love language — and do you actually believe in them?",
  "What's the most spontaneous thing you've ever done?",
  'Coffee date or sunset walk?',
  "What's a green flag you notice immediately?",
  "What's something you're quietly proud of?",
  'Early bird or night owl — and is it by choice?',
  "What's your comfort show you've rewatched too many times?",
  'If your life had a theme song, what would it be?',
  "What's one thing on your bucket list you'll actually do this year?",
  "What's the best piece of advice you've ever received?",
  'Describe your ideal Friday night.',
  "What's a talent you have that surprises people?",
  "What's the weirdest food combo you secretly love?",
  'If you could live anywhere for a year, where would you go?',
]

interface SlowBurnChatProps {
  matchId: string
  onUnlocked: () => void
}

const SlowBurnChat = ({ matchId, onUnlocked }: SlowBurnChatProps) => {
  const [exchanges, setExchanges] = useState<PromptExchange[]>([])
  const [exchangeCount, setExchangeCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const exchangesEndRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { socket } = useSocket()
  const { user } = useAuthStore()

  useEffect(() => {
    loadExchanges()
  }, [matchId])

  // Join match room for socket events
  useEffect(() => {
    if (!socket) return
    socket.emit('join-match', { matchId })
  }, [socket, matchId])

  // Socket listeners
  useEffect(() => {
    if (!socket) return

    const handleNewExchange = (data: {
      exchange: PromptExchange
      exchangeCount: number
      chatUnlocked: boolean
    }) => {
      // Only add if it's from the other user (we already added ours optimistically)
      if (data.exchange.senderId !== user?.id) {
        setExchanges((prev) => [...prev, data.exchange])
        scrollToBottom()
      }
      setExchangeCount(data.exchangeCount)
    }

    const handleUnlocked = () => {
      setShowCelebration(true)
      fireCelebration()
      setTimeout(() => {
        setShowCelebration(false)
        onUnlocked()
      }, 3500)
    }

    socket.on('slowburn:new_exchange', handleNewExchange)
    socket.on('slowburn:unlocked', handleUnlocked)

    return () => {
      socket.off('slowburn:new_exchange', handleNewExchange)
      socket.off('slowburn:unlocked', handleUnlocked)
    }
  }, [socket, user?.id, onUnlocked])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadExchanges = async () => {
    try {
      setLoading(true)
      const data = await getPromptExchanges(matchId)
      setExchanges(data.exchanges)
      setExchangeCount(data.exchangeCount)
      if (data.chatUnlocked) {
        onUnlocked()
      }
    } catch (error) {
      console.error('Error loading prompt exchanges:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => exchangesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const handleSend = async () => {
    if (!selectedQuestion || !answer.trim() || sending) return

    try {
      setSending(true)
      const result = await createPromptExchange(matchId, selectedQuestion, answer.trim())

      // Add our exchange immediately
      setExchanges((prev) => [...prev, result.exchange])
      setExchangeCount(result.exchangeCount)
      setSelectedQuestion('')
      setAnswer('')
      scrollToBottom()

      if (result.chatUnlocked) {
        setShowCelebration(true)
        fireCelebration()
        setTimeout(() => {
          setShowCelebration(false)
          onUnlocked()
        }, 3500)
      }
    } catch (error) {
      console.error('Error sending prompt exchange:', error)
    } finally {
      setSending(false)
    }
  }

  const fireCelebration = () => {
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#9FCFBF', '#2D5C4F', '#E8735A', '#FAEEDA'],
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#9FCFBF', '#2D5C4F', '#E8735A', '#FAEEDA'],
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }

  const fullExchanges = Math.floor(exchangeCount)
  const progressPercent = (exchangeCount / 3) * 100

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#9FCFBF' }} />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle, rgba(159,207,191,0.3) 0%, rgba(45,92,79,0.15) 70%, transparent 100%)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="text-center px-8 py-10 rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, #F9F6F0 0%, #E1F5EE 100%)',
                boxShadow: '0 8px 40px rgba(45,92,79,0.25), 0 0 80px rgba(159,207,191,0.4)',
              }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-5xl mb-4"
              >
                <span role="img" aria-label="chat">💬</span>
              </motion.div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#2D5C4F', fontFamily: 'Lora, Georgia, serif' }}>
                Chat Unlocked!
              </h2>
              <p className="text-base" style={{ color: '#2D5C4F' }}>
                Now you're really talking
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress tracker */}
      <div className="px-4 py-3 border-b flex-shrink-0" style={{ borderColor: '#E1F5EE', backgroundColor: '#F9F6F0' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4" style={{ color: '#E8735A' }} />
            <span className="text-sm font-semibold" style={{ color: '#2D5C4F' }}>
              Slow Burn Mode
            </span>
          </div>
          <span className="text-sm font-medium" style={{ color: '#2D5C4F' }}>
            Prompt Exchange {fullExchanges} of 3 &middot; Chat unlocks at 3
          </span>
        </div>
        <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ backgroundColor: '#E1F5EE' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: '#9FCFBF' }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressPercent, 100)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Exchanges list */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0" style={{ backgroundColor: '#F9F6F0' }}>
        {exchanges.length === 0 && (
          <div className="text-center py-12">
            <Flame className="w-12 h-12 mx-auto mb-3" style={{ color: '#9FCFBF' }} />
            <p className="font-medium" style={{ color: '#2D5C4F', fontFamily: 'Lora, Georgia, serif' }}>
              Start the conversation with a prompt
            </p>
            <p className="text-sm mt-1" style={{ color: '#6B7B75' }}>
              Answer 3 prompts each to unlock free chat
            </p>
          </div>
        )}

        {exchanges.map((exchange, index) => {
          const isOwn = exchange.senderId === user?.id

          return (
            <motion.div
              key={exchange.id}
              initial={{ opacity: 0, x: isOwn ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index < exchanges.length - 1 ? 0 : 0.1 }}
              className={`mb-4 flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[85%] sm:max-w-sm rounded-2xl px-4 py-3 shadow-sm"
                style={{
                  backgroundColor: isOwn ? '#2D5C4F' : '#F5EDD8',
                  color: isOwn ? '#F9F6F0' : '#2B2B2B',
                }}
              >
                <p className="text-xs mb-1.5" style={{ color: isOwn ? 'rgba(159,207,191,0.7)' : '#8A8578' }}>
                  {exchange.question}
                </p>
                <p
                  className="text-base leading-relaxed"
                  style={{ fontFamily: 'Lora, Georgia, serif' }}
                >
                  {exchange.answer}
                </p>
                <p className="text-xs mt-1.5 opacity-60">
                  {exchange.sender.firstName}
                </p>
              </div>
            </motion.div>
          )
        })}

        <div ref={exchangesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t p-3 sm:p-4 flex-shrink-0" style={{ borderColor: '#E1F5EE', backgroundColor: '#fff' }}>
        {/* Prompt selector dropdown */}
        <div className="relative mb-3" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-left text-sm transition-colors"
            style={{
              borderColor: selectedQuestion ? '#9FCFBF' : '#E1F5EE',
              backgroundColor: selectedQuestion ? '#E1F5EE' : '#F9F6F0',
              color: selectedQuestion ? '#2D5C4F' : '#8A8578',
            }}
          >
            <span className="truncate pr-2">
              {selectedQuestion || 'Choose a prompt...'}
            </span>
            <ChevronDown
              className={`w-4 h-4 flex-shrink-0 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
              style={{ color: '#9FCFBF' }}
            />
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 right-0 mb-1 rounded-xl border shadow-lg overflow-y-auto z-20"
                style={{
                  maxHeight: '240px',
                  backgroundColor: '#fff',
                  borderColor: '#E1F5EE',
                }}
              >
                {PROMPT_BANK.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setSelectedQuestion(prompt)
                      setShowDropdown(false)
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-opacity-100"
                    style={{ color: '#2D5C4F' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E1F5EE')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {prompt}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Answer textarea */}
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={selectedQuestion ? 'Type your answer...' : 'Select a prompt first...'}
          disabled={!selectedQuestion}
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 transition-colors disabled:opacity-50"
          style={{
            borderColor: '#E1F5EE',
            backgroundColor: '#F9F6F0',
            color: '#2B2B2B',
            fontFamily: 'Lora, Georgia, serif',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#9FCFBF'
            e.currentTarget.style.ringColor = '#9FCFBF'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#E1F5EE'
          }}
        />

        {/* Send button */}
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSend}
            disabled={!selectedQuestion || !answer.trim() || sending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#2D5C4F',
              boxShadow: !selectedQuestion || !answer.trim() || sending
                ? 'none'
                : '0 4px 14px rgba(45, 92, 79, 0.3)',
            }}
            onMouseEnter={(e) => {
              if (!sending) e.currentTarget.style.backgroundColor = '#1e3f36'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2D5C4F'
            }}
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default SlowBurnChat
