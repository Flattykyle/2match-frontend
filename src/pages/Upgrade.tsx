import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Sparkles, Crown, Zap, Loader2, CheckCircle, Heart } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { billingService, SubscriptionStatus } from '../services/billingService'

interface PlanFeature {
  text: string
  included: boolean
}

interface Plan {
  tier: 'FREE' | 'PREMIUM' | 'PLATINUM'
  name: string
  price: string
  period: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  features: PlanFeature[]
  cta: string
  popular?: boolean
}

const plans: Plan[] = [
  {
    tier: 'FREE',
    name: 'Free',
    price: '$0',
    period: 'forever',
    icon: <Heart className="w-6 h-6" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    features: [
      { text: '5 likes per day', included: true },
      { text: 'Basic discovery', included: true },
      { text: 'Icebreaker chat', included: true },
      { text: 'Voice intros', included: false },
      { text: 'Vibe tag filters', included: false },
      { text: 'See who vibed you', included: false },
      { text: 'Profile boost', included: false },
    ],
    cta: 'Current Plan',
  },
  {
    tier: 'PREMIUM',
    name: 'Premium',
    price: '$9.99',
    period: '/month',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'text-primary-600',
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-300',
    popular: true,
    features: [
      { text: 'Unlimited likes', included: true },
      { text: 'Advanced discovery', included: true },
      { text: 'Icebreaker chat', included: true },
      { text: 'Voice intros', included: true },
      { text: 'Vibe tag filters', included: true },
      { text: 'See who vibed you', included: true },
      { text: 'Profile boost', included: false },
    ],
    cta: 'Upgrade to Premium',
  },
  {
    tier: 'PLATINUM',
    name: 'Platinum',
    price: '$19.99',
    period: '/month',
    icon: <Crown className="w-6 h-6" />,
    color: 'text-secondary-600',
    bgColor: 'bg-secondary-50',
    borderColor: 'border-secondary-300',
    features: [
      { text: 'Unlimited likes', included: true },
      { text: 'Advanced discovery', included: true },
      { text: 'Icebreaker chat', included: true },
      { text: 'Voice intros', included: true },
      { text: 'Vibe tag filters', included: true },
      { text: 'See who vibed you', included: true },
      { text: '1 profile boost / week', included: true },
    ],
    cta: 'Go Platinum',
  },
]

const Upgrade = () => {
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')

  useEffect(() => {
    billingService.getStatus().then(setStatus).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const currentTier = status?.subscriptionTier || user?.subscriptionTier || 'FREE'

  const handleUpgrade = async (tier: 'PREMIUM' | 'PLATINUM') => {
    setCheckoutLoading(tier)
    try {
      const url = await billingService.createCheckout(tier)
      if (url) window.location.href = url
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setCheckoutLoading(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Success / Cancel banners */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3"
        >
          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
          <div>
            <p className="font-bold text-green-800">Welcome to {searchParams.get('tier')}!</p>
            <p className="text-sm text-green-600">Your subscription is now active. Enjoy your new features!</p>
          </div>
        </motion.div>
      )}

      {canceled && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6 text-center text-gray-600">
          No worries! You can upgrade anytime.
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-[var(--color-text)] mb-2">
          Find your person, <span className="gradient-text">your way</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg max-w-lg mx-auto">
          Choose the plan that fits how you want to connect. No tricks, no hidden fees.
        </p>
      </div>

      {/* Pricing cards */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = currentTier === plan.tier
            const isDowngrade = (currentTier === 'PLATINUM' && plan.tier === 'PREMIUM') ||
                                (currentTier !== 'FREE' && plan.tier === 'FREE')

            return (
              <motion.div
                key={plan.tier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                className={[
                  'relative rounded-3xl border-2 p-6 flex flex-col',
                  plan.popular ? plan.borderColor : 'border-gray-200',
                  plan.popular ? 'shadow-lg' : 'shadow-sm',
                ].join(' ')}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                {/* Tier icon + name */}
                <div className={`w-12 h-12 rounded-2xl ${plan.bgColor} flex items-center justify-center ${plan.color} mb-4`}>
                  {plan.icon}
                </div>

                <h3 className="text-xl font-bold text-[var(--color-text)]">{plan.name}</h3>

                <div className="flex items-baseline gap-1 mt-2 mb-6">
                  <span className="text-3xl font-extrabold text-[var(--color-text)]">{plan.price}</span>
                  <span className="text-[var(--color-text-secondary)] text-sm">{plan.period}</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 flex-1 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        feature.included ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {feature.included ? (
                          <Check className="w-3 h-3" strokeWidth={3} />
                        ) : (
                          <span className="text-xs">—</span>
                        )}
                      </div>
                      <span className={`text-sm ${feature.included ? 'text-[var(--color-text)]' : 'text-[var(--color-text-tertiary)]'}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                {isCurrent ? (
                  <div className="py-3 rounded-2xl text-center font-bold text-[var(--color-text-secondary)] bg-gray-100">
                    Current Plan
                  </div>
                ) : plan.tier === 'FREE' ? (
                  <div className="py-3 rounded-2xl text-center font-semibold text-gray-400">
                    {isDowngrade ? 'Downgrade' : 'Free forever'}
                  </div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleUpgrade(plan.tier as 'PREMIUM' | 'PLATINUM')}
                    disabled={!!checkoutLoading || isDowngrade}
                    className={[
                      'py-3 rounded-2xl font-bold w-full transition-colors flex items-center justify-center gap-2',
                      plan.popular
                        ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] shadow-primary-glow'
                        : 'bg-secondary-600 text-white hover:bg-secondary-700',
                      (checkoutLoading || isDowngrade) ? 'opacity-50 cursor-not-allowed' : '',
                    ].join(' ')}
                  >
                    {checkoutLoading === plan.tier ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        {plan.cta}
                      </>
                    )}
                  </motion.button>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Trust note */}
      <p className="text-center text-sm text-[var(--color-text-tertiary)] mt-8 max-w-md mx-auto">
        Cancel anytime from your account settings. No cancellation fees, no questions asked.
        Your remaining time stays active until the billing period ends.
      </p>
    </div>
  )
}

export default Upgrade
