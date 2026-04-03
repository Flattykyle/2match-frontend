import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Loader2, Upload, X, Mic, Square,
  Play, Pause, ChevronDown, Check, Sparkles, ArrowRight, ArrowLeft,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { useAuthStore } from '../store/authStore'
import {
  useOnboardingStore,
  TOTAL_STEPS,
  type OnboardingData,
} from '../store/onboardingStore'
import { uploadProfilePhoto, deleteProfilePhoto } from '../services/profileService'
import { voiceIntroService } from '../services/voiceIntroService'
import { vibeTagService, type VibeTag, type VibeTagsGrouped } from '../services/vibeTagService'
import api from '../services/api'
import { useDropzone } from 'react-dropzone'

/* ═══════════════════════════════════════════════════════════════
   Shared animation variants
   ═══════════════════════════════════════════════════════════════ */

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
}

/* ═══════════════════════════════════════════════════════════════
   Step wrapper — provides heading + description
   ═══════════════════════════════════════════════════════════════ */

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Shared input classes
   ═══════════════════════════════════════════════════════════════ */

const inputCls = [
  'w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200',
  'border-primary-sage/30 focus:border-primary-forest focus:outline-none',
  'bg-white dark:bg-[var(--color-surface-raised)]',
  'text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)]',
  'dark:border-primary-sage/15 dark:focus:border-primary-sage',
].join(' ')

/* ═══════════════════════════════════════════════════════════════
   Step 0 — Basics
   ═══════════════════════════════════════════════════════════════ */

const GENDER_OPTIONS = ['Man', 'Woman', 'Non-binary', 'Prefer not to say']

function StepBasics() {
  const { data, update } = useOnboardingStore()
  const { user } = useAuthStore()
  const [locLoading, setLocLoading] = useState(false)
  const [locError, setLocError] = useState('')

  // Pre-fill from registration
  useEffect(() => {
    if (user && !data.firstName) {
      update({ firstName: user.firstName, lastName: user.lastName })
    }
  }, [user, data.firstName, update])

  const handleGPS = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation not supported')
      return
    }
    setLocLoading(true)
    setLocError('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=10`
          )
          const d = await res.json()
          update({
            locationCity: d.address.city || d.address.town || d.address.village || '',
            locationCountry: d.address.country || '',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          })
        } catch {
          setLocError('Could not resolve location')
        } finally {
          setLocLoading(false)
        }
      },
      () => {
        setLocError('Location access denied')
        setLocLoading(false)
      }
    )
  }

  const showCustomGender = data.gender !== '' && !GENDER_OPTIONS.includes(data.gender)

  return (
    <StepShell title="The basics" subtitle="Let's get to know you.">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">First name</label>
          <input className={inputCls} value={data.firstName} onChange={(e) => update({ firstName: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Last name</label>
          <input className={inputCls} value={data.lastName} onChange={(e) => update({ lastName: e.target.value })} />
        </div>
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Gender</label>
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => update({ gender: g, genderCustom: '' })}
              className={[
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                data.gender === g
                  ? 'bg-primary-forest text-white shadow-forest-glow'
                  : 'bg-neutral-warmWhite dark:bg-[var(--color-surface-raised)] text-[var(--color-text)] border border-primary-sage/30 dark:border-primary-sage/15',
              ].join(' ')}
            >
              {g}
            </button>
          ))}
          <button
            type="button"
            onClick={() => update({ gender: data.genderCustom || 'custom' })}
            className={[
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              showCustomGender
                ? 'bg-primary-forest text-white shadow-forest-glow'
                : 'bg-neutral-warmWhite dark:bg-[var(--color-surface-raised)] text-[var(--color-text)] border border-primary-sage/30 dark:border-primary-sage/15',
            ].join(' ')}
          >
            I identify as...
          </button>
        </div>
        {showCustomGender && (
          <input
            className={`${inputCls} mt-2`}
            placeholder="Type your gender identity"
            value={data.genderCustom}
            onChange={(e) => update({ gender: e.target.value, genderCustom: e.target.value })}
          />
        )}
      </div>

      {/* Pronouns */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
          Pronouns <span className="text-[var(--color-text-tertiary)]">(optional)</span>
        </label>
        <input className={inputCls} placeholder="e.g. she/her, they/them" value={data.pronouns} onChange={(e) => update({ pronouns: e.target.value })} />
      </div>

      {/* Location */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Location</label>
        <button
          type="button"
          onClick={handleGPS}
          disabled={locLoading}
          className={[
            'w-full px-4 py-3 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2',
            'border-primary-sage/30 dark:border-primary-sage/15',
            'hover:border-primary-forest dark:hover:border-primary-sage',
            'text-[var(--color-text-secondary)]',
          ].join(' ')}
        >
          {locLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
          {locLoading ? 'Getting location...' : 'Use my current location'}
        </button>
        {locError && <p className="text-sm text-danger">{locError}</p>}

        <div className="grid grid-cols-2 gap-3">
          <input className={inputCls} placeholder="City" value={data.locationCity} onChange={(e) => update({ locationCity: e.target.value })} />
          <input className={inputCls} placeholder="Country" value={data.locationCountry} onChange={(e) => update({ locationCountry: e.target.value })} />
        </div>
      </div>
    </StepShell>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Step 1 — Photos
   ═══════════════════════════════════════════════════════════════ */

function StepPhotos() {
  const { data, update } = useOnboardingStore()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const onDrop = useCallback(
    async (files: File[]) => {
      if (data.photos.length >= 6) return
      const file = files[0]
      if (!file) return
      if (file.size > 5 * 1024 * 1024) { setError('Max 5 MB'); return }
      setError('')
      setUploading(true)
      try {
        const res = await uploadProfilePhoto(file)
        update({ photos: [...data.photos, res.url] })
      } catch (err: any) {
        setError(err.response?.data?.message || 'Upload failed')
      } finally {
        setUploading(false)
      }
    },
    [data.photos, update]
  )

  const handleDelete = async (idx: number) => {
    const url = data.photos[idx]
    try {
      await deleteProfilePhoto(url)
    } catch { /* best effort */ }
    update({ photos: data.photos.filter((_, i) => i !== idx) })
  }

  const handleReorder = (from: number, to: number) => {
    const next = [...data.photos]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    update({ photos: next })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxFiles: 1,
    disabled: data.photos.length >= 6 || uploading,
  })

  return (
    <StepShell title="Add photos" subtitle="Upload 2–6 photos. Drag to reorder.">
      <div className="grid grid-cols-3 gap-3">
        {data.photos.map((url, i) => (
          <div
            key={url}
            className="relative aspect-square rounded-xl overflow-hidden group"
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', String(i))}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const from = parseInt(e.dataTransfer.getData('text/plain'))
              if (from !== i) handleReorder(from, i)
            }}
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
            {i === 0 && (
              <span className="absolute top-1.5 left-1.5 text-[10px] font-bold bg-primary-forest text-white px-2 py-0.5 rounded-full">
                Primary
              </span>
            )}
            <button
              onClick={() => handleDelete(i)}
              className="absolute top-1.5 right-1.5 p-1 bg-danger text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {data.photos.length < 6 && (
          <div
            {...getRootProps()}
            className={[
              'aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all',
              isDragActive
                ? 'border-primary-forest bg-primary-light'
                : 'border-primary-sage/30 dark:border-primary-sage/15 hover:border-primary-forest',
              uploading ? 'opacity-50 cursor-wait' : '',
            ].join(' ')}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <Loader2 className="w-7 h-7 text-primary-forest animate-spin" />
            ) : (
              <>
                <Upload className="w-7 h-7 text-[var(--color-text-tertiary)] mb-1" />
                <span className="text-xs text-[var(--color-text-tertiary)]">{data.photos.length}/6</span>
              </>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <p className="text-xs text-[var(--color-text-tertiary)] bg-primary-light/50 dark:bg-primary-forest/10 rounded-lg px-3 py-2">
        Your first 3 photos will be blurred for new matches — they unlock as you connect.
      </p>
    </StepShell>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Step 2 — Voice Memo
   ═══════════════════════════════════════════════════════════════ */

const BAR_COUNT = 28
const MAX_DURATION = 45

function StepVoiceMemo() {
  const { data, update } = useOnboardingStore()
  const [state, setState] = useState<'idle' | 'recording' | 'recorded' | 'uploading' | 'done'>(
    data.voiceMemoUrl ? 'done' : 'idle'
  )
  const [timer, setTimer] = useState(0)
  const [error, setError] = useState('')
  const mediaRecRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval>>()
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animRef = useRef<number>()
  const [bars, setBars] = useState<number[]>(Array(BAR_COUNT).fill(4))
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const blobRef = useRef<Blob | null>(null)

  const startRecording = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const ctx = new AudioContext()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      source.connect(analyser)
      analyserRef.current = analyser

      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      chunksRef.current = []
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        ctx.close()
        blobRef.current = new Blob(chunksRef.current, { type: 'audio/webm' })
        setState('recorded')
      }
      mediaRecRef.current = mr
      mr.start(250)
      setState('recording')
      setTimer(0)

      timerRef.current = setInterval(() => {
        setTimer((t) => {
          if (t + 1 >= MAX_DURATION) { mr.stop(); clearInterval(timerRef.current!) }
          return t + 1
        })
      }, 1000)

      // Animate bars
      const tick = () => {
        if (!analyserRef.current) return
        const buf = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(buf)
        const newBars = Array.from({ length: BAR_COUNT }, (_, i) => {
          const idx = Math.floor((i / BAR_COUNT) * buf.length)
          return 4 + (buf[idx] / 255) * 24
        })
        setBars(newBars)
        animRef.current = requestAnimationFrame(tick)
      }
      animRef.current = requestAnimationFrame(tick)
    } catch {
      setError('Microphone access denied')
    }
  }

  const stopRecording = () => {
    mediaRecRef.current?.stop()
    clearInterval(timerRef.current!)
    if (animRef.current) cancelAnimationFrame(animRef.current)
    setBars(Array(BAR_COUNT).fill(4))
  }

  const uploadMemo = async () => {
    if (!blobRef.current) return
    setState('uploading')
    try {
      const res = await voiceIntroService.upload(blobRef.current)
      update({ voiceMemoUrl: res.voiceIntroUrl, voiceMemoDuration: res.voiceIntroDuration })
      setState('done')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed')
      setState('recorded')
    }
  }

  const discard = () => {
    blobRef.current = null
    setState('idle')
    setTimer(0)
  }

  const togglePlay = () => {
    if (!blobRef.current && !data.voiceMemoUrl) return
    if (playing) {
      audioRef.current?.pause()
      setPlaying(false)
      return
    }
    const url = data.voiceMemoUrl || (blobRef.current ? URL.createObjectURL(blobRef.current) : '')
    if (!audioRef.current) audioRef.current = new Audio()
    audioRef.current.src = url
    audioRef.current.onended = () => setPlaying(false)
    audioRef.current.play()
    setPlaying(true)
  }

  useEffect(() => () => {
    clearInterval(timerRef.current!)
    if (animRef.current) cancelAnimationFrame(animRef.current)
    audioRef.current?.pause()
  }, [])

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <StepShell title="Voice memo" subtitle="Record a 45-second intro — let them hear your vibe.">
      <div className="rounded-2xl bg-primary-light/50 dark:bg-primary-forest/10 p-5 space-y-4">
        {/* Waveform */}
        <div className="flex items-center justify-center gap-[2px] h-10">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              className="w-[3px] rounded-full bg-primary-forest dark:bg-primary-sage"
              animate={{ height: h }}
              transition={{ duration: 0.1 }}
            />
          ))}
        </div>

        {/* Timer */}
        <p className="text-center text-lg font-mono tabular-nums text-[var(--color-text)]">
          {fmtTime(timer)} <span className="text-[var(--color-text-tertiary)]">/ {fmtTime(MAX_DURATION)}</span>
        </p>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {state === 'idle' && (
            <button onClick={startRecording} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-forest text-white font-semibold hover:bg-primary-forest/90 transition-colors">
              <Mic className="w-5 h-5" /> Start recording
            </button>
          )}
          {state === 'recording' && (
            <button onClick={stopRecording} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-danger text-white font-semibold">
              <Square className="w-4 h-4 fill-current" /> Stop
            </button>
          )}
          {state === 'recorded' && (
            <>
              <button onClick={togglePlay} className="p-3 rounded-full bg-primary-forest text-white">
                {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button onClick={uploadMemo} className="px-5 py-2.5 rounded-xl bg-primary-forest text-white font-semibold hover:bg-primary-forest/90 transition-colors">
                Save
              </button>
              <button onClick={discard} className="px-4 py-2.5 rounded-xl text-[var(--color-text-secondary)] font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                Re-record
              </button>
            </>
          )}
          {state === 'uploading' && (
            <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
              <Loader2 className="w-5 h-5 animate-spin" /> Uploading...
            </div>
          )}
          {state === 'done' && (
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="p-3 rounded-full bg-primary-forest text-white">
                {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <span className="text-sm text-success font-medium flex items-center gap-1">
                <Check className="w-4 h-4" /> Saved
              </span>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-danger text-center">{error}</p>}
      </div>
    </StepShell>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Step 3 — Your Story (prompts)
   ═══════════════════════════════════════════════════════════════ */

const PROMPT_QUESTIONS = [
  'The way to my heart is...',
  "I'll know it's a match if...",
  'My most controversial opinion is...',
  'A perfect Sunday looks like...',
  "I'm looking for someone who...",
  'My love language is...',
  "Two truths and a lie about me...",
  'The last thing that made me laugh out loud...',
  'My biggest green flag is...',
  "I'm secretly really good at...",
  'My comfort movie is...',
  "I can't stop talking about...",
  'My friends would describe me as...',
  'The most spontaneous thing I have ever done...',
  'If I could live anywhere for a year...',
  "I'm convinced I was born in the wrong era because...",
  'The quickest way to make me smile is...',
  'My hidden talent is...',
  "I'll pick the restaurant if you...",
  'After work you can find me...',
]

function StepYourStory() {
  const { data, update } = useOnboardingStore()
  const prompts = data.prompts.length ? data.prompts : [
    { question: '', answer: '' },
    { question: '', answer: '' },
    { question: '', answer: '' },
  ]

  const setPrompt = (idx: number, field: 'question' | 'answer', value: string) => {
    const next = [...prompts]
    next[idx] = { ...next[idx], [field]: value }
    update({ prompts: next })
  }

  // Questions already picked by other prompts
  const usedQuestions = new Set(prompts.map((p) => p.question).filter(Boolean))

  return (
    <StepShell title="Your story" subtitle="Pick 3 prompts and share your answers.">
      <div className="space-y-5">
        {prompts.map((p, i) => (
          <div key={i} className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">Prompt {i + 1}</label>

            <div className="relative">
              <select
                value={p.question}
                onChange={(e) => setPrompt(i, 'question', e.target.value)}
                className={`${inputCls} appearance-none pr-10`}
              >
                <option value="">Choose a prompt...</option>
                {PROMPT_QUESTIONS.map((q) => (
                  <option key={q} value={q} disabled={usedQuestions.has(q) && p.question !== q}>
                    {q}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[var(--color-text-tertiary)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {p.question && (
              <div>
                <textarea
                  value={p.answer}
                  onChange={(e) => setPrompt(i, 'answer', e.target.value)}
                  placeholder="Write your answer..."
                  rows={3}
                  maxLength={300}
                  className={`${inputCls} resize-none font-serif`}
                />
                {/* Live preview */}
                {p.answer && (
                  <div className="mt-2 px-4 py-3 rounded-xl bg-neutral-warmWhite dark:bg-[var(--color-surface-sunken)]">
                    <p className="text-xs text-[var(--color-text-tertiary)] mb-1">{p.question}</p>
                    <p className="font-serif text-base leading-relaxed text-[var(--color-text)]">{p.answer}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </StepShell>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Step 4 — Flags
   ═══════════════════════════════════════════════════════════════ */

function StepFlags() {
  const { data, update } = useOnboardingStore()

  return (
    <StepShell title="Your flags" subtitle="Be honest — vulnerability is attractive.">
      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium text-[var(--color-text-secondary)] block mb-1">🟢 My green flag</label>
          <input
            className={inputCls}
            placeholder="e.g. I always remember the little things"
            value={data.greenFlag}
            onChange={(e) => update({ greenFlag: e.target.value })}
            maxLength={120}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-[var(--color-text-secondary)] block mb-1">🔴 A red flag I'm working on</label>
          <input
            className={inputCls}
            placeholder="e.g. I'm terrible at replying on time"
            value={data.redFlag}
            onChange={(e) => update({ redFlag: e.target.value })}
            maxLength={120}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-[var(--color-text-secondary)] block mb-1">
            Currently obsessed with <span className="text-[var(--color-text-tertiary)]">(optional)</span>
          </label>
          <input
            className={inputCls}
            placeholder="e.g. Sourdough baking, The Bear, trail running"
            value={data.currentlyObsessedWith}
            onChange={(e) => update({ currentlyObsessedWith: e.target.value })}
            maxLength={100}
          />
        </div>
      </div>
    </StepShell>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Step 5 — Vibe Tags
   ═══════════════════════════════════════════════════════════════ */

const CATEGORY_LABELS: Record<string, string> = {
  LIFESTYLE: '🌿 Lifestyle',
  PERSONALITY: '✨ Personality',
  INTERESTS: '🎯 Interests',
  VALUES: '💛 Values',
}

function StepVibeTags() {
  const { data, update } = useOnboardingStore()
  const [tags, setTags] = useState<VibeTagsGrouped>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    vibeTagService.getAll().then(setTags).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const toggle = (id: string) => {
    const selected = data.vibeTagIds
    if (selected.includes(id)) {
      update({ vibeTagIds: selected.filter((x) => x !== id) })
    } else if (selected.length < 5) {
      update({ vibeTagIds: [...selected, id] })
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-forest" /></div>

  return (
    <StepShell title="Your vibe" subtitle={`Pick 3–5 tags that describe you. (${data.vibeTagIds.length}/5 selected)`}>
      <div className="space-y-5">
        {(Object.entries(tags) as [string, VibeTag[]][]).map(([cat, list]) => {
          if (!list || list.length === 0) return null
          return (
            <div key={cat}>
              <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                {CATEGORY_LABELS[cat] || cat}
              </h3>
              <div className="flex flex-wrap gap-2">
                {list.map((tag) => {
                  const active = data.vibeTagIds.includes(tag.id)
                  return (
                    <motion.button
                      key={tag.id}
                      type="button"
                      onClick={() => toggle(tag.id)}
                      whileTap={{ scale: 0.92 }}
                      animate={active ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 0.25 }}
                      className={[
                        'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                        active
                          ? 'bg-primary-forest text-white shadow-forest-glow'
                          : 'bg-neutral-warmWhite dark:bg-[var(--color-surface-raised)] text-[var(--color-text)] border border-primary-sage/30 dark:border-primary-sage/15',
                      ].join(' ')}
                    >
                      <span>{tag.emoji}</span>
                      <span>{tag.label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </StepShell>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Step 6 — Intention
   ═══════════════════════════════════════════════════════════════ */

const INTENTIONS = [
  { value: 'SERIOUS', emoji: '💚', label: 'Serious', desc: 'Looking for a long-term relationship' },
  { value: 'CASUAL', emoji: '☀️', label: 'Casual', desc: 'Keeping things fun and light' },
  { value: 'FRIENDS_FIRST', emoji: '🌱', label: 'Friends first', desc: 'Build a friendship, see where it goes' },
  { value: 'OPEN', emoji: '✨', label: 'Open', desc: "I'm open to whatever feels right" },
  { value: 'EXPLORING', emoji: '🔮', label: 'Exploring', desc: 'Just here to meet new people' },
]

function StepIntention() {
  const { data, update } = useOnboardingStore()

  return (
    <StepShell title="Your intention" subtitle="What are you here for?">
      <div className="space-y-3">
        {INTENTIONS.map((opt) => {
          const active = data.intention === opt.value
          return (
            <motion.button
              key={opt.value}
              type="button"
              onClick={() => update({ intention: opt.value })}
              whileTap={{ scale: 0.97 }}
              className={[
                'w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-left transition-all',
                active
                  ? 'bg-primary-forest text-white shadow-forest-glow'
                  : 'bg-neutral-warmWhite dark:bg-[var(--color-surface-raised)] text-[var(--color-text)] border border-primary-sage/30 dark:border-primary-sage/15',
              ].join(' ')}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <div>
                <p className="font-semibold">{opt.label}</p>
                <p className={`text-sm ${active ? 'text-white/70' : 'text-[var(--color-text-tertiary)]'}`}>{opt.desc}</p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </StepShell>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Step 7 — Slow Burn
   ═══════════════════════════════════════════════════════════════ */

function StepSlowBurn() {
  const { data, update } = useOnboardingStore()

  return (
    <StepShell title="Slow Burn Mode" subtitle="Take your time — good things take a moment.">
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => update({ slowBurnEnabled: !data.slowBurnEnabled })}
          className={[
            'w-full flex items-center justify-between px-5 py-5 rounded-2xl transition-all',
            data.slowBurnEnabled
              ? 'bg-primary-forest text-white shadow-forest-glow'
              : 'bg-neutral-warmWhite dark:bg-[var(--color-surface-raised)] text-[var(--color-text)] border border-primary-sage/30 dark:border-primary-sage/15',
          ].join(' ')}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🕯️</span>
            <div className="text-left">
              <p className="font-semibold">Enable Slow Burn</p>
              <p className={`text-sm ${data.slowBurnEnabled ? 'text-white/70' : 'text-[var(--color-text-tertiary)]'}`}>
                Chat unlocks after 3 prompt exchanges
              </p>
            </div>
          </div>
          <div className={[
            'w-12 h-7 rounded-full p-0.5 transition-colors',
            data.slowBurnEnabled ? 'bg-white/30' : 'bg-black/10 dark:bg-white/10',
          ].join(' ')}>
            <motion.div
              className="w-6 h-6 rounded-full bg-white shadow"
              animate={{ x: data.slowBurnEnabled ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </div>
        </button>

        <div className="rounded-xl bg-accent-warm/50 dark:bg-accent-terracotta/10 p-4 text-sm text-[var(--color-text-secondary)] space-y-2">
          <p className="font-medium text-[var(--color-text)]">Why Slow Burn?</p>
          <ul className="space-y-1">
            <li>• Photos reveal gradually — builds anticipation</li>
            <li>• Deeper conversations before small talk</li>
            <li>• Fewer ghosting, more genuine connections</li>
          </ul>
        </div>
      </div>
    </StepShell>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Step 8 — Done!
   ═══════════════════════════════════════════════════════════════ */

function StepDone() {
  const hasFired = useRef(false)

  useEffect(() => {
    if (hasFired.current) return
    hasFired.current = true
    const colors = ['#2D5C4F', '#9FCFBF', '#E8735A', '#FAEEDA', '#F5EDD8']
    confetti({ particleCount: 80, spread: 70, origin: { x: 0.25, y: 0.6 }, colors, startVelocity: 40 })
    confetti({ particleCount: 80, spread: 70, origin: { x: 0.75, y: 0.6 }, colors, startVelocity: 40 })
    setTimeout(() => {
      confetti({ particleCount: 50, spread: 100, origin: { x: 0.5, y: 0.3 }, colors, startVelocity: 25 })
    }, 350)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center text-center py-8 space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.2 }}
        className="w-24 h-24 rounded-full bg-primary-forest flex items-center justify-center shadow-forest-glow"
      >
        <Sparkles className="w-10 h-10 text-white" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h2 className="text-3xl font-semibold text-[var(--color-text)]">You're ready!</h2>
        <p className="mt-2 text-[var(--color-text-secondary)]">
          Your picks are being curated...
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex items-center gap-2 text-sm text-[var(--color-text-tertiary)]"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Redirecting to your feed
      </motion.div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Step validation
   ═══════════════════════════════════════════════════════════════ */

function canAdvance(step: number, data: OnboardingData): boolean {
  switch (step) {
    case 0: return !!data.firstName.trim() && !!data.gender && (!!data.locationCity.trim() || !!data.latitude)
    case 1: return data.photos.length >= 2
    case 2: return true // voice is optional
    case 3: {
      const filled = data.prompts.filter((p) => p.question && p.answer.trim())
      return filled.length >= 3
    }
    case 4: return !!data.greenFlag.trim() && !!data.redFlag.trim()
    case 5: return data.vibeTagIds.length >= 3 && data.vibeTagIds.length <= 5
    case 6: return !!data.intention
    case 7: return true // slow burn has a default
    case 8: return true
    default: return false
  }
}

/* ═══════════════════════════════════════════════════════════════
   Main Onboarding page
   ═══════════════════════════════════════════════════════════════ */

const STEP_COMPONENTS = [
  StepBasics,
  StepPhotos,
  StepVoiceMemo,
  StepYourStory,
  StepFlags,
  StepVibeTags,
  StepIntention,
  StepSlowBurn,
  StepDone,
]

const Onboarding = () => {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const { step, data, next, back, reset } = useOnboardingStore()
  const [dir, setDir] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const StepComponent = STEP_COMPONENTS[step]
  const isLast = step === TOTAL_STEPS - 1
  const isSecondToLast = step === TOTAL_STEPS - 2
  const valid = canAdvance(step, data)

  const submitProfile = async () => {
    setSubmitting(true)
    setError('')
    try {
      const body = {
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        pronouns: data.pronouns || undefined,
        locationCity: data.locationCity,
        locationCountry: data.locationCountry,
        latitude: data.latitude,
        longitude: data.longitude,
        profilePrompts: data.prompts.filter((p) => p.question && p.answer.trim()),
        greenFlag: data.greenFlag,
        redFlag: data.redFlag,
        currentlyObsessedWith: data.currentlyObsessedWith || undefined,
        intention: data.intention,
        slowModeEnabled: data.slowBurnEnabled,
        vibeTagIds: data.vibeTagIds,
      }

      const res = await api.patch<{ user: any }>('/users/complete-profile', body)
      setUser(res.data.user)

      // Advance to the Done step
      setDir(1)
      next()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong')
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    if (isLast) {
      // Redirect from Done step
      reset()
      navigate('/discovery')
      return
    }
    if (isSecondToLast) {
      // Submit then show Done
      submitProfile()
      return
    }
    setDir(1)
    next()
  }

  const handleBack = () => {
    setDir(-1)
    back()
  }

  // Auto-redirect from Done step after 3 seconds
  useEffect(() => {
    if (step === TOTAL_STEPS - 1 && !submitting) {
      const t = setTimeout(() => { reset(); navigate('/discovery') }, 3000)
      return () => clearTimeout(t)
    }
  }, [step, submitting, navigate, reset])

  const progress = ((step + 1) / TOTAL_STEPS) * 100

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex flex-col">
      {/* Progress bar */}
      <div className="sticky top-0 z-30 bg-[var(--color-surface)]/95 backdrop-blur-md">
        <div className="h-1 bg-primary-sage/20 dark:bg-primary-sage/10">
          <motion.div
            className="h-full bg-primary-forest dark:bg-primary-sage rounded-r-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          />
        </div>
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-[var(--color-text-tertiary)]">
            Step {step + 1} of {TOTAL_STEPS}
          </span>
          {step > 0 && step < TOTAL_STEPS - 1 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6 overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <StepComponent />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      {!isLast && (
        <div className="sticky bottom-0 z-30 bg-[var(--color-surface)]/95 backdrop-blur-md border-t border-primary-sage/15 dark:border-primary-sage/10">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            {/* Skip on voice memo step */}
            {step === 2 && !data.voiceMemoUrl && (
              <button
                onClick={() => { setDir(1); next() }}
                className="text-sm text-[var(--color-text-secondary)] font-medium hover:text-[var(--color-text)] transition-colors"
              >
                Skip
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={!valid || submitting}
              className={[
                'ml-auto flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all',
                valid && !submitting
                  ? 'bg-primary-forest text-white hover:bg-primary-forest/90 shadow-forest-glow'
                  : 'bg-neutral-cream dark:bg-neutral-almostBlack text-[var(--color-text-tertiary)] cursor-not-allowed',
              ].join(' ')}
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
              ) : isSecondToLast ? (
                <><Check className="w-5 h-5" /> Finish</>
              ) : (
                <><span>Continue</span><ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </div>

          {error && (
            <div className="max-w-lg mx-auto px-4 pb-3">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Onboarding
