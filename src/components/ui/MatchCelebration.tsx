import { useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { MessageCircle, Heart } from 'lucide-react'
import Button from './Button'

/* ── Types ── */
interface MatchUser {
  firstName: string
  photoUrl: string
}

interface MatchCelebrationProps {
  isOpen: boolean
  currentUser: MatchUser
  matchedUser: MatchUser
  onSendMessage: () => void
  onKeepBrowsing: () => void
}

/* ── Animation variants ── */
const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.25, delay: 0.1 } },
}

const modal = {
  hidden: { opacity: 0, y: '100%', scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22, delay: 0.1 },
  },
  exit: {
    opacity: 0,
    y: 60,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
}

const avatarLeft = {
  hidden: { opacity: 0, x: -80, rotate: -15 },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { type: 'spring' as const, stiffness: 200, damping: 15, delay: 0.35 },
  },
}

const avatarRight = {
  hidden: { opacity: 0, x: 80, rotate: 15 },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { type: 'spring' as const, stiffness: 200, damping: 15, delay: 0.35 },
  },
}

const heartPulse = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: [0, 1.3, 1],
    transition: { delay: 0.55, duration: 0.5, ease: 'easeOut' as const },
  },
}

const textReveal = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.7, duration: 0.4 } },
}

const buttonsReveal = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.9, duration: 0.4 } },
}

/* ── Component ── */
export default function MatchCelebration({
  isOpen,
  currentUser,
  matchedUser,
  onSendMessage,
  onKeepBrowsing,
}: MatchCelebrationProps) {
  const hasFired = useRef(false)

  const fireConfetti = useCallback(() => {
    if (hasFired.current) return
    hasFired.current = true

    const colors = ['#FF6B6B', '#FF8E8E', '#2D1B4E', '#FBBF24', '#FFF8F0']

    // Left burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.2, y: 0.6 },
      colors,
      startVelocity: 45,
      gravity: 0.8,
    })

    // Right burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.8, y: 0.6 },
      colors,
      startVelocity: 45,
      gravity: 0.8,
    })

    // Delayed center shower
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 100,
        origin: { x: 0.5, y: 0.3 },
        colors,
        startVelocity: 30,
        gravity: 1,
      })
    }, 400)
  }, [])

  useEffect(() => {
    if (isOpen) {
      hasFired.current = false
      const timer = setTimeout(fireConfetti, 350)
      return () => clearTimeout(timer)
    }
  }, [isOpen, fireConfetti])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="match-backdrop"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[var(--z-celebration)] flex items-center justify-center p-4"
          style={{ background: 'var(--color-surface-overlay)' }}
        >
          <motion.div
            key="match-modal"
            variants={modal}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-sm rounded-3xl bg-[var(--color-surface-raised)] p-8 text-center shadow-celebration"
          >
            {/* ── Avatar bubbles ── */}
            <div className="relative flex items-center justify-center mb-6 h-32">
              {/* Left avatar (current user) */}
              <motion.div
                variants={avatarLeft}
                className="absolute left-1/2 -translate-x-[70px] w-24 h-24 rounded-full border-4 border-[var(--color-surface-raised)] shadow-lg overflow-hidden z-10"
              >
                <img
                  src={currentUser.photoUrl}
                  alt={currentUser.firstName}
                  className="h-full w-full object-cover"
                />
              </motion.div>

              {/* Right avatar (matched user) */}
              <motion.div
                variants={avatarRight}
                className="absolute left-1/2 translate-x-[10px] w-24 h-24 rounded-full border-4 border-[var(--color-surface-raised)] shadow-lg overflow-hidden z-10"
              >
                <img
                  src={matchedUser.photoUrl}
                  alt={matchedUser.firstName}
                  className="h-full w-full object-cover"
                />
              </motion.div>

              {/* Heart icon between avatars */}
              <motion.div
                variants={heartPulse}
                className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-primary)] shadow-primary-glow"
              >
                <Heart className="w-5 h-5 text-white fill-white" />
              </motion.div>
            </div>

            {/* ── Text ── */}
            <motion.div variants={textReveal}>
              <h2 className="text-3xl font-extrabold text-[var(--color-text)] mb-1">
                You two vibe!
              </h2>
              <p className="text-[var(--color-text-secondary)] font-medium">
                You and <span className="font-bold text-[var(--color-primary)]">{matchedUser.firstName}</span> matched
              </p>
            </motion.div>

            {/* ── CTA Buttons ── */}
            <motion.div variants={buttonsReveal} className="mt-8 flex flex-col gap-3">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={onSendMessage}
                icon={<MessageCircle className="w-5 h-5" />}
              >
                Send a Message
              </Button>
              <Button
                variant="ghost"
                size="md"
                fullWidth
                onClick={onKeepBrowsing}
              >
                Keep Browsing
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
