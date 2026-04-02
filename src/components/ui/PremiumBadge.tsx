import { Sparkles, Crown } from 'lucide-react'
import type { SubscriptionTier } from '../../types'

interface PremiumBadgeProps {
  tier: SubscriptionTier
  size?: 'sm' | 'md'
  className?: string
}

export default function PremiumBadge({ tier, size = 'sm', className = '' }: PremiumBadgeProps) {
  if (tier === 'FREE') return null

  const styles = {
    PREMIUM: {
      bg: 'bg-gradient-to-r from-primary-400 to-primary-500',
      icon: <Sparkles className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
      label: 'Premium',
    },
    PLATINUM: {
      bg: 'bg-gradient-to-r from-secondary-500 to-secondary-600',
      icon: <Crown className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
      label: 'Platinum',
    },
  }

  const s = styles[tier]

  return (
    <span
      className={[
        'inline-flex items-center gap-1 text-white font-bold rounded-full shadow-sm',
        s.bg,
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        className,
      ].join(' ')}
    >
      {s.icon}
      {s.label}
    </span>
  )
}
