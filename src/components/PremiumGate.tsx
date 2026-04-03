import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Loader2 } from 'lucide-react'
import { billingService } from '../services/billingService'

interface PremiumGateProps {
  isOpen: boolean
  onClose: () => void
  feature: string
}

const FEATURE_INFO: Record<string, { title: string; description: string }> = {
  see_who_likes_you: {
    title: 'See who likes you',
    description: 'Find out who\'s already interested — skip the guessing game.',
  },
  unlimited_daily_picks: {
    title: 'Unlimited daily picks',
    description: 'No more waiting until tomorrow. See as many profiles as you want.',
  },
  ai_starters_regeneration: {
    title: 'Unlimited conversation starters',
    description: 'Fresh AI-powered icebreakers whenever you need them.',
  },
  shared_playlist: {
    title: 'Shared Playlists',
    description: 'Create a shared Spotify playlist with your match and vibe together.',
  },
  advanced_filters: {
    title: 'Advanced filters',
    description: 'Filter by intention, distance, vibe tags, and more to find exactly who you\'re looking for.',
  },
}

const DEFAULT_INFO = {
  title: 'Premium feature',
  description: 'Upgrade to unlock this feature and make your experience even better.',
}

export default function PremiumGate({ isOpen, onClose, feature }: PremiumGateProps) {
  const [loading, setLoading] = useState<'monthly' | 'annual' | null>(null)

  const info = FEATURE_INFO[feature] || DEFAULT_INFO

  const handleCheckout = async (plan: 'monthly' | 'annual') => {
    setLoading(plan)
    try {
      const url = await billingService.createPremiumCheckout(plan)
      if (url) window.location.href = url
    } catch {
      // silent
    } finally {
      setLoading(null)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50"
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            <div className="px-6 pb-8">
              {/* Close */}
              <div className="flex justify-end mb-2">
                <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Icon + title */}
              <div className="text-center mb-5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: '#E1F5EE' }}
                >
                  <Sparkles className="w-7 h-7" style={{ color: '#2D5C4F' }} />
                </div>
                <h2 className="text-xl font-bold" style={{ color: '#2B2B2B' }}>
                  Unlock {info.title}
                </h2>
                <p className="text-sm mt-2 max-w-xs mx-auto" style={{ color: '#8A8578' }}>
                  {info.description}
                </p>
              </div>

              {/* Plan options */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Monthly */}
                <button
                  onClick={() => handleCheckout('monthly')}
                  disabled={loading !== null}
                  className="relative rounded-2xl border-2 p-4 text-center transition-all hover:shadow-md disabled:opacity-50"
                  style={{ borderColor: '#E1F5EE' }}
                >
                  <p className="text-xs font-semibold mb-1" style={{ color: '#8A8578' }}>Monthly</p>
                  <p className="text-2xl font-bold" style={{ color: '#2D5C4F' }}>$9.99</p>
                  <p className="text-xs" style={{ color: '#8A8578' }}>/month</p>
                  {loading === 'monthly' && (
                    <Loader2 className="w-4 h-4 animate-spin absolute top-2 right-2" style={{ color: '#9FCFBF' }} />
                  )}
                </button>

                {/* Annual */}
                <button
                  onClick={() => handleCheckout('annual')}
                  disabled={loading !== null}
                  className="relative rounded-2xl border-2 p-4 text-center transition-all hover:shadow-md disabled:opacity-50"
                  style={{ borderColor: '#2D5C4F' }}
                >
                  <div
                    className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: '#E8735A' }}
                  >
                    Save 33%
                  </div>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#8A8578' }}>Annual</p>
                  <p className="text-2xl font-bold" style={{ color: '#2D5C4F' }}>$79.99</p>
                  <p className="text-xs" style={{ color: '#8A8578' }}>/year</p>
                  {loading === 'annual' && (
                    <Loader2 className="w-4 h-4 animate-spin absolute top-2 right-2" style={{ color: '#9FCFBF' }} />
                  )}
                </button>
              </div>

              {/* Trial CTA */}
              <p className="text-center text-sm font-medium mb-5" style={{ color: '#2D5C4F' }}>
                Try 7 days free — cancel anytime
              </p>

              {/* Maybe later */}
              <button
                onClick={onClose}
                className="w-full text-center text-sm font-medium py-2 transition-colors"
                style={{ color: '#8A8578' }}
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
