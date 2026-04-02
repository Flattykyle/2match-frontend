import { useState, useRef, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Mic } from 'lucide-react'

/* ── Types ── */
interface VoiceNotePlayerProps {
  url: string
  duration: number
  firstName?: string
  className?: string
}

const BAR_COUNT = 24

/* ── Component ── */
export default function VoiceNotePlayer({
  url,
  duration,
  firstName,
  className = '',
}: VoiceNotePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [error, setError] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Generate deterministic decorative bars from the URL (seeded pseudo-random)
  const decorativeBars = useMemo(() => {
    let seed = 0
    for (let i = 0; i < url.length; i++) {
      seed = ((seed << 5) - seed + url.charCodeAt(i)) | 0
    }
    return Array.from({ length: BAR_COUNT }, () => {
      seed = ((seed * 1103515245 + 12345) & 0x7fffffff)
      return 6 + (seed % 22) // Heights between 6 and 28px
    })
  }, [url])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const togglePlayback = () => {
    setError(false)

    if (isPlaying && audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
      return
    }

    // Create or reuse audio element
    if (!audioRef.current) {
      const audio = new Audio(url)
      audio.preload = 'metadata'

      audio.ontimeupdate = () => setCurrentTime(audio.currentTime)
      audio.onended = () => {
        setIsPlaying(false)
        setCurrentTime(0)
      }
      audio.onerror = () => {
        setError(true)
        setIsPlaying(false)
      }

      audioRef.current = audio
    }

    audioRef.current.play().then(() => {
      setIsPlaying(true)
    }).catch(() => {
      setError(true)
    })
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? currentTime / duration : 0

  return (
    <div className={`flex items-center gap-3 bg-[var(--color-primary-50)] dark:bg-secondary-800 rounded-2xl px-3 py-2.5 ${className}`}>
      {/* Play/pause button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={togglePlayback}
        disabled={error}
        className={[
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
          error
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-[var(--color-primary)] text-white shadow-sm',
        ].join(' ')}
        aria-label={isPlaying ? 'Pause voice intro' : 'Play voice intro'}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </motion.button>

      {/* Waveform + info */}
      <div className="flex-1 min-w-0">
        {/* Decorative waveform bars */}
        <div className="flex items-center gap-[2px] h-8">
          {decorativeBars.map((baseHeight, i) => {
            const isBeforePlayhead = i / BAR_COUNT <= progress
            return (
              <motion.div
                key={i}
                className={[
                  'w-[3px] rounded-full transition-colors duration-150',
                  isPlaying && isBeforePlayhead
                    ? 'bg-[var(--color-primary)]'
                    : isBeforePlayhead && currentTime > 0
                    ? 'bg-[var(--color-primary)]/60'
                    : 'bg-[var(--color-primary)]/25',
                ].join(' ')}
                animate={isPlaying ? {
                  height: [baseHeight, baseHeight * 1.3, baseHeight * 0.7, baseHeight],
                } : { height: baseHeight }}
                transition={isPlaying ? {
                  duration: 0.6 + (i % 3) * 0.15,
                  repeat: Infinity,
                  ease: 'easeInOut' as const,
                } : { duration: 0.3 }}
              />
            )
          })}
        </div>

        {/* Label + duration */}
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)] truncate">
            <Mic className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">
              {firstName ? `${firstName}'s voice intro` : 'Voice intro'}
            </span>
          </div>
          <span className="text-xs text-[var(--color-text-tertiary)] tabular-nums flex-shrink-0 ml-2">
            {isPlaying || currentTime > 0 ? formatTime(currentTime) : formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  )
}
