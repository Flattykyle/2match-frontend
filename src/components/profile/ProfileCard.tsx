import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { ChevronDown, MapPin, Play, Pause, X, Camera } from 'lucide-react'
import WaveSurfer from 'wavesurfer.js'
import Button from '../ui/Button'
import VibeTag from '../ui/VibeTag'

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */

interface VibeTagData {
  emoji: string
  label: string
}

interface PromptAnswer {
  question: string
  answer: string
}

type IntentionKind = 'serious' | 'casual' | 'friends-first' | 'open' | 'exploring'

export interface ProfileData {
  id: string
  firstName: string
  age: number
  locationDistance?: string       // e.g. "3 km away"
  online?: boolean
  intention?: IntentionKind
  vibeTags?: VibeTagData[]
  prompts?: PromptAnswer[]
  greenFlag?: string
  redFlag?: string
  currentlyObsessedWith?: string
  voiceMemo?: { url: string; duration: number }
  photos?: string[]
}

interface ProfileCardProps {
  profile: ProfileData
  exchangeCount: number
  onInterest: () => void
  onPass: () => void
  /** When true, the action bar is inline instead of fixed at viewport bottom. Use for feed layouts. */
  inline?: boolean
}

/* ═══════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════ */

const INTENTION_CONFIG: Record<IntentionKind, { emoji: string; label: string; color: string; darkColor: string; bg: string; darkBg: string }> = {
  serious:       { emoji: '💚', label: 'Serious',       color: 'text-primary-forest', darkColor: 'dark:text-primary-sage',     bg: 'bg-primary-light',  darkBg: 'dark:bg-primary-forest/20' },
  casual:        { emoji: '☀️', label: 'Casual',        color: 'text-accent-terracotta', darkColor: 'dark:text-accent-warm',   bg: 'bg-accent-warm',    darkBg: 'dark:bg-accent-terracotta/20' },
  'friends-first': { emoji: '🌱', label: 'Friends first', color: 'text-primary-forest', darkColor: 'dark:text-primary-sage',   bg: 'bg-primary-light',  darkBg: 'dark:bg-primary-forest/20' },
  open:          { emoji: '✨', label: 'Open',          color: 'text-warning',          darkColor: 'dark:text-warning-light',   bg: 'bg-warning-light',  darkBg: 'dark:bg-warning/20' },
  exploring:     { emoji: '🔮', label: 'Exploring',     color: 'text-info',             darkColor: 'dark:text-info-light',      bg: 'bg-info-light',     darkBg: 'dark:bg-info/20' },
}

const OBSESSION_EMOJIS = ['🎧', '📺', '🍜', '🎮', '📖', '🎨', '🏃', '✈️']

/* ═══════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════ */

/* ── 1. Header ── */
function Header({ profile }: { profile: ProfileData }) {
  const intention = profile.intention ? INTENTION_CONFIG[profile.intention] : null

  return (
    <div className="space-y-3">
      {/* Name row */}
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className="font-serif text-[22px] font-semibold text-[var(--color-text)] leading-tight">
          {profile.firstName}, {profile.age}
        </h2>

        {profile.online !== undefined && (
          <span
            className={[
              'w-2.5 h-2.5 rounded-full flex-shrink-0',
              profile.online ? 'bg-success' : 'bg-neutral-cream dark:bg-neutral-almostBlack',
            ].join(' ')}
            title={profile.online ? 'Online' : 'Offline'}
          />
        )}

        {profile.locationDistance && (
          <span className="flex items-center gap-1 text-sm text-[var(--color-text-tertiary)]">
            <MapPin className="w-3.5 h-3.5" />
            {profile.locationDistance}
          </span>
        )}
      </div>

      {/* Intention badge */}
      {intention && (
        <span
          className={[
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium',
            intention.bg, intention.color, intention.darkBg, intention.darkColor,
          ].join(' ')}
        >
          <span>{intention.emoji}</span>
          {intention.label}
        </span>
      )}

      {/* Vibe tags — horizontally scrollable */}
      {profile.vibeTags && profile.vibeTags.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {profile.vibeTags.slice(0, 5).map((tag) => (
            <VibeTag key={tag.label} emoji={tag.emoji} label={tag.label} size="sm" className="flex-shrink-0" />
          ))}
        </div>
      )}
    </div>
  )
}

/* ── 2. Prompt answers ── */
function PromptAnswers({ prompts }: { prompts: PromptAnswer[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <LayoutGroup id="prompts">
      <div className="space-y-2">
        {prompts.slice(0, 3).map((p, i) => {
          const isOpen = openIdx === i
          return (
            <motion.div
              key={i}
              layout
              className={[
                'rounded-xl border overflow-hidden cursor-pointer',
                'border-primary-sage/30 dark:border-primary-sage/15',
                'bg-neutral-warmWhite dark:bg-[var(--color-surface-raised)]',
              ].join(' ')}
              onClick={() => setOpenIdx(isOpen ? null : i)}
            >
              <motion.div layout="position" className="flex items-center justify-between px-4 py-3">
                <span className="text-xs text-[var(--color-text-tertiary)] font-medium leading-snug pr-2">
                  {p.question}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                </motion.span>
              </motion.div>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-3 font-serif text-base leading-relaxed text-[var(--color-text)]">
                      {p.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </LayoutGroup>
  )
}

/* ── 3. Red / Green flags ── */
function FlagCards({ greenFlag, redFlag }: { greenFlag?: string; redFlag?: string }) {
  if (!greenFlag && !redFlag) return null

  return (
    <div className="grid grid-cols-2 gap-3">
      {greenFlag && (
        <div className="rounded-xl border-2 border-primary-sage/50 dark:border-primary-sage/25 p-3">
          <span className="text-xs text-[var(--color-text-tertiary)] font-medium block mb-1">🟢 Green flag</span>
          <p className="font-serif italic text-sm text-[var(--color-text)] leading-snug">{greenFlag}</p>
        </div>
      )}
      {redFlag && (
        <div className="rounded-xl border-2 border-accent-terracotta/40 dark:border-accent-terracotta/25 p-3">
          <span className="text-xs text-[var(--color-text-tertiary)] font-medium block mb-1">🔴 Red flag</span>
          <p className="font-serif italic text-sm text-[var(--color-text)] leading-snug">{redFlag}</p>
        </div>
      )}
    </div>
  )
}

/* ── 4. Currently obsessed with ── */
function ObsessedBadge({ text }: { text: string }) {
  const [emojiIdx, setEmojiIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setEmojiIdx((prev) => (prev + 1) % OBSESSION_EMOJIS.length), 2000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-warm dark:bg-accent-terracotta/15 text-sm">
      <motion.span
        key={emojiIdx}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="text-base"
      >
        {OBSESSION_EMOJIS[emojiIdx]}
      </motion.span>
      <span className="text-[var(--color-text-secondary)] font-medium">{text}</span>
    </div>
  )
}

/* ── 5. Voice memo (wavesurfer) ── */
function VoiceMemoPlayer({ url, duration }: { url: string; duration: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WaveSurfer | null>(null)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const ws = WaveSurfer.create({
      container: containerRef.current,
      height: 36,
      barWidth: 3,
      barGap: 2,
      barRadius: 2,
      cursorWidth: 0,
      waveColor: '#9FCFBF',
      progressColor: '#2D5C4F',
      url,
      interact: true,
      normalize: true,
    })

    ws.on('ready', () => setReady(true))
    ws.on('finish', () => setPlaying(false))
    ws.on('play', () => setPlaying(true))
    ws.on('pause', () => setPlaying(false))

    wsRef.current = ws

    return () => {
      ws.destroy()
      wsRef.current = null
    }
  }, [url])

  const toggle = useCallback(() => {
    wsRef.current?.playPause()
  }, [])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-primary-light dark:bg-primary-forest/15 px-3 py-2.5">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggle}
        disabled={!ready}
        className={[
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
          ready
            ? 'bg-primary-forest text-white shadow-sm'
            : 'bg-neutral-cream dark:bg-neutral-almostBlack text-[var(--color-text-tertiary)] cursor-wait',
        ].join(' ')}
        aria-label={playing ? 'Pause voice memo' : 'Play voice memo'}
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </motion.button>

      <div className="flex-1 min-w-0">
        <div ref={containerRef} className="w-full" />
        <span className="text-xs text-[var(--color-text-tertiary)] tabular-nums mt-0.5 block">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}

/* ── 6. Photos section ── */
function PhotoGrid({ photos, exchangeCount }: { photos: string[]; exchangeCount: number }) {
  const blurPx = useMemo(() => Math.max(0, 12 - exchangeCount * 2.4), [exchangeCount])
  const isRevealed = blurPx === 0
  const photosToShow = photos.slice(0, 6)
  const remaining = Math.max(0, 5 - exchangeCount) // prompts left to exchange

  return (
    <div className="relative">
      <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
        {photosToShow.map((src, i) => (
          <motion.div
            key={i}
            className="aspect-square overflow-hidden"
            {...(isRevealed
              ? {
                  initial: { scale: 0.85, opacity: 0 },
                  animate: { scale: 1, opacity: 1 },
                  transition: { delay: i * 0.06, type: 'spring', stiffness: 260, damping: 20 },
                }
              : {})}
          >
            <img
              src={src}
              alt={`Photo ${i + 1}`}
              className="w-full h-full object-cover"
              style={!isRevealed ? { filter: `blur(${blurPx}px)` } : undefined}
              loading="lazy"
            />
          </motion.div>
        ))}
      </div>

      {/* Frosted overlay when blurred */}
      {!isRevealed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-white/30 dark:bg-black/30 backdrop-blur-sm">
          <Camera className="w-6 h-6 text-[var(--color-text)] mb-2" />
          <p className="text-sm font-medium text-[var(--color-text)] text-center px-4">
            📸 {photosToShow.length} photo{photosToShow.length !== 1 && 's'} · Exchange {remaining > 0 ? remaining : 'a few'} more prompt{remaining !== 1 && 's'} to reveal
          </p>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Main ProfileCard
   ═══════════════════════════════════════════════════════════════ */

export default function ProfileCard({
  profile,
  exchangeCount,
  onInterest,
  onPass,
  inline = false,
}: ProfileCardProps) {
  return (
    <div className={`relative w-full max-w-[440px] mx-auto flex flex-col ${inline ? '' : 'h-full'}`}>
      {/* Content */}
      <div className={`space-y-5 px-4 pt-5 ${inline ? 'pb-5' : 'flex-1 overflow-y-auto pb-24'}`}>
        {/* 1 — Header */}
        <Header profile={profile} />

        {/* 2 — Prompt answers */}
        {profile.prompts && profile.prompts.length > 0 && (
          <PromptAnswers prompts={profile.prompts} />
        )}

        {/* 3 — Flags */}
        <FlagCards greenFlag={profile.greenFlag} redFlag={profile.redFlag} />

        {/* 4 — Currently obsessed with */}
        {profile.currentlyObsessedWith && (
          <div>
            <span className="text-xs text-[var(--color-text-tertiary)] font-medium block mb-1.5">
              Currently obsessed with
            </span>
            <ObsessedBadge text={profile.currentlyObsessedWith} />
          </div>
        )}

        {/* 5 — Voice memo */}
        {profile.voiceMemo && (
          <div>
            <span className="text-xs text-[var(--color-text-tertiary)] font-medium block mb-1.5">
              Voice memo
            </span>
            <VoiceMemoPlayer url={profile.voiceMemo.url} duration={profile.voiceMemo.duration} />
          </div>
        )}

        {/* 6 — Photos */}
        {profile.photos && profile.photos.length > 0 && (
          <div>
            <span className="text-xs text-[var(--color-text-tertiary)] font-medium block mb-1.5">
              Photos
            </span>
            <PhotoGrid photos={profile.photos} exchangeCount={exchangeCount} />
          </div>
        )}
      </div>

      {/* 7 — Action bar */}
      <div
        className={
          inline
            ? 'border-t border-primary-sage/20 dark:border-primary-sage/10 px-4 py-3'
            : [
                'fixed bottom-0 left-0 right-0 z-10',
                'border-t border-primary-sage/20 dark:border-primary-sage/10',
                'bg-[var(--color-surface)]/95 backdrop-blur-md',
                'px-4 py-3',
              ].join(' ')
        }
      >
        <div className={`${inline ? '' : 'max-w-[440px] mx-auto'} flex items-center gap-3`}>
          <Button variant="ghost" size="md" onClick={onPass} icon={<X className="w-5 h-5" />}>
            Not for me
          </Button>

          <Button variant="primary" size="lg" fullWidth onClick={onInterest}>
            I'm interested
          </Button>
        </div>
      </div>
    </div>
  )
}
