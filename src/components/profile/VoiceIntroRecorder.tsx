import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, Square, Play, Pause, Trash2, Upload, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { voiceIntroService, VoiceIntroResponse } from '../../services/voiceIntroService'

/* ── Types ── */
type RecorderState = 'idle' | 'recording' | 'recorded' | 'uploading' | 'saved'

interface VoiceIntroRecorderProps {
  existingUrl?: string | null
  existingDuration?: number | null
  onSaved?: (data: VoiceIntroResponse) => void
  onDeleted?: () => void
  className?: string
}

const MAX_DURATION = 30
const BAR_COUNT = 32

/* ── Component ── */
export default function VoiceIntroRecorder({
  existingUrl,
  existingDuration,
  onSaved,
  onDeleted,
  className = '',
}: VoiceIntroRecorderProps) {
  const [state, setState] = useState<RecorderState>(existingUrl ? 'saved' : 'idle')
  const [elapsed, setElapsed] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(existingUrl || null)
  const [duration, setDuration] = useState<number>(existingDuration || 0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [error, setError] = useState('')
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [bars, setBars] = useState<number[]>(new Array(BAR_COUNT).fill(4))

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopEverything()
      if (audioUrl && audioUrl !== existingUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [])

  const stopEverything = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }

  // ── Waveform animation (during recording) ──
  const animateWaveform = useCallback(() => {
    const analyser = analyserRef.current
    if (!analyser) return

    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    const draw = () => {
      analyser.getByteFrequencyData(dataArray)
      const step = Math.floor(dataArray.length / BAR_COUNT)
      const newBars: number[] = []
      for (let i = 0; i < BAR_COUNT; i++) {
        const val = dataArray[i * step] / 255
        newBars.push(Math.max(4, val * 40))
      }
      setBars(newBars)
      animationRef.current = requestAnimationFrame(draw)
    }

    draw()
  }, [])

  // ── Start recording ──
  const startRecording = async () => {
    setError('')
    setPermissionDenied(false)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream

      // Web Audio API for waveform
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 128
      source.connect(analyser)
      analyserRef.current = analyser

      // MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'
      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setDuration(elapsed)
        setState('recorded')

        // Stop waveform animation
        if (animationRef.current) cancelAnimationFrame(animationRef.current)
        setBars(new Array(BAR_COUNT).fill(4))

        // Stop stream
        stream.getTracks().forEach((t) => t.stop())
        audioContext.close()
      }

      recorder.start(100) // Collect data every 100ms
      setState('recording')
      setElapsed(0)

      // Start timer
      const startTime = Date.now()
      timerRef.current = setInterval(() => {
        const secs = Math.floor((Date.now() - startTime) / 1000)
        setElapsed(secs)

        // Auto-stop at 30 seconds
        if (secs >= MAX_DURATION) {
          stopRecording()
        }
      }, 200)

      // Start waveform
      animateWaveform()
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true)
        setError('Microphone access denied. Please allow microphone access in your browser settings.')
      } else {
        setError('Could not start recording. Check your microphone.')
      }
    }
  }

  // ── Stop recording ──
  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  // auto-stop effect (elapsed is tracked via interval, but this ensures state stops)
  useEffect(() => {
    if (state === 'recording' && elapsed >= MAX_DURATION) {
      stopRecording()
    }
  }, [elapsed, state, stopRecording])

  // ── Playback ──
  const togglePlayback = () => {
    if (!audioUrl) return

    if (isPlaying && audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
      return
    }

    const audio = new Audio(audioUrl)
    audioRef.current = audio
    audio.ontimeupdate = () => setPlaybackTime(audio.currentTime)
    audio.onended = () => {
      setIsPlaying(false)
      setPlaybackTime(0)
    }
    audio.play()
    setIsPlaying(true)
  }

  // ── Upload ──
  const handleUpload = async () => {
    if (!audioBlob) return

    setState('uploading')
    setError('')

    try {
      const result = await voiceIntroService.upload(audioBlob)
      setAudioUrl(result.voiceIntroUrl)
      setDuration(result.voiceIntroDuration)
      setState('saved')
      onSaved?.(result)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed')
      setState('recorded')
    }
  }

  // ── Delete / Re-record ──
  const handleDelete = async () => {
    setError('')

    if (state === 'saved' && existingUrl) {
      try {
        await voiceIntroService.delete()
        onDeleted?.()
      } catch (err: any) {
        setError(err.response?.data?.message || 'Delete failed')
        return
      }
    }

    stopEverything()
    if (audioUrl && audioUrl !== existingUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
    setElapsed(0)
    setPlaybackTime(0)
    setIsPlaying(false)
    setState('idle')
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className={`card ${className}`}>
      <h3 className="text-lg font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
        <Mic className="w-5 h-5 text-[var(--color-primary)]" />
        Voice Intro
      </h3>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Permission denied help */}
      {permissionDenied && (
        <div className="bg-yellow-50 text-yellow-700 text-sm rounded-xl p-3 mb-4">
          To enable microphone access, click the lock/camera icon in your browser's address bar and allow microphone permissions, then refresh.
        </div>
      )}

      {/* ── Idle state ── */}
      {state === 'idle' && (
        <div className="text-center py-4">
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Record a {MAX_DURATION}-second voice intro so matches can hear your vibe
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={startRecording}
            className="w-16 h-16 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center mx-auto shadow-primary-glow hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            <Mic className="w-7 h-7" />
          </motion.button>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-2">Tap to record</p>
        </div>
      )}

      {/* ── Recording state ── */}
      {state === 'recording' && (
        <div className="text-center py-4">
          {/* Timer with pulsing red dot */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <motion.div
              className="w-3 h-3 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-2xl font-bold tabular-nums text-[var(--color-text)]">
              {formatTime(elapsed)}
            </span>
            <span className="text-sm text-[var(--color-text-tertiary)]">/ {formatTime(MAX_DURATION)}</span>
          </div>

          {/* Waveform bars */}
          <div className="flex items-center justify-center gap-[2px] h-12 mb-4">
            {bars.map((height, i) => (
              <motion.div
                key={i}
                className="w-1.5 rounded-full bg-[var(--color-primary)]"
                animate={{ height }}
                transition={{ duration: 0.1 }}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-gray-200 rounded-full mb-4 overflow-hidden">
            <motion.div
              className="h-full bg-red-500 rounded-full"
              style={{ width: `${(elapsed / MAX_DURATION) * 100}%` }}
            />
          </div>

          {/* Stop button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={stopRecording}
            className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center mx-auto shadow-lg hover:bg-red-600 transition-colors"
          >
            <Square className="w-5 h-5 fill-white" />
          </motion.button>
        </div>
      )}

      {/* ── Recorded state (preview) ── */}
      {state === 'recorded' && (
        <div className="py-4">
          {/* Playback controls */}
          <div className="flex items-center gap-3 mb-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={togglePlayback}
              className="w-12 h-12 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center flex-shrink-0 shadow-sm"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </motion.button>

            <div className="flex-1">
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-200"
                  style={{ width: duration > 0 ? `${(playbackTime / duration) * 100}%` : '0%' }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-[var(--color-text-tertiary)] tabular-nums">{formatTime(playbackTime)}</span>
                <span className="text-xs text-[var(--color-text-tertiary)] tabular-nums">{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-[var(--color-text-secondary)] font-semibold hover:bg-gray-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Re-record
            </button>
            <button
              onClick={handleUpload}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      )}

      {/* ── Uploading state ── */}
      {state === 'uploading' && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--color-text-secondary)]">Uploading your voice intro...</p>
        </div>
      )}

      {/* ── Saved state ── */}
      {state === 'saved' && (
        <div className="py-4">
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-semibold">Voice intro saved ({formatTime(duration)})</span>
          </div>

          {/* Playback */}
          <div className="flex items-center gap-3 mb-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={togglePlayback}
              className="w-10 h-10 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary)] flex items-center justify-center flex-shrink-0"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </motion.button>
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-200"
                style={{ width: duration > 0 ? `${(playbackTime / duration) * 100}%` : '0%' }}
              />
            </div>
            <span className="text-xs text-[var(--color-text-tertiary)] tabular-nums">{formatTime(duration)}</span>
          </div>

          <button
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-500 font-semibold hover:bg-red-50 transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete & Re-record
          </button>
        </div>
      )}
    </div>
  )
}
