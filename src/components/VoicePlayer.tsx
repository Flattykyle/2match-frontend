import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Mic } from 'lucide-react'
import WaveSurfer from 'wavesurfer.js'

interface VoicePlayerProps {
  audioUrl: string
  duration: number
  senderName?: string
  compact?: boolean
  className?: string
}

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function VoicePlayer({
  audioUrl,
  duration,
  senderName,
  compact = false,
  className = '',
}: VoicePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#9FCFBF',
      progressColor: '#2D5C4F',
      cursorColor: 'transparent',
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      height: compact ? 28 : 36,
      normalize: true,
      backend: 'WebAudio',
      url: audioUrl,
    })

    ws.on('ready', () => setReady(true))
    ws.on('play', () => setIsPlaying(true))
    ws.on('pause', () => setIsPlaying(false))
    ws.on('finish', () => {
      setIsPlaying(false)
      setCurrentTime(0)
    })
    ws.on('timeupdate', (time) => setCurrentTime(time))

    wavesurferRef.current = ws

    return () => {
      ws.destroy()
      wavesurferRef.current = null
    }
  }, [audioUrl, compact])

  const togglePlay = () => {
    if (!wavesurferRef.current || !ready) return
    wavesurferRef.current.playPause()
  }

  return (
    <div
      className={`flex items-center gap-2.5 rounded-2xl px-3 py-2 ${className}`}
      style={{ backgroundColor: '#F5EDD8' }}
    >
      <button
        onClick={togglePlay}
        disabled={!ready}
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors disabled:opacity-40"
        style={{ backgroundColor: '#2D5C4F', color: '#fff' }}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div ref={containerRef} className="w-full" />
        <div className="flex items-center justify-between mt-0.5">
          {senderName && (
            <div className="flex items-center gap-1 text-xs truncate" style={{ color: '#6B7B75' }}>
              <Mic className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{senderName}</span>
            </div>
          )}
          <span
            className="text-xs tabular-nums flex-shrink-0 ml-auto"
            style={{ color: '#8A8578' }}
          >
            {isPlaying || currentTime > 0 ? formatTime(currentTime) : formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  )
}
