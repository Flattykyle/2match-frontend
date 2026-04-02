import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield,
  Eye,
  Phone,
  AlertTriangle,
  Loader2,
  CheckCircle,
  ChevronLeft,
  Zap,
  Clock,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { safetyService, SafetySettings } from '../services/safetyService'

/* ── Debounce helper ── */
function useDebouncedSave(
  saveFn: (data: Partial<SafetySettings>) => Promise<void>,
  delayMs: number = 800
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingRef = useRef<Partial<SafetySettings>>({})

  const debouncedSave = useCallback(
    (data: Partial<SafetySettings>) => {
      pendingRef.current = { ...pendingRef.current, ...data }
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        saveFn(pendingRef.current)
        pendingRef.current = {}
      }, delayMs)
    },
    [saveFn, delayMs]
  )

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        if (Object.keys(pendingRef.current).length > 0) {
          saveFn(pendingRef.current)
        }
      }
    }
  }, [saveFn])

  return debouncedSave
}

/* ── Main component ── */
const SafetySettingsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [settings, setSettings] = useState<SafetySettings>({
    slowModeEnabled: false,
    slowModeLimit: 5,
    activeHoursStart: null,
    activeHoursEnd: null,
    photoShieldEnabled: false,
    emergencyContactName: null,
    emergencyContactPhone: null,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // SOS state
  const [sosHolding, setSosHolding] = useState(false)
  const [sosProgress, setSosProgress] = useState(0)
  const [sosSending, setSosSending] = useState(false)
  const [sosResult, setSosResult] = useState<string | null>(null)
  const sosTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sosStartRef = useRef<number>(0)

  // Load settings
  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    const load = async () => {
      try {
        setLoading(true)
        const data = await safetyService.getSettings()
        setSettings(data)
      } catch {
        setError('Failed to load safety settings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, navigate])

  // Save function
  const performSave = useCallback(async (data: Partial<SafetySettings>) => {
    try {
      setSaving(true)
      await safetyService.updateSettings(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }, [])

  const debouncedSave = useDebouncedSave(performSave)

  // Update local state + trigger debounced save
  const updateSetting = <K extends keyof SafetySettings>(key: K, value: SafetySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    debouncedSave({ [key]: value })
  }

  // ── SOS hold-to-trigger ──
  const startSosHold = () => {
    setSosResult(null)
    setSosHolding(true)
    setSosProgress(0)
    sosStartRef.current = Date.now()

    sosTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - sosStartRef.current
      const progress = Math.min(elapsed / 3000, 1) // 3 second hold
      setSosProgress(progress)

      if (progress >= 1) {
        clearInterval(sosTimerRef.current!)
        sosTimerRef.current = null
        triggerSos()
      }
    }, 50)
  }

  const cancelSosHold = () => {
    if (sosTimerRef.current) {
      clearInterval(sosTimerRef.current)
      sosTimerRef.current = null
    }
    setSosHolding(false)
    setSosProgress(0)
  }

  const triggerSos = async () => {
    setSosHolding(false)
    setSosSending(true)
    try {
      const result = await safetyService.triggerSOS()
      setSosResult(result.message)
    } catch {
      setSosResult('SOS failed. Please call emergency services directly.')
    } finally {
      setSosSending(false)
    }
  }

  // Generate hour options
  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const label = i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`
    return { value: i, label }
  })

  if (!user) return null

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/settings')}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Comfort Zone</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Your safety, your rules</p>
        </div>
        {/* Save indicator */}
        <div className="ml-auto flex items-center gap-1.5">
          {saving && <Loader2 className="w-4 h-4 text-[var(--color-text-tertiary)] animate-spin" />}
          {saved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 text-green-600 text-sm font-semibold"
            >
              <CheckCircle className="w-4 h-4" />
              Saved
            </motion.div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* ═══════ Slow Mode ═══════ */}
        <section className="card">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[var(--color-text)]">Slow Mode</h3>
                <ToggleSwitch
                  checked={settings.slowModeEnabled}
                  onChange={(v) => updateSetting('slowModeEnabled', v)}
                />
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                Limit how many matches you get per day to avoid overwhelm
              </p>
            </div>
          </div>

          {settings.slowModeEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--color-text)]">Daily limit</span>
                <span className="text-sm font-bold text-[var(--color-primary)] bg-[var(--color-primary-50)] px-2.5 py-0.5 rounded-full">
                  {settings.slowModeLimit} matches/day
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={settings.slowModeLimit}
                onChange={(e) => updateSetting('slowModeLimit', Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[var(--color-primary)]"
              />
              <div className="flex justify-between text-xs text-[var(--color-text-tertiary)] mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </motion.div>
          )}
        </section>

        {/* ═══════ Active Hours ═══════ */}
        <section className="card">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-text)]">Active Hours</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                Messages sent outside these hours are held and delivered when you're active
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1 block">From</label>
              <select
                value={settings.activeHoursStart ?? ''}
                onChange={(e) => updateSetting('activeHoursStart', e.target.value === '' ? null : Number(e.target.value))}
                className="input-field text-sm"
              >
                <option value="">No limit</option>
                {hourOptions.map((h) => (
                  <option key={h.value} value={h.value}>{h.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1 block">To</label>
              <select
                value={settings.activeHoursEnd ?? ''}
                onChange={(e) => updateSetting('activeHoursEnd', e.target.value === '' ? null : Number(e.target.value))}
                className="input-field text-sm"
              >
                <option value="">No limit</option>
                {hourOptions.map((h) => (
                  <option key={h.value} value={h.value}>{h.label}</option>
                ))}
              </select>
            </div>
          </div>
          {settings.activeHoursStart != null && settings.activeHoursEnd != null && (
            <p className="text-xs text-[var(--color-text-tertiary)] mt-2">
              Messages will be delivered between {hourOptions[settings.activeHoursStart].label} and {hourOptions[settings.activeHoursEnd].label}
            </p>
          )}
        </section>

        {/* ═══════ Photo Shield ═══════ */}
        <section className="card">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
              <Eye className="w-5 h-5 text-purple-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[var(--color-text)]">Photo Shield</h3>
                <ToggleSwitch
                  checked={settings.photoShieldEnabled}
                  onChange={(v) => updateSetting('photoShieldEnabled', v)}
                />
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                Your photos are blurred until you match. Only matched users can see your full profile pictures.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════ Emergency Contact ═══════ */}
        <section className="card">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-text)]">Emergency Contact</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                Someone who will be notified if you trigger the SOS button
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1 block">Contact Name</label>
              <input
                type="text"
                value={settings.emergencyContactName || ''}
                onChange={(e) => updateSetting('emergencyContactName', e.target.value || null)}
                placeholder="e.g., Mom, Best Friend"
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1 block">Phone Number</label>
              <input
                type="tel"
                value={settings.emergencyContactPhone || ''}
                onChange={(e) => updateSetting('emergencyContactPhone', e.target.value || null)}
                placeholder="+1 (555) 000-0000"
                className="input-field text-sm"
              />
            </div>
          </div>
        </section>

        {/* ═══════ SOS Button ═══════ */}
        <section className="card border-2 border-red-100">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-bold text-red-600">Emergency SOS</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                Hold the button for 3 seconds to send your location to your emergency contact
              </p>
            </div>
          </div>

          {!settings.emergencyContactPhone ? (
            <p className="text-sm text-[var(--color-text-tertiary)] text-center py-2">
              Add an emergency contact above to enable SOS
            </p>
          ) : (
            <div className="relative">
              <motion.button
                onMouseDown={startSosHold}
                onMouseUp={cancelSosHold}
                onMouseLeave={cancelSosHold}
                onTouchStart={startSosHold}
                onTouchEnd={cancelSosHold}
                disabled={sosSending}
                className={[
                  'w-full py-4 rounded-2xl font-bold text-lg relative overflow-hidden transition-colors',
                  sosHolding
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100',
                ].join(' ')}
              >
                {/* Progress fill */}
                {sosHolding && (
                  <motion.div
                    className="absolute inset-0 bg-red-700 origin-left"
                    style={{ scaleX: sosProgress, transformOrigin: 'left' }}
                  />
                )}

                <span className="relative z-10 flex items-center justify-center gap-2">
                  {sosSending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending SOS...
                    </>
                  ) : sosHolding ? (
                    <>
                      <Shield className="w-5 h-5" />
                      Hold {Math.ceil(3 - sosProgress * 3)}s...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Hold for SOS
                    </>
                  )}
                </span>
              </motion.button>

              {sosResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-sm text-center font-semibold text-red-600 bg-red-50 rounded-xl p-3"
                >
                  {sosResult}
                </motion.div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

/* ── Toggle Switch sub-component ── */
interface ToggleSwitchProps {
  checked: boolean
  onChange: (value: boolean) => void
}

function ToggleSwitch({ checked, onChange }: ToggleSwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0',
        checked ? 'bg-[var(--color-primary)]' : 'bg-gray-200',
      ].join(' ')}
    >
      <motion.span
        className="inline-block h-5 w-5 rounded-full bg-white shadow-sm"
        animate={{ x: checked ? 22 : 3 }}
        transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

export default SafetySettingsPage
