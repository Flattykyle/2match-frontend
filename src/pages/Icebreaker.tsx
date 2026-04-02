import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Loader2, Lock, Sparkles } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useSocket } from '../context/SocketContext'
import {
  icebreakerService,
  IcebreakerData,
  IcebreakerQuestion,
} from '../services/icebreakerService'

/* ── Step enum ── */
type Step = 'celebration' | 'question1' | 'question2' | 'waiting' | 'unlocked'

/* ── Animation variants ── */
const pageVariants = {
  enter: { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
  exit: { opacity: 0, x: -60, transition: { duration: 0.25, ease: 'easeIn' as const } },
}

const cardSpring = {
  initial: { opacity: 0, scale: 0.92, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 20 },
  },
}

const optionVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.03, transition: { type: 'spring' as const, stiffness: 400, damping: 15 } },
  tap: { scale: 0.97 },
}

/* ── Main component ── */
const Icebreaker = () => {
  const { matchId } = useParams<{ matchId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { socket } = useSocket()

  const [data, setData] = useState<IcebreakerData | null>(null)
  const [step, setStep] = useState<Step>('celebration')
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load icebreaker data
  useEffect(() => {
    if (!matchId) return

    const load = async () => {
      try {
        setLoading(true)
        const result = await icebreakerService.getQuestions(matchId)
        setData(result)

        // If already unlocked, go straight to unlocked step
        if (result.match.icebreakerUnlocked) {
          setStep('unlocked')
          return
        }

        // If user already answered both, go to waiting
        if (result.myAnswers.length >= 2) {
          // Pre-fill selections
          const selections: Record<string, string> = {}
          result.myAnswers.forEach((a) => {
            selections[a.questionId] = a.answer
          })
          setSelectedOptions(selections)
          setStep(result.otherUserAnswered ? 'unlocked' : 'waiting')
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load icebreaker')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [matchId])

  // Join match room for Socket.IO events
  useEffect(() => {
    if (!socket || !matchId) return

    socket.emit('join-match', { matchId })

    return () => {
      // No explicit leave needed — socket handles cleanup
    }
  }, [socket, matchId])

  // Listen for chat-unlocked event
  useEffect(() => {
    if (!socket) return

    const handleChatUnlocked = (payload: { matchId: string }) => {
      if (payload.matchId === matchId) {
        setStep('unlocked')
      }
    }

    socket.on('chat-unlocked', handleChatUnlocked)
    return () => {
      socket.off('chat-unlocked', handleChatUnlocked)
    }
  }, [socket, matchId])

  // Submit answer handler
  const handleSelectOption = useCallback(
    async (question: IcebreakerQuestion, answer: string) => {
      if (!matchId || submitting) return

      setSelectedOptions((prev) => ({ ...prev, [question.id]: answer }))
      setSubmitting(true)

      try {
        const result = await icebreakerService.submitAnswer(matchId, question.id, answer)

        if (result.unlocked) {
          // Short delay for the animation feel
          setTimeout(() => setStep('unlocked'), 600)
        } else if (step === 'question1') {
          setTimeout(() => setStep('question2'), 500)
        } else if (step === 'question2') {
          setTimeout(() => {
            if (result.otherUserAnswered) {
              setStep('unlocked')
            } else {
              setStep('waiting')
            }
          }, 500)
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to submit answer')
      } finally {
        setSubmitting(false)
      }
    },
    [matchId, step, submitting]
  )

  // Navigate to chat
  const handleGoToChat = () => {
    navigate('/messages')
  }

  // Derive match users
  const currentUser = data
    ? data.match.user1.id === user?.id
      ? data.match.user1
      : data.match.user2
    : null
  const otherUser = data
    ? data.match.user1.id === user?.id
      ? data.match.user2
      : data.match.user1
    : null

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="card max-w-sm w-full text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => navigate(-1)} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!data || !currentUser || !otherUser) return null

  const questions = data.questions

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* ── Step 1: Match celebration ── */}
          {step === 'celebration' && (
            <motion.div
              key="celebration"
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="text-center"
            >
              <motion.div {...cardSpring} className="card py-10">
                {/* Avatar bubbles */}
                <div className="relative flex items-center justify-center mb-8 h-28">
                  <motion.div
                    initial={{ x: -60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring' as const, stiffness: 200, damping: 15 }}
                    className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden z-10"
                  >
                    {currentUser.profilePictures[0] ? (
                      <img
                        src={currentUser.profilePictures[0]}
                        alt="You"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-plum)] flex items-center justify-center text-white text-2xl font-bold">
                        {currentUser.firstName.charAt(0)}
                      </div>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' as const, stiffness: 300, damping: 15 }}
                    className="absolute z-20 w-10 h-10 rounded-full bg-[var(--color-primary)] shadow-primary-glow flex items-center justify-center"
                  >
                    <Heart className="w-5 h-5 text-white fill-white" />
                  </motion.div>

                  <motion.div
                    initial={{ x: 60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring' as const, stiffness: 200, damping: 15 }}
                    className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden z-10 -ml-4"
                  >
                    {otherUser.profilePictures[0] ? (
                      <img
                        src={otherUser.profilePictures[0]}
                        alt={otherUser.firstName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--color-plum)] to-[var(--color-primary)] flex items-center justify-center text-white text-2xl font-bold">
                        {otherUser.firstName.charAt(0)}
                      </div>
                    )}
                  </motion.div>
                </div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-2xl font-extrabold text-[var(--color-text)] mb-2"
                >
                  You matched with {otherUser.firstName}!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-[var(--color-text-secondary)] mb-8"
                >
                  Answer 2 quick icebreakers to unlock your chat
                </motion.p>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep('question1')}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Let's Break the Ice
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* ── Step 2: Question 1 ── */}
          {step === 'question1' && questions[0] && (
            <motion.div
              key="question1"
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <QuestionCard
                question={questions[0]}
                questionNumber={1}
                totalQuestions={2}
                selectedAnswer={selectedOptions[questions[0].id]}
                onSelect={(answer) => handleSelectOption(questions[0], answer)}
                submitting={submitting}
              />
            </motion.div>
          )}

          {/* ── Step 3: Question 2 ── */}
          {step === 'question2' && questions[1] && (
            <motion.div
              key="question2"
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <QuestionCard
                question={questions[1]}
                questionNumber={2}
                totalQuestions={2}
                selectedAnswer={selectedOptions[questions[1].id]}
                onSelect={(answer) => handleSelectOption(questions[1], answer)}
                submitting={submitting}
              />
            </motion.div>
          )}

          {/* ── Step 4: Waiting ── */}
          {step === 'waiting' && (
            <motion.div
              key="waiting"
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="text-center"
            >
              <div className="card py-12">
                <div className="w-16 h-16 rounded-full bg-[var(--color-primary-50)] flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-8 h-8 text-[var(--color-primary)]" />
                </div>

                <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">
                  You're all done!
                </h2>

                <p className="text-[var(--color-text-secondary)] mb-6">
                  Waiting for <span className="font-bold text-[var(--color-primary)]">{otherUser.firstName}</span> to answer
                </p>

                {/* Animated dots */}
                <div className="flex justify-center gap-1.5 mb-8">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 rounded-full bg-[var(--color-primary)]"
                      animate={{
                        y: [0, -10, 0],
                        opacity: [0.4, 1, 0.4],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: 'easeInOut' as const,
                      }}
                    />
                  ))}
                </div>

                <p className="text-sm text-[var(--color-text-tertiary)]">
                  We'll notify you when the chat unlocks
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Step 5: Unlocked ── */}
          {step === 'unlocked' && (
            <motion.div
              key="unlocked"
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="text-center"
            >
              <div className="card py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5, ease: 'easeOut' as const }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-plum)] flex items-center justify-center mx-auto mb-6 shadow-celebration"
                >
                  <MessageCircle className="w-10 h-10 text-white" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-extrabold text-[var(--color-text)] mb-2"
                >
                  Chat Unlocked!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-[var(--color-text-secondary)] mb-8"
                >
                  You and {otherUser.firstName} are ready to chat
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-col gap-3"
                >
                  <button
                    onClick={handleGoToChat}
                    className="btn-primary inline-flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Start Chatting
                  </button>
                  <button
                    onClick={() => navigate('/matches')}
                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] font-semibold transition-colors"
                  >
                    Back to Matches
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ── Question Card sub-component ── */
interface QuestionCardProps {
  question: IcebreakerQuestion
  questionNumber: number
  totalQuestions: number
  selectedAnswer?: string
  onSelect: (answer: string) => void
  submitting: boolean
}

function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelect,
  submitting,
}: QuestionCardProps) {
  const options = question.options as string[]

  return (
    <motion.div {...cardSpring} className="card">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-bold text-[var(--color-text-tertiary)]">
          Question {questionNumber} of {totalQuestions}
        </span>
        <span className="text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary-50)] px-2.5 py-1 rounded-full capitalize">
          {question.category}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-[var(--color-primary)] rounded-full"
          initial={{ width: `${((questionNumber - 1) / totalQuestions) * 100}%` }}
          animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
        />
      </div>

      {/* Question text */}
      <h3 className="text-xl font-bold text-[var(--color-text)] mb-6 leading-snug">
        {question.text}
      </h3>

      {/* Option buttons */}
      <div className="flex flex-col gap-3">
        {options.map((option) => {
          const isSelected = selectedAnswer === option

          return (
            <motion.button
              key={option}
              variants={optionVariants}
              initial="rest"
              whileHover={!selectedAnswer && !submitting ? 'hover' : undefined}
              whileTap={!selectedAnswer && !submitting ? 'tap' : undefined}
              onClick={() => !selectedAnswer && !submitting && onSelect(option)}
              disabled={!!selectedAnswer || submitting}
              className={[
                'w-full text-left px-4 py-3.5 rounded-2xl border-2 font-semibold transition-all duration-200',
                isSelected
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-50)] text-[var(--color-primary)]'
                  : selectedAnswer
                  ? 'border-gray-100 bg-gray-50 text-[var(--color-text-tertiary)] cursor-not-allowed'
                  : 'border-gray-200 bg-white text-[var(--color-text)] hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)]',
              ].join(' ')}
            >
              <div className="flex items-center gap-3">
                <div
                  className={[
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]'
                      : 'border-gray-300',
                  ].join(' ')}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-white"
                    />
                  )}
                </div>
                <span className="text-sm">{option}</span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

export default Icebreaker
