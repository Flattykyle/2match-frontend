import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Loader2 } from 'lucide-react'
import { useSocket } from '../../context/SocketContext'
import { useIcebreakerGameStore, GameType } from '../../store/icebreakerGameStore'
import { icebreakerGameService } from '../../services/icebreakerGameService'

/* ================================================================
   Question Banks
   ================================================================ */

const HOT_TAKE_QUESTIONS = [
  'Pineapple belongs on pizza',
  'Morning people are more productive than night owls',
  'It\'s okay to text your ex happy birthday',
  'Dogs are better than cats',
  'The toilet seat should always be left down',
  'Long-distance relationships can work',
  'Breakfast for dinner is elite',
  'You should always split the bill on a first date',
  'Social media has done more harm than good',
  'It\'s acceptable to ghost someone after one date',
  'Socks with sandals is a vibe',
  'You should never go back to an ex',
  'Reality TV is genuinely entertaining',
  'The book is always better than the movie',
  'Working from home beats working in an office',
  'Astrology actually has some truth to it',
  'Double texting is totally fine',
  'A hot shower is better than a cold shower',
  'Money can buy happiness',
  'Being brutally honest is always the right move',
  'It\'s weird to go to the movies alone',
  'Your partner should also be your best friend',
  'Cereal is technically a soup',
  'Travel is the best way to spend money',
  'You can tell a lot about someone by their music taste',
  'Naps are underrated',
  'PDA in public is cute, not cringe',
  'Having a "type" is limiting',
  'Everyone should live alone at least once',
  'The talking stage is the worst part of dating',
]

const WYR_QUESTIONS = [
  { optionA: 'Always be 10 minutes early', optionB: 'Always be 10 minutes late' },
  { optionA: 'Never use social media again', optionB: 'Never watch TV/movies again' },
  { optionA: 'Have a rewind button for your life', optionB: 'Have a pause button for your life' },
  { optionA: 'Know how you die', optionB: 'Know when you die' },
  { optionA: 'Spend a year traveling the world', optionB: 'Spend a year with unlimited money at home' },
  { optionA: 'Always say what you\'re thinking', optionB: 'Never speak again' },
  { optionA: 'Live without music', optionB: 'Live without movies' },
  { optionA: 'Be famous but hated', optionB: 'Be unknown but loved' },
  { optionA: 'Have the ability to fly', optionB: 'Have the ability to read minds' },
  { optionA: 'Only eat sweet food', optionB: 'Only eat savory food' },
  { optionA: 'Date someone messy but funny', optionB: 'Date someone tidy but boring' },
  { optionA: 'Live in the mountains', optionB: 'Live by the ocean' },
  { optionA: 'Be able to teleport', optionB: 'Be able to time travel' },
  { optionA: 'Have free coffee forever', optionB: 'Have free Wi-Fi forever' },
  { optionA: 'Never have to clean again', optionB: 'Never have to cook again' },
  { optionA: 'Always be overdressed', optionB: 'Always be underdressed' },
  { optionA: 'Give up your phone', optionB: 'Give up your pet' },
  { optionA: 'Have one close friend', optionB: 'Have ten casual friends' },
  { optionA: 'Live in the past', optionB: 'Live in the future' },
  { optionA: 'Win $1M today', optionB: 'Win $10M in 10 years' },
]

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/* ================================================================
   Animation variants
   ================================================================ */

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const modalVariants = {
  hidden: { y: '100%', opacity: 0.5 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 28 },
  },
  exit: { y: '100%', opacity: 0, transition: { duration: 0.3, ease: 'easeIn' as const } },
}

const flipVariants = {
  front: { rotateY: 0 },
  back: { rotateY: 180 },
}

/* ================================================================
   Main Modal
   ================================================================ */

export default function IceBreakerModal() {
  const { session, isModalOpen, closeGame, updatePhase, setPartnerReady, setPartnerSubmission, setResult } =
    useIcebreakerGameStore()
  const { socket } = useSocket()

  /* ── Socket listeners ── */
  useEffect(() => {
    if (!socket || !session) return

    const handlePartnerSubmitted = (payload: { sessionId: string }) => {
      if (payload.sessionId === session.id) {
        setPartnerReady()
        // If we're waiting, advance to guessing (TWO_TRUTHS) or reveal
        if (session.phase === 'waiting' && session.gameType === 'TWO_TRUTHS') {
          updatePhase('guessing')
        }
      }
    }

    const handleCompleted = (payload: {
      sessionId: string
      gameType: GameType
      result: any
      partnerStatements?: string[]
    }) => {
      if (payload.sessionId !== session.id) return

      if (payload.partnerStatements) {
        setPartnerSubmission(payload.partnerStatements)
      }

      setResult(payload.result)
    }

    socket.on('icebreaker:partner_submitted', handlePartnerSubmitted)
    socket.on('icebreaker:completed', handleCompleted)

    return () => {
      socket.off('icebreaker:partner_submitted', handlePartnerSubmitted)
      socket.off('icebreaker:completed', handleCompleted)
    }
  }, [socket, session?.id, session?.phase, session?.gameType])

  if (!isModalOpen || !session) return null

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        key="ib-overlay"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 bg-black/50 z-[var(--z-modal-backdrop)]"
      />

      {/* Modal */}
      <motion.div
        key="ib-modal"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={[
          'fixed inset-0 z-[var(--z-modal)]',
          'bg-[var(--color-surface)] overflow-y-auto',
          'flex flex-col',
        ].join(' ')}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            {session.gameType === 'TWO_TRUTHS' && '🤥 Two Truths & a Lie'}
            {session.gameType === 'HOT_TAKES' && '🔥 Hot Takes'}
            {session.gameType === 'WOULD_YOU_RATHER' && '⚡ Would You Rather'}
          </h2>
          <button
            onClick={closeGame}
            className="p-2 rounded-full hover:bg-[var(--color-surface-sunken)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
          </button>
        </div>

        {/* Game content */}
        <div className="flex-1 flex items-center justify-center px-4 pb-8">
          <div className="w-full max-w-md">
            {session.gameType === 'TWO_TRUTHS' && <TwoTruthsGame />}
            {session.gameType === 'HOT_TAKES' && <HotTakesGame />}
            {session.gameType === 'WOULD_YOU_RATHER' && <WouldYouRatherGame />}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ================================================================
   TWO TRUTHS & A LIE
   ================================================================ */

function TwoTruthsGame() {
  const { session, updatePhase, setMySubmission, setResult, closeGame } =
    useIcebreakerGameStore()

  const [statements, setStatements] = useState(['', '', ''])
  const [lieIndex, setLieIndex] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [guessIndex, setGuessIndex] = useState<number | null>(null)
  const [revealedLie, setRevealedLie] = useState<number | null>(null)
  const [guessCorrect, setGuessCorrect] = useState<boolean | null>(null)

  if (!session) return null

  const handleSubmitStatements = async () => {
    if (statements.some((s) => !s.trim()) || lieIndex === null || !session) return
    setSubmitting(true)
    try {
      const res = await icebreakerGameService.submitStatements(session.id, statements, lieIndex)
      setMySubmission(statements)
      if (res.partnerReady) {
        updatePhase('guessing')
      } else {
        updatePhase('waiting')
      }
    } catch (err) {
      console.error('Failed to submit statements:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleGuess = async (index: number) => {
    if (!session || guessIndex !== null) return
    setGuessIndex(index)
    try {
      const res = await icebreakerGameService.submitGuess(session.id, index)
      setRevealedLie(res.lieIndex)
      setGuessCorrect(res.correct)
      // Show reveal for a moment, then complete
      setTimeout(() => {
        setResult({
          lieIndex: res.lieIndex,
          guessCorrect: res.correct,
        })
      }, 2500)
    } catch (err) {
      console.error('Failed to submit guess:', err)
      setGuessIndex(null)
    }
  }

  /* Phase: submitting */
  if (session.phase === 'submitting') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        <div className="text-center mb-6">
          <p className="text-[var(--color-text-secondary)] text-sm">
            Write 3 statements about yourself. One is a lie!
          </p>
        </div>

        {[0, 1, 2].map((i) => (
          <div key={i} className="relative">
            <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-1.5">
              Statement {i + 1}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={statements[i]}
                onChange={(e) => {
                  const next = [...statements]
                  next[i] = e.target.value
                  setStatements(next)
                }}
                placeholder={
                  i === 0
                    ? "I've been skydiving twice"
                    : i === 1
                    ? "I can speak 3 languages"
                    : "I once met a celebrity"
                }
                className={[
                  'flex-1 px-4 py-3 rounded-xl border-2 text-sm',
                  'bg-white dark:bg-[var(--color-surface-sunken)]',
                  'text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)]',
                  'focus:outline-none focus:ring-2 focus:ring-primary-forest/30',
                  lieIndex === i
                    ? 'border-accent-terracotta'
                    : 'border-primary-sage/30 focus:border-primary-forest',
                  'transition-colors duration-200',
                ].join(' ')}
              />
              <button
                onClick={() => setLieIndex(lieIndex === i ? null : i)}
                title="Mark as the lie"
                className={[
                  'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg self-end',
                  'transition-all duration-200',
                  lieIndex === i
                    ? 'bg-accent-terracotta text-white shadow-md'
                    : 'bg-[var(--color-surface-sunken)] text-[var(--color-text-tertiary)] hover:bg-accent-warm',
                ].join(' ')}
              >
                {lieIndex === i ? '😈' : '🤫'}
              </button>
            </div>
          </div>
        ))}

        {lieIndex === null && (
          <p className="text-xs text-[var(--color-text-tertiary)] text-center">
            Tap 🤫 next to the statement that's your lie
          </p>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmitStatements}
          disabled={statements.some((s) => !s.trim()) || lieIndex === null || submitting}
          className={[
            'w-full py-3.5 rounded-2xl font-bold text-base',
            'bg-primary-forest text-white shadow-forest-glow',
            'hover:bg-primary-forest/90',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
            'transition-all duration-200',
            'flex items-center justify-center gap-2',
          ].join(' ')}
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit
            </>
          )}
        </motion.button>
      </motion.div>
    )
  }

  /* Phase: waiting */
  if (session.phase === 'waiting') {
    return <WaitingScreen name={session.partnerName} />
  }

  /* Phase: guessing */
  if (session.phase === 'guessing') {
    const partnerStatements = session.partnerSubmission || ['...', '...', '...']

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-[var(--color-text)] mb-1">
            {session.partnerName}'s statements
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Tap the one you think is the lie!
          </p>
        </div>

        {partnerStatements.map((stmt, i) => {
          const isRevealed = revealedLie !== null
          const isLie = revealedLie === i
          const wasGuessed = guessIndex === i

          return (
            <motion.button
              key={i}
              whileTap={!isRevealed ? { scale: 0.97 } : undefined}
              onClick={() => handleGuess(i)}
              disabled={guessIndex !== null}
              className={[
                'w-full text-left p-4 rounded-2xl border-2 font-medium transition-all duration-500',
                isRevealed && isLie
                  ? 'border-accent-terracotta bg-accent-terracotta/10 text-accent-terracotta'
                  : isRevealed && !isLie
                  ? 'border-success bg-success-light text-success'
                  : wasGuessed
                  ? 'border-primary-forest bg-primary-light'
                  : 'border-primary-sage/30 bg-white dark:bg-[var(--color-surface-sunken)] text-[var(--color-text)] hover:border-primary-sage',
                'disabled:cursor-default',
              ].join(' ')}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{stmt}</span>
                {isRevealed && isLie && <span className="text-xl ml-2">😈</span>}
                {isRevealed && !isLie && <span className="text-xl ml-2">✅</span>}
              </div>
            </motion.button>
          )
        })}

        {guessCorrect !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center pt-4"
          >
            <p className="text-2xl font-bold">
              {guessCorrect ? '🎉 You got it!' : '😅 Nope, they fooled you!'}
            </p>
          </motion.div>
        )}
      </motion.div>
    )
  }

  /* Phase: complete */
  if (session.phase === 'complete' && session.result) {
    return (
      <GameCompleteCard onClose={closeGame}>
        <p className="text-3xl mb-2">
          {session.result.guessCorrect ? '🎯' : '🤭'}
        </p>
        <h3 className="text-xl font-bold text-[var(--color-text)] mb-1">
          {session.result.guessCorrect
            ? 'You spotted the lie!'
            : `${session.partnerName} fooled you!`}
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)]">
          This game has been saved to your chat
        </p>
      </GameCompleteCard>
    )
  }

  return null
}

/* ================================================================
   HOT TAKES
   ================================================================ */

function HotTakesGame() {
  const { session, updatePhase, setResult, closeGame } = useIcebreakerGameStore()
  const [question] = useState(() => pickRandom(HOT_TAKE_QUESTIONS, 1)[0])
  const [myAnswer, setMyAnswer] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [flipped, setFlipped] = useState(false)

  if (!session) return null

  const handleAnswer = async (answer: string) => {
    if (submitting || myAnswer) return
    setMyAnswer(answer)
    setSubmitting(true)
    try {
      const res = await icebreakerGameService.submitHotTake(session.id, answer)
      if (res.partnerReady && res.result) {
        // Both submitted — reveal
        setTimeout(() => {
          setFlipped(true)
          setTimeout(() => {
            setResult({
              myAnswer: answer,
              partnerAnswer: res.result!.partnerAnswer,
              agreed: res.result!.agreed,
              question,
            })
          }, 1200)
        }, 500)
      } else {
        updatePhase('waiting')
      }
    } catch (err) {
      console.error('Failed to submit hot take:', err)
      setMyAnswer(null)
    } finally {
      setSubmitting(false)
    }
  }

  /* Phase: submitting */
  if (session.phase === 'submitting') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8">
        <div className="bg-white dark:bg-[var(--color-surface-sunken)] rounded-2xl p-6 shadow-card">
          <p className="text-xs font-semibold text-accent-terracotta uppercase tracking-wider mb-3">
            Hot Take
          </p>
          <p className="text-xl font-bold text-[var(--color-text)] leading-snug">
            "{question}"
          </p>
        </div>

        <div className="flex gap-3">
          {[
            { label: 'Agree 🙌', value: 'agree' },
            { label: 'Disagree 💀', value: 'disagree' },
          ].map((opt) => (
            <motion.button
              key={opt.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAnswer(opt.value)}
              disabled={!!myAnswer}
              className={[
                'flex-1 py-4 rounded-2xl text-lg font-bold',
                'transition-all duration-200',
                myAnswer === opt.value
                  ? 'bg-primary-forest text-white shadow-forest-glow scale-[1.02]'
                  : myAnswer
                  ? 'bg-[var(--color-surface-sunken)] text-[var(--color-text-tertiary)] opacity-50'
                  : opt.value === 'agree'
                  ? 'bg-success-light text-success hover:bg-success hover:text-white'
                  : 'bg-danger-light text-danger hover:bg-danger hover:text-white',
                'disabled:cursor-default',
              ].join(' ')}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    )
  }

  /* Phase: waiting — with flip animation prep */
  if (session.phase === 'waiting') {
    if (flipped) {
      return (
        <motion.div className="text-center space-y-6">
          <p className="text-xl font-bold text-[var(--color-text)]">Revealing...</p>
          <div className="flex gap-4 justify-center">
            {['You', session.partnerName].map((name, i) => (
              <motion.div
                key={name}
                initial="front"
                animate="back"
                variants={flipVariants}
                transition={{ duration: 0.6, delay: i * 0.3 }}
                style={{ perspective: 600, transformStyle: 'preserve-3d' }}
                className="w-32 h-40 rounded-2xl bg-primary-forest text-white flex flex-col items-center justify-center shadow-lg"
              >
                <span className="text-3xl mb-1">
                  {i === 0 ? (myAnswer === 'agree' ? '🙌' : '💀') : '?'}
                </span>
                <span className="text-sm font-semibold">{name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )
    }

    return <WaitingScreen name={session.partnerName} />
  }

  /* Phase: complete */
  if (session.phase === 'complete' && session.result) {
    return (
      <GameCompleteCard onClose={closeGame}>
        <p className="text-3xl mb-2">
          {session.result.agreed ? '🙌' : '💀'}
        </p>
        <h3 className="text-xl font-bold text-[var(--color-text)] mb-1">
          {session.result.agreed ? 'You agreed!' : 'Opposites attract!'}
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] mt-2">
          "{question}"
        </p>
        <div className="flex justify-center gap-6 mt-4">
          <div className="text-center">
            <p className="text-2xl">{session.result.myAnswer === 'agree' ? '🙌' : '💀'}</p>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">You</p>
          </div>
          <div className="text-center">
            <p className="text-2xl">{session.result.partnerAnswer === 'agree' ? '🙌' : '💀'}</p>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{session.partnerName}</p>
          </div>
        </div>
      </GameCompleteCard>
    )
  }

  return null
}

/* ================================================================
   WOULD YOU RATHER
   ================================================================ */

function WouldYouRatherGame() {
  const { session, updatePhase, setResult, closeGame } = useIcebreakerGameStore()
  const [questions] = useState(() => pickRandom(WYR_QUESTIONS, 5))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [choices, setChoices] = useState<string[]>([])
  const [, setSubmitting] = useState(false)

  if (!session) return null

  const handleChoice = async (choice: string) => {
    const newChoices = [...choices, choice]
    setChoices(newChoices)

    if (newChoices.length < 5) {
      // Auto-advance
      setTimeout(() => setCurrentIndex((i) => i + 1), 400)
      return
    }

    // All 5 done — submit
    setSubmitting(true)
    try {
      const res = await icebreakerGameService.submitWYRChoices(session.id, newChoices)
      if (res.partnerReady && res.result) {
        setResult({
          myChoices: newChoices,
          partnerChoices: res.result.partnerChoices,
          matchCount: res.result.matchCount,
          totalQuestions: res.result.totalQuestions,
          questions: res.result.questions,
        })
      } else {
        updatePhase('waiting')
      }
    } catch (err) {
      console.error('Failed to submit WYR choices:', err)
    } finally {
      setSubmitting(false)
    }
  }

  /* Phase: submitting */
  if (session.phase === 'submitting' && currentIndex < 5) {
    const q = questions[currentIndex]

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={[
                'flex-1 h-1.5 rounded-full transition-colors duration-300',
                i < currentIndex
                  ? 'bg-primary-forest'
                  : i === currentIndex
                  ? 'bg-primary-sage'
                  : 'bg-[var(--color-surface-sunken)]',
              ].join(' ')}
            />
          ))}
        </div>

        <p className="text-center text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
          {currentIndex + 1} of 5
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <p className="text-center text-lg font-bold text-[var(--color-text)] mb-6">
              Would you rather...
            </p>

            {['A', 'B'].map((side) => {
              const text = side === 'A' ? q.optionA : q.optionB
              return (
                <motion.button
                  key={side}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleChoice(side)}
                  className={[
                    'w-full p-5 rounded-2xl text-left font-semibold text-base',
                    'border-2 transition-all duration-200',
                    side === 'A'
                      ? 'border-primary-sage/40 bg-primary-light/50 hover:border-primary-forest hover:bg-primary-light text-[var(--color-text)]'
                      : 'border-accent-terracotta/30 bg-accent-warm/50 hover:border-accent-terracotta hover:bg-accent-warm text-[var(--color-text)]',
                  ].join(' ')}
                >
                  <span className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase block mb-1">
                    Option {side}
                  </span>
                  {text}
                </motion.button>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    )
  }

  /* Phase: waiting */
  if (session.phase === 'waiting' || (session.phase === 'submitting' && currentIndex >= 5)) {
    return <WaitingScreen name={session.partnerName} />
  }

  /* Phase: complete */
  if (session.phase === 'complete' && session.result) {
    const { matchCount = 0, totalQuestions = 5, myChoices = [], partnerChoices = [] } = session.result

    const resultMessage =
      matchCount >= 4
        ? "you're basically the same person 👀"
        : matchCount >= 3
        ? 'great minds think alike 🧠'
        : matchCount >= 2
        ? 'some overlap, some spice 🌶️'
        : 'total opposites — this could be interesting 😏'

    return (
      <GameCompleteCard onClose={closeGame}>
        {/* Animated score */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ duration: 0.6 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-forest to-primary-sage flex items-center justify-center mx-auto mb-4 shadow-lg"
        >
          <span className="text-3xl font-extrabold text-white">{matchCount}/{totalQuestions}</span>
        </motion.div>

        <h3 className="text-xl font-bold text-[var(--color-text)] mb-1">
          You matched on {matchCount} of {totalQuestions} choices
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">{resultMessage}</p>

        {/* Breakdown */}
        <div className="space-y-2 text-left w-full">
          {questions.map((q, i) => {
            const matched = myChoices[i] === partnerChoices[i]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={[
                  'flex items-center gap-2 p-2 rounded-xl text-xs',
                  matched
                    ? 'bg-success-light text-success'
                    : 'bg-danger-light text-danger',
                ].join(' ')}
              >
                <span>{matched ? '✅' : '❌'}</span>
                <span className="truncate">
                  {myChoices[i] === 'A' ? q.optionA : q.optionB}
                  {!matched && (
                    <span className="text-[var(--color-text-tertiary)] ml-1">
                      vs "{partnerChoices[i] === 'A' ? q.optionA : q.optionB}"
                    </span>
                  )}
                </span>
              </motion.div>
            )
          })}
        </div>
      </GameCompleteCard>
    )
  }

  return null
}

/* ================================================================
   Shared sub-components
   ================================================================ */

function WaitingScreen({ name }: { name: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-6">
        <span className="text-2xl">⏳</span>
      </div>

      <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">
        Waiting for {name}
      </h3>

      {/* Pulsing dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-primary-forest"
            animate={{
              y: [0, -8, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut' as const,
            }}
          />
        ))}
      </div>

      <p className="text-xs text-[var(--color-text-tertiary)] mt-6">
        We'll let you know when they're done
      </p>
    </motion.div>
  )
}

function GameCompleteCard({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 260, damping: 22 }}
      className="bg-white dark:bg-[var(--color-surface-raised)] rounded-2xl p-6 shadow-card text-center"
    >
      {children}

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onClose}
        className={[
          'w-full mt-6 py-3 rounded-2xl font-bold',
          'bg-primary-forest text-white shadow-forest-glow',
          'hover:bg-primary-forest/90 transition-colors duration-200',
        ].join(' ')}
      >
        Done
      </motion.button>
    </motion.div>
  )
}
