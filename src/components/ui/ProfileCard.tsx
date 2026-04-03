import { motion } from 'framer-motion'
import { CheckCircle, X, Sparkles, MapPin } from 'lucide-react'
import VibeTag from './VibeTag'
import Button from './Button'
import VoicePlayer from '../../components/VoicePlayer'

/* ── Types ── */
interface VibeTagData {
  emoji: string
  label: string
}

export interface ProfileCardUser {
  id: string
  firstName: string
  lastName?: string
  age: number
  photoUrl: string
  location?: string
  isVerified?: boolean
  vibeTags?: VibeTagData[]
  compatibilityScore?: number
  voiceMemoUrl?: string | null
  voiceMemoDuration?: number | null
}

interface ProfileCardProps {
  user: ProfileCardUser
  onPass?: (userId: string) => void
  onVibeCheck?: (userId: string) => void
  className?: string
}

/* ── Framer Motion presets ── */
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 20 },
  },
}

export default function ProfileCard({
  user,
  onPass,
  onVibeCheck,
  className = '',
}: ProfileCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -6, boxShadow: 'var(--shadow-card-hover)' }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
      className={[
        'group relative flex flex-col overflow-hidden rounded-3xl',
        'bg-[var(--color-surface-raised)] shadow-card',
        'transition-shadow duration-300',
        className,
      ].join(' ')}
    >
      {/* ── Photo ── */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={user.photoUrl}
          alt={`${user.firstName}'s profile`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient overlay at bottom of photo */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Compatibility badge */}
        {user.compatibilityScore != null && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-[var(--color-primary)]">
            <Sparkles className="w-3.5 h-3.5" />
            {user.compatibilityScore}%
          </div>
        )}

        {/* Name + age overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-1.5">
            <h3 className="text-lg font-extrabold text-white leading-tight truncate">
              {user.firstName}{user.lastName ? `, ${user.lastName.charAt(0)}.` : ''}
            </h3>
            <span className="text-white/80 font-semibold text-base">{user.age}</span>
            {user.isVerified && (
              <CheckCircle className="w-4.5 h-4.5 text-[var(--color-info)] fill-[var(--color-info)] flex-shrink-0" />
            )}
          </div>
          {user.location && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-white/60" />
              <span className="text-xs text-white/70 font-medium truncate">{user.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Voice memo */}
        {user.voiceMemoUrl && user.voiceMemoDuration && (
          <VoicePlayer
            audioUrl={user.voiceMemoUrl}
            duration={user.voiceMemoDuration}
            senderName={user.firstName}
          />
        )}

        {/* Vibe tags */}
        {user.vibeTags && user.vibeTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {user.vibeTags.slice(0, 4).map((tag) => (
              <VibeTag key={tag.label} emoji={tag.emoji} label={tag.label} size="sm" />
            ))}
            {user.vibeTags.length > 4 && (
              <span className="inline-flex items-center text-xs text-[var(--color-text-tertiary)] font-medium px-1">
                +{user.vibeTags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-auto flex gap-2 pt-1">
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={() => onPass?.(user.id)}
            icon={<X className="w-4 h-4" />}
          >
            Pass
          </Button>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => onVibeCheck?.(user.id)}
            icon={<Sparkles className="w-4 h-4" />}
          >
            Vibe Check
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
