import { motion, AnimatePresence } from 'framer-motion'
import { Gamepad2, X } from 'lucide-react'
import { useIcebreakerGameStore, GameType } from '../../store/icebreakerGameStore'
import { icebreakerGameService } from '../../services/icebreakerGameService'

/* ── Game type cards ── */
const GAME_TYPES: { type: GameType; emoji: string; name: string; description: string }[] = [
  {
    type: 'TWO_TRUTHS',
    emoji: '🤥',
    name: 'Two Truths & a Lie',
    description: 'Write 3 statements — one is a lie. Can they spot it?',
  },
  {
    type: 'HOT_TAKES',
    emoji: '🔥',
    name: 'Hot Takes',
    description: 'Agree or disagree on a spicy question. See if you vibe.',
  },
  {
    type: 'WOULD_YOU_RATHER',
    emoji: '⚡',
    name: 'Would You Rather',
    description: '5 rapid-fire choices. How many will you match on?',
  },
]

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const sheetVariants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
  },
  exit: {
    y: '100%',
    transition: { duration: 0.25, ease: 'easeIn' as const },
  },
}

const cardStagger = {
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const cardItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
}

/* ── Props ── */
interface IceBreakerLauncherProps {
  matchId: string
  partnerName: string
}

export default function IceBreakerLauncher({ matchId, partnerName }: IceBreakerLauncherProps) {
  const { isLauncherOpen, openLauncher, closeLauncher, startGame, setLoading, loading } =
    useIcebreakerGameStore()

  const handleSelect = async (gameType: GameType) => {
    try {
      setLoading(true)
      const res = await icebreakerGameService.startGame(matchId, gameType)
      startGame({
        id: res.sessionId,
        matchId: res.matchId,
        gameType: res.gameType,
        phase: 'submitting',
        mySubmission: null,
        partnerSubmission: null,
        partnerReady: false,
        result: null,
        partnerName,
      })
    } catch (err) {
      console.error('Failed to start game:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Trigger button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={openLauncher}
        className={[
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold',
          'bg-accent-warm text-accent-terracotta',
          'hover:bg-accent-terracotta hover:text-white',
          'transition-colors duration-200',
        ].join(' ')}
      >
        <Gamepad2 className="w-4 h-4" />
        Play a game
      </motion.button>

      {/* Bottom sheet */}
      <AnimatePresence>
        {isLauncherOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="launcher-backdrop"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={closeLauncher}
              className="fixed inset-0 bg-black/40 z-[var(--z-modal-backdrop)]"
            />

            {/* Sheet */}
            <motion.div
              key="launcher-sheet"
              variants={sheetVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={[
                'fixed bottom-0 left-0 right-0 z-[var(--z-modal)]',
                'bg-[var(--color-surface-raised)] rounded-t-3xl',
                'pb-[env(safe-area-inset-bottom,0px)]',
                'max-h-[80vh] overflow-y-auto',
              ].join(' ')}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-[var(--color-text-tertiary)]/30" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-2 pb-4">
                <h2 className="text-xl font-bold text-[var(--color-text)]">Pick a game</h2>
                <button
                  onClick={closeLauncher}
                  className="p-1.5 rounded-full hover:bg-[var(--color-surface-sunken)] transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
                </button>
              </div>

              {/* Game cards */}
              <motion.div
                variants={cardStagger}
                initial="hidden"
                animate="visible"
                className="px-5 pb-6 flex flex-col gap-3"
              >
                {GAME_TYPES.map((game) => (
                  <motion.button
                    key={game.type}
                    variants={cardItem}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelect(game.type)}
                    disabled={loading}
                    className={[
                      'flex items-center gap-4 p-4 rounded-2xl text-left w-full',
                      'bg-white dark:bg-[var(--color-surface-sunken)]',
                      'border border-transparent',
                      'hover:border-primary-sage/40 hover:shadow-card-hover',
                      'transition-all duration-200',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                    ].join(' ')}
                  >
                    <span className="text-3xl flex-shrink-0">{game.emoji}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-[var(--color-text)] text-base">{game.name}</p>
                      <p className="text-sm text-[var(--color-text-secondary)] mt-0.5 leading-snug">
                        {game.description}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
