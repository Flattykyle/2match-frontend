import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  X,
  Calendar,
  Clock,
  Heart,
  ChevronDown,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Pause,
} from 'lucide-react'
import { safetyService, DateCheckin } from '../services/safetyService'
import { useAuthStore } from '../store/authStore'

interface SafetyBottomSheetProps {
  isOpen: boolean
  onClose: () => void
}

const MOOD_OPTIONS = [
  { mood: 'GREAT', emoji: '\uD83D\uDE0A', label: 'Great' },
  { mood: 'GOOD', emoji: '\uD83D\uDE42', label: 'Good' },
  { mood: 'OKAY', emoji: '\uD83D\uDE10', label: 'Okay' },
  { mood: 'BURNED_OUT', emoji: '\uD83D\uDE2E\u200D\uD83D\uDCA8', label: 'Burned out' },
  { mood: 'TAKING_BREAK', emoji: '\uD83D\uDED1', label: 'Taking a break' },
]

const SAFETY_TIPS = [
  {
    title: 'Meet in public',
    body: 'Always choose a busy, well-lit public place for your first few dates. Coffee shops, restaurants, and parks are great options.',
  },
  {
    title: 'Tell someone',
    body: 'Share your date plans with a friend or family member. Include where you\'re going, who you\'re meeting, and when you expect to be back.',
  },
  {
    title: 'Trust your gut',
    body: 'If something feels off, it probably is. You can always leave. Your safety is more important than being polite.',
  },
  {
    title: 'Stay sober-ish',
    body: 'Keep your wits about you. Watch your drink being made and don\'t leave it unattended. It\'s okay to stick to one drink.',
  },
]

export default function SafetyBottomSheet({ isOpen, onClose }: SafetyBottomSheetProps) {
  const { user: _user } = useAuthStore()
  const [activeCheckin, setActiveCheckin] = useState<DateCheckin | null>(null)
  const [_loading, setLoading] = useState(false)

  // Date check-in form
  const [dateTime, setDateTime] = useState('')
  const [trustedEmail, setTrustedEmail] = useState('')
  const [creating, setCreating] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)

  // Mood
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [moodNote, setMoodNote] = useState('')
  const [moodSubmitting, setMoodSubmitting] = useState(false)
  const [moodSuggestion, setMoodSuggestion] = useState<string | null>(null)
  const [moodSaved, setMoodSaved] = useState(false)

  // Snooze
  const [snoozing, setSnoozing] = useState(false)
  const [snoozed, setSnoozed] = useState(false)

  // Tips accordion
  const [expandedTip, setExpandedTip] = useState<number | null>(null)

  // Countdown
  const [countdown, setCountdown] = useState('')

  // Load active check-in
  useEffect(() => {
    if (isOpen) loadActiveCheckin()
  }, [isOpen])

  // Countdown timer
  useEffect(() => {
    if (!activeCheckin || activeCheckin.status !== 'PENDING') {
      setCountdown('')
      return
    }

    const update = () => {
      const target = new Date(activeCheckin.scheduledAt).getTime() + 2 * 60 * 60 * 1000
      const diff = target - Date.now()

      if (diff <= 0) {
        setCountdown('Check-in overdue')
        return
      }

      const h = Math.floor(diff / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setCountdown(`Check-in in ${h}h ${m}m`)
    }

    update()
    const interval = setInterval(update, 30000)
    return () => clearInterval(interval)
  }, [activeCheckin])

  const loadActiveCheckin = async () => {
    try {
      setLoading(true)
      const checkins = await safetyService.getDateCheckins()
      const pending = checkins.find((c) => c.status === 'PENDING')
      setActiveCheckin(pending || null)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCheckin = async () => {
    if (!dateTime) return
    setCreating(true)
    setCreateSuccess(false)
    try {
      const checkin = await safetyService.createDateCheckin({
        scheduledFor: new Date(dateTime).toISOString(),
        trustedContactEmail: trustedEmail || undefined,
      })
      setActiveCheckin(checkin)
      setCreateSuccess(true)
      setDateTime('')
      setTrustedEmail('')
      setTimeout(() => setCreateSuccess(false), 3000)
    } catch {
      // silent
    } finally {
      setCreating(false)
    }
  }

  const handleSafeResponse = async () => {
    if (!activeCheckin) return
    try {
      await safetyService.respondToDateCheckin(activeCheckin.id)
      setActiveCheckin({ ...activeCheckin, status: 'SAFE', respondedAt: new Date().toISOString() })
    } catch {
      // silent
    }
  }

  const handleMoodSubmit = async () => {
    if (!selectedMood) return
    setMoodSubmitting(true)
    setMoodSuggestion(null)
    try {
      const result = await safetyService.createMoodCheckin(selectedMood, moodNote || undefined)
      if (result.suggestion) {
        setMoodSuggestion(result.suggestion)
      } else {
        setMoodSaved(true)
        setTimeout(() => {
          setMoodSaved(false)
          setSelectedMood(null)
          setMoodNote('')
        }, 2000)
      }
    } catch {
      // silent
    } finally {
      setMoodSubmitting(false)
    }
  }

  const handleSnooze = async (days: number) => {
    setSnoozing(true)
    try {
      await safetyService.snoozeProfile(days)
      setSnoozed(true)
      setMoodSuggestion(null)
      setTimeout(() => setSnoozed(false), 3000)
    } catch {
      // silent
    } finally {
      setSnoozing(false)
    }
  }

  // Default datetime = next hour from now
  const getDefaultDateTime = () => {
    const d = new Date()
    d.setHours(d.getHours() + 1, 0, 0, 0)
    return d.toISOString().slice(0, 16)
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

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E1F5EE' }}>
                  <Shield className="w-5 h-5" style={{ color: '#2D5C4F' }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: '#2D5C4F' }}>Safe Space</h2>
                  <p className="text-xs" style={{ color: '#8A8578' }}>Your safety, always</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="px-5 pb-8 space-y-5">
              {/* ══════ Date Check-in ══════ */}
              <section className="rounded-2xl border p-4" style={{ borderColor: '#E1F5EE' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4" style={{ color: '#2D5C4F' }} />
                  <h3 className="font-bold text-sm" style={{ color: '#2D5C4F' }}>Going on a date?</h3>
                </div>

                {/* Active check-in card */}
                {activeCheckin && activeCheckin.status === 'PENDING' && (
                  <div className="rounded-xl p-3 mb-3" style={{ backgroundColor: '#E1F5EE' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4" style={{ color: '#2D5C4F' }} />
                      <span className="text-sm font-semibold" style={{ color: '#2D5C4F' }}>{countdown}</span>
                    </div>
                    <button
                      onClick={handleSafeResponse}
                      className="w-full py-3 rounded-xl text-white font-bold text-base transition-all active:scale-[0.98]"
                      style={{ backgroundColor: '#2D5C4F', boxShadow: '0 4px 14px rgba(45, 92, 79, 0.3)' }}
                    >
                      I'm safe! \uD83D\uDC9A
                    </button>
                  </div>
                )}

                {activeCheckin?.status === 'SAFE' && (
                  <div className="flex items-center gap-2 rounded-xl p-3 mb-3" style={{ backgroundColor: '#E1F5EE' }}>
                    <CheckCircle className="w-4 h-4" style={{ color: '#4A9E6E' }} />
                    <span className="text-sm font-semibold" style={{ color: '#4A9E6E' }}>You checked in safe</span>
                  </div>
                )}

                {/* Create new check-in */}
                {(!activeCheckin || activeCheckin.status !== 'PENDING') && (
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-xs font-semibold block mb-1" style={{ color: '#6B7B75' }}>Date & time</label>
                      <input
                        type="datetime-local"
                        value={dateTime || getDefaultDateTime()}
                        onChange={(e) => setDateTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border text-sm"
                        style={{ borderColor: '#E1F5EE' }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1" style={{ color: '#6B7B75' }}>
                        Trusted contact email <span className="font-normal">(optional)</span>
                      </label>
                      <input
                        type="email"
                        value={trustedEmail}
                        onChange={(e) => setTrustedEmail(e.target.value)}
                        placeholder="friend@email.com"
                        className="w-full px-3 py-2 rounded-xl border text-sm"
                        style={{ borderColor: '#E1F5EE' }}
                      />
                    </div>
                    <button
                      onClick={handleCreateCheckin}
                      disabled={creating}
                      className="w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-50"
                      style={{ backgroundColor: '#2D5C4F' }}
                    >
                      {creating ? (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      ) : createSuccess ? (
                        <span className="flex items-center justify-center gap-1.5"><CheckCircle className="w-4 h-4" /> Reminder set!</span>
                      ) : (
                        'Set check-in reminder'
                      )}
                    </button>
                  </div>
                )}
              </section>

              {/* ══════ Mood Check-in ══════ */}
              <section className="rounded-2xl border p-4" style={{ borderColor: '#E1F5EE' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-4 h-4" style={{ color: '#E8735A' }} />
                  <h3 className="font-bold text-sm" style={{ color: '#2D5C4F' }}>How are you feeling about dating this week?</h3>
                </div>

                <div className="grid grid-cols-5 gap-1.5 mb-3">
                  {MOOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.mood}
                      onClick={() => setSelectedMood(opt.mood)}
                      className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-center transition-all ${
                        selectedMood === opt.mood
                          ? 'ring-2 scale-105'
                          : 'hover:bg-gray-50'
                      }`}
                      style={{
                        outlineColor: selectedMood === opt.mood ? '#2D5C4F' : undefined,
                        backgroundColor: selectedMood === opt.mood ? '#E1F5EE' : undefined,
                      }}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className="text-[10px] font-semibold leading-tight" style={{ color: '#6B7B75' }}>
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>

                {selectedMood && !moodSuggestion && !moodSaved && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="space-y-2"
                  >
                    <textarea
                      value={moodNote}
                      onChange={(e) => setMoodNote(e.target.value)}
                      placeholder="Any thoughts? (optional)"
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl border text-sm resize-none"
                      style={{ borderColor: '#E1F5EE' }}
                    />
                    <button
                      onClick={handleMoodSubmit}
                      disabled={moodSubmitting}
                      className="w-full py-2 rounded-xl text-white font-semibold text-sm disabled:opacity-50"
                      style={{ backgroundColor: '#2D5C4F' }}
                    >
                      {moodSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save'}
                    </button>
                  </motion.div>
                )}

                {moodSaved && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-sm font-semibold"
                    style={{ color: '#4A9E6E' }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Saved! Take care of yourself.
                  </motion.div>
                )}

                {/* Snooze suggestion */}
                {moodSuggestion && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-3 mt-2"
                    style={{ backgroundColor: '#FAEEDA' }}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <Pause className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#D4A843' }} />
                      <p className="text-sm" style={{ color: '#6B5B3A' }}>{moodSuggestion}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSnooze(3)}
                        disabled={snoozing}
                        className="flex-1 py-2 rounded-xl text-white font-semibold text-xs disabled:opacity-50"
                        style={{ backgroundColor: '#D4A843' }}
                      >
                        {snoozing ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Snooze 3 days'}
                      </button>
                      <button
                        onClick={() => { setMoodSuggestion(null); setSelectedMood(null) }}
                        className="flex-1 py-2 rounded-xl border text-xs font-semibold"
                        style={{ borderColor: '#D4A843', color: '#6B5B3A' }}
                      >
                        Not now
                      </button>
                    </div>
                    {snoozed && (
                      <p className="text-xs text-center mt-2 font-semibold" style={{ color: '#4A9E6E' }}>
                        Profile snoozed. Rest up!
                      </p>
                    )}
                  </motion.div>
                )}
              </section>

              {/* ══════ Safety Tips ══════ */}
              <section className="rounded-2xl border p-4" style={{ borderColor: '#E1F5EE' }}>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4" style={{ color: '#D4A843' }} />
                  <h3 className="font-bold text-sm" style={{ color: '#2D5C4F' }}>Quick safety tips</h3>
                </div>

                <div className="space-y-1">
                  {SAFETY_TIPS.map((tip, i) => (
                    <div key={i}>
                      <button
                        onClick={() => setExpandedTip(expandedTip === i ? null : i)}
                        className="w-full flex items-center justify-between py-2.5 text-left"
                      >
                        <span className="text-sm font-semibold" style={{ color: '#2B2B2B' }}>{tip.title}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${expandedTip === i ? 'rotate-180' : ''}`}
                          style={{ color: '#9FCFBF' }}
                        />
                      </button>
                      <AnimatePresence>
                        {expandedTip === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="text-xs pb-2.5 leading-relaxed" style={{ color: '#6B7B75' }}>
                              {tip.body}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {i < SAFETY_TIPS.length - 1 && <div className="h-px" style={{ backgroundColor: '#E1F5EE' }} />}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
