import { useState, useRef, useCallback, useEffect } from 'react'
import { Mic, Square, Play, Pause, RotateCcw, Check, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import WaveSurfer from 'wavesurfer.js'

type RecorderState = 'idle' | 'recording' | 'review' | 'uploading'

interface VoiceRecorderProps {
  maxDuration: number
  label?: string
  onConfirm: (blob: Blob, onProgress: (pct: number) => void) => Promise<void>
  onCancel?: () => void
  className?: string
}

const BAR_COUNT = 40

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function VoiceRecorder({
  maxDuration,
  label = 'Voice memo',
  onConfirm,
  onCancel,
  className = '',
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [localUrl, setLocalUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [_bars, setBars] = useState<number[]>(new Array(BAR_COUNT).fill(4))

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const waveContainerRef = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
      if (localUrl) URL.revokeObjectURL(localUrl)
    }
  }, [])

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy()
      wavesurferRef.current = null
    }
  }

  // Canvas waveform animation during recording
  const drawWaveform = useCallback(() => {
    const analyser = analyserRef.current
    const canvas = canvasRef.current
    if (!analyser || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    const draw = () => {
      analyser.getByteFrequencyData(dataArray)
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const barWidth = Math.max(2, (w / BAR_COUNT) - 2)
      const gap = 2
      const newBars: number[] = []

      for (let i = 0; i < BAR_COUNT; i++) {
        const idx = Math.floor((i / BAR_COUNT) * dataArray.length)
        const val = dataArray[idx] / 255
        const barHeight = Math.max(4, val * h * 0.9)
        newBars.push(barHeight)

        const x = i * (barWidth + gap)
        const y = (h - barHeight) / 2

        ctx.fillStyle = '#9FCFBF'
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, 2)
        ctx.fill()
      }

      setBars(newBars)
      animFrameRef.current = requestAnimationFrame(draw)
    }

    draw()
  }, [])

  const startRecording = async () => {
    setError('')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream

      // Web Audio API for waveform
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 128
      source.connect(analyser)
      analyserRef.current = analyser

      // MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4'

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
        if (localUrl) URL.revokeObjectURL(localUrl)
        setLocalUrl(url)
        setState('review')

        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
        setBars(new Array(BAR_COUNT).fill(4))

        stream.getTracks().forEach((t) => t.stop())
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close()
        }
      }

      recorder.start(100)
      setState('recording')
      setElapsed(0)

      const startTime = Date.now()
      timerRef.current = setInterval(() => {
        const secs = Math.floor((Date.now() - startTime) / 1000)
        setElapsed(secs)
        if (secs >= maxDuration) {
          stopRecording()
        }
      }, 200)

      drawWaveform()
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone access denied. Please allow in browser settings.')
      } else {
        setError('Could not start recording. Check your microphone.')
      }
    }
  }

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  // Auto-stop at max
  useEffect(() => {
    if (state === 'recording' && elapsed >= maxDuration) {
      stopRecording()
    }
  }, [elapsed, state, maxDuration, stopRecording])

  // Initialize WaveSurfer for review state
  useEffect(() => {
    if (state !== 'review' || !localUrl || !waveContainerRef.current) return

    const ws = WaveSurfer.create({
      container: waveContainerRef.current,
      waveColor: '#9FCFBF',
      progressColor: '#2D5C4F',
      cursorColor: 'transparent',
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      height: 36,
      normalize: true,
      url: localUrl,
    })

    ws.on('play', () => setIsPlaying(true))
    ws.on('pause', () => setIsPlaying(false))
    ws.on('finish', () => setIsPlaying(false))
    wavesurferRef.current = ws

    return () => {
      ws.destroy()
      wavesurferRef.current = null
    }
  }, [state, localUrl])

  const togglePlayback = () => {
    wavesurferRef.current?.playPause()
  }

  const handleReRecord = () => {
    cleanup()
    if (localUrl) URL.revokeObjectURL(localUrl)
    setAudioBlob(null)
    setLocalUrl(null)
    setElapsed(0)
    setIsPlaying(false)
    setUploadProgress(0)
    setState('idle')
  }

  const handleConfirm = async () => {
    if (!audioBlob) return
    setState('uploading')
    setUploadProgress(0)
    setError('')

    try {
      await onConfirm(audioBlob, setUploadProgress)
      // Reset after successful upload
      handleReRecord()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Upload failed')
      setState('review')
    }
  }

  const handleCancel = () => {
    cleanup()
    if (localUrl) URL.revokeObjectURL(localUrl)
    setAudioBlob(null)
    setLocalUrl(null)
    setElapsed(0)
    setState('idle')
    onCancel?.()
  }

  return (
    <div className={className}>
      {error && (
        <div className="text-xs text-red-500 mb-2 px-1">{error}</div>
      )}

      {/* Idle state */}
      {state === 'idle' && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={startRecording}
            className="p-2.5 rounded-full transition-colors"
            style={{ backgroundColor: '#E1F5EE', color: '#2D5C4F' }}
            title={label}
          >
            <Mic className="w-5 h-5" />
          </button>
          <span className="text-xs" style={{ color: '#8A8578' }}>{label}</span>
        </div>
      )}

      {/* Recording state */}
      {state === 'recording' && (
        <div className="space-y-2">
          {/* Timer + pulsing dot */}
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-sm font-semibold tabular-nums" style={{ color: '#2B2B2B' }}>
              {formatTime(elapsed)}
            </span>
            <span className="text-xs" style={{ color: '#8A8578' }}>/ {formatTime(maxDuration)}</span>
          </div>

          {/* Canvas waveform */}
          <canvas
            ref={canvasRef}
            width={320}
            height={40}
            className="w-full h-10 rounded-lg"
            style={{ backgroundColor: '#F5EDD8' }}
          />

          {/* Stop button */}
          <div className="flex justify-center">
            <button
              onClick={stopRecording}
              className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
            >
              <Square className="w-4 h-4 fill-white" />
            </button>
          </div>
        </div>
      )}

      {/* Review state */}
      {state === 'review' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ backgroundColor: '#F5EDD8' }}>
            <button
              onClick={togglePlayback}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#2D5C4F', color: '#fff' }}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
            </button>
            <div ref={waveContainerRef} className="flex-1 min-w-0" />
            <span className="text-xs tabular-nums flex-shrink-0" style={{ color: '#8A8578' }}>
              {formatTime(elapsed)}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleReRecord}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition-colors"
              style={{ borderColor: '#E1F5EE', color: '#6B7B75' }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Re-record
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: '#2D5C4F' }}
            >
              <Check className="w-3.5 h-3.5" />
              Use this
            </button>
          </div>
        </div>
      )}

      {/* Uploading state */}
      {state === 'uploading' && (
        <div className="flex items-center gap-3 py-2">
          <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" style={{ color: '#9FCFBF' }} />
          <div className="flex-1">
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#E1F5EE' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ backgroundColor: '#2D5C4F', width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-xs mt-0.5 block" style={{ color: '#8A8578' }}>
              Uploading... {uploadProgress}%
            </span>
          </div>
          <button
            onClick={handleCancel}
            className="text-xs font-medium px-2 py-1 rounded"
            style={{ color: '#E8735A' }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
