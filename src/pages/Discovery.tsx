import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Moon, Clock } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useDiscoveryStore } from '../store/discoveryStore'
import { expressInterest, passUser, DailyPick } from '../services/discoveryService'
import ProfileCard from '../components/profile/ProfileCard'
import type { ProfileData } from '../components/profile/ProfileCard'
import MatchCelebration from '../components/ui/MatchCelebration'

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */

const INTENTION_MAP: Record<string, ProfileData['intention']> = {
  SERIOUS: 'serious',
  CASUAL: 'casual',
  FRIENDS_FIRST: 'friends-first',
  OPEN: 'open',
  EXPLORING: 'exploring',
}

function calculateAge(dob: string): number {
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function toProfileData(pick: DailyPick): ProfileData {
  return {
    id: pick.id,
    firstName: pick.firstName,
    age: calculateAge(pick.dateOfBirth),
    locationDistance: pick.distanceText ?? undefined,
    online: pick.isOnline,
    intention: pick.intention ? INTENTION_MAP[pick.intention] ?? 'exploring' : undefined,
    vibeTags: pick.vibeTags?.map((t) => ({ emoji: t.emoji, label: t.label })),
    greenFlag: pick.greenFlag ?? undefined,
    redFlag: pick.redFlag ?? undefined,
    currentlyObsessedWith: pick.currentlyObsessedWith ?? undefined,
    voiceMemo:
      pick.voiceIntroUrl && pick.voiceIntroDuration
        ? { url: pick.voiceIntroUrl, duration: pick.voiceIntroDuration }
        : undefined,
    photos: pick.profilePictures?.length ? pick.profilePictures : undefined,
  }
}

/* ── Countdown hook ── */
function useCountdown(expiresAt: string | null) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!expiresAt) return

    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft('00:00:00')
        return
      }
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1000)
      setTimeLeft(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      )
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  return timeLeft
}

/* ═══════════════════════════════════════════════════════════════
   Page component
   ═══════════════════════════════════════════════════════════════ */

const Discovery = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    dailyPicks,
    expiresAt,
    passedIds,
    interestedIds,
    loading,
    error,
    loadPicks,
    markInterest,
    markPass,
  } = useDiscoveryStore()

  const [celebrationMatch, setCelebrationMatch] = useState<{
    currentUser: { firstName: string; photoUrl: string }
    matchedUser: { firstName: string; photoUrl: string }
    matchId: string
  } | null>(null)

  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const countdown = useCountdown(expiresAt)

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadPicks()
  }, [user, navigate, loadPicks])

  // Visible picks = those not yet acted on
  const actedOnIds = useMemo(
    () => new Set([...passedIds, ...interestedIds]),
    [passedIds, interestedIds]
  )

  const visiblePicks = useMemo(
    () => dailyPicks.filter((p) => !actedOnIds.has(p.id)),
    [dailyPicks, actedOnIds]
  )

  const remainingCount = visiblePicks.length

  /* ── Actions ── */
  const handleInterest = useCallback(
    async (pick: DailyPick) => {
      if (actionLoading) return
      setActionLoading(pick.id)

      try {
        const res = await expressInterest(pick.id)
        markInterest(pick.id)

        if (res.isMatch && res.match) {
          const matchedUser = res.match.user1?.id === user?.id ? res.match.user2 : res.match.user1
          setCelebrationMatch({
            currentUser: {
              firstName: user?.firstName ?? '',
              photoUrl: user?.profilePictures?.[0] ?? '',
            },
            matchedUser: {
              firstName: matchedUser?.firstName ?? pick.firstName,
              photoUrl: matchedUser?.profilePictures?.[0] ?? pick.profilePictures?.[0] ?? '',
            },
            matchId: res.match.id,
          })
        }
      } catch {
        // Silently mark as interested even if server fails to avoid blocking UX
        markInterest(pick.id)
      } finally {
        setActionLoading(null)
      }
    },
    [actionLoading, markInterest, user]
  )

  const handlePass = useCallback(
    async (pick: DailyPick) => {
      if (actionLoading) return
      setActionLoading(pick.id)
      markPass(pick.id)

      try {
        await passUser(pick.id)
      } catch {
        // Pass is already marked locally
      } finally {
        setActionLoading(null)
      }
    },
    [actionLoading, markPass]
  )

  /* ── Loading state ── */
  if (loading && dailyPicks.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-forest dark:text-primary-sage mx-auto mb-4" />
          <p className="text-[var(--color-text-secondary)] font-medium">
            Curating today's picks...
          </p>
        </div>
      </div>
    )
  }

  /* ── Error state ── */
  if (error && dailyPicks.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="max-w-sm w-full rounded-2xl bg-[var(--color-surface-raised)] shadow-card p-8 text-center">
          <p className="text-[var(--color-text-secondary)] mb-4">{error}</p>
          <button
            onClick={loadPicks}
            className="px-6 py-2.5 rounded-xl bg-primary-forest text-white font-semibold hover:bg-primary-forest/90 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  /* ── Empty state ── */
  if (remainingCount === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-primary-light dark:bg-primary-forest/20 flex items-center justify-center">
            <Moon className="w-10 h-10 text-primary-forest dark:text-primary-sage" />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">
              You've seen everyone today
            </h2>
            <p className="text-[var(--color-text-secondary)]">
              Come back tomorrow for a fresh set of picks.
            </p>
          </div>

          {countdown && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-cream dark:bg-neutral-almostBlack">
              <Clock className="w-4 h-4 text-[var(--color-text-tertiary)]" />
              <span className="text-sm font-mono font-semibold text-[var(--color-text)] tabular-nums">
                {countdown}
              </span>
            </div>
          )}

          {/* Illustration placeholder */}
          <div className="w-48 h-32 mx-auto rounded-2xl bg-accent-warm/40 dark:bg-accent-terracotta/10 flex items-center justify-center">
            <span className="text-4xl">🌙</span>
          </div>
        </div>
      </div>
    )
  }

  /* ── Main feed ── */
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-surface)]">
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-primary-sage/15 dark:border-primary-sage/10">
        <div className="max-w-[440px] mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[var(--color-text)]">
              Today's Picks
              <span className="ml-2 text-sm font-normal text-[var(--color-text-tertiary)]">
                · {remainingCount} left
              </span>
            </h1>
          </div>

          {countdown && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono tabular-nums">{countdown}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Feed ── */}
      <div className="max-w-[440px] mx-auto pb-8">
        <AnimatePresence mode="popLayout">
          {visiblePicks.map((pick, i) => (
            <motion.div
              key={pick.id}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 24,
                delay: i * 0.04,
              }}
              className="pt-6"
            >
              <div className="rounded-3xl bg-[var(--color-surface-raised)] shadow-card overflow-hidden">
                <ProfileCard
                  profile={toProfileData(pick)}
                  exchangeCount={pick.exchangeCount}
                  onInterest={() => handleInterest(pick)}
                  onPass={() => handlePass(pick)}
                  inline
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Match celebration modal ── */}
      <MatchCelebration
        isOpen={!!celebrationMatch}
        currentUser={celebrationMatch?.currentUser ?? { firstName: '', photoUrl: '' }}
        matchedUser={celebrationMatch?.matchedUser ?? { firstName: '', photoUrl: '' }}
        onSendMessage={() => {
          setCelebrationMatch(null)
          navigate('/messages')
        }}
        onKeepBrowsing={() => setCelebrationMatch(null)}
      />
    </div>
  )
}

export default Discovery
