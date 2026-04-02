import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Sparkles, X, Heart, Zap } from 'lucide-react'

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  feature?: string
  dailyLimit?: number
  currentCount?: number
}

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const modal = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 260, damping: 22 } },
  exit: { opacity: 0, y: 40, scale: 0.95 },
}

export default function PaywallModal({
  isOpen,
  onClose,
  feature = 'this feature',
  dailyLimit = 5,
  currentCount,
}: PaywallModalProps) {
  const navigate = useNavigate()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            variants={modal}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-sm rounded-3xl bg-[var(--color-surface-raised)] p-8 text-center shadow-xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center mx-auto mb-5 shadow-primary-glow">
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-xl font-extrabold text-[var(--color-text)] mb-2">
              You're on a roll!
            </h2>

            <p className="text-[var(--color-text-secondary)] mb-1">
              {currentCount !== undefined
                ? `You've used ${currentCount} of your ${dailyLimit} free daily likes.`
                : `${feature} is available with Premium.`}
            </p>

            <p className="text-sm text-[var(--color-text-tertiary)] mb-6">
              Upgrade to keep the momentum going — unlimited likes, voice intros, and more.
            </p>

            {/* Value props */}
            <div className="flex flex-col gap-2 mb-6 text-left">
              {[
                { icon: <Heart className="w-4 h-4" />, text: 'Unlimited daily likes' },
                { icon: <Zap className="w-4 h-4" />, text: 'See who vibed you' },
                { icon: <Sparkles className="w-4 h-4" />, text: 'Advanced vibe filters' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2.5 text-sm text-[var(--color-text)]">
                  <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary-500 flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  {item.text}
                </div>
              ))}
            </div>

            {/* CTA */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => { onClose(); navigate('/upgrade') }}
              className="w-full py-3 rounded-2xl bg-[var(--color-primary)] text-white font-bold shadow-primary-glow hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              See Plans — from $9.99/mo
            </motion.button>

            <button
              onClick={onClose}
              className="mt-3 text-sm font-semibold text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
            >
              Maybe later
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
