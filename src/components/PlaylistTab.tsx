import { useEffect, useState, useRef, useCallback } from 'react'
import { Music, Search, Plus, Play, Pause, Loader2, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocket } from '../context/SocketContext'
import { useAuthStore } from '../store/authStore'
import {
  PlaylistTrack,
  PlaylistData,
  playlistService,
} from '../services/playlistService'
import { SpotifyTrack, spotifyService } from '../services/spotifyService'

interface PlaylistTabProps {
  matchId: string
}

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function PlaylistTab({ matchId }: PlaylistTabProps) {
  const [data, setData] = useState<PlaylistData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([])
  const [searching, setSearching] = useState(false)
  const [addingTrackId, setAddingTrackId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [error, setError] = useState('')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { socket } = useSocket()
  const { user } = useAuthStore()

  useEffect(() => {
    loadPlaylist()
  }, [matchId])

  // Join match room + listen for track additions
  useEffect(() => {
    if (!socket) return
    socket.emit('join-match', { matchId })

    const handleTrackAdded = (payload: { track: PlaylistTrack; addedBy: string }) => {
      if (payload.addedBy !== user?.id) {
        setData((prev) => {
          if (!prev?.playlist) return prev
          return {
            ...prev,
            playlist: {
              ...prev.playlist,
              tracks: [...prev.playlist.tracks, payload.track],
            },
          }
        })
      }
    }

    socket.on('playlist:track_added', handleTrackAdded)
    return () => { socket.off('playlist:track_added', handleTrackAdded) }
  }, [socket, matchId, user?.id])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const loadPlaylist = async () => {
    try {
      setLoading(true)
      const result = await playlistService.getPlaylist(matchId)
      setData(result)
    } catch {
      setError('Failed to load playlist')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    setCreating(true)
    setError('')
    try {
      await playlistService.createPlaylist(matchId)
      await loadPlaylist()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create playlist')
    } finally {
      setCreating(false)
    }
  }

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!q.trim()) {
      setSearchResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const results = await spotifyService.search(q)
        setSearchResults(results)
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 400)
  }, [])

  const handleAddTrack = async (spotifyId: string) => {
    setAddingTrackId(spotifyId)
    setError('')
    try {
      const { track } = await playlistService.addTrack(matchId, spotifyId)
      setData((prev) => {
        if (!prev?.playlist) return prev
        return {
          ...prev,
          playlist: {
            ...prev.playlist,
            tracks: [...prev.playlist.tracks, track],
          },
        }
      })
      setSearchQuery('')
      setSearchResults([])
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to add track')
    } finally {
      setAddingTrackId(null)
    }
  }

  const togglePreview = (previewUrl: string | null, trackId: string) => {
    if (!previewUrl) return

    if (playingTrackId === trackId && audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setPlayingTrackId(null)
      setPlaybackTime(0)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audio = new Audio(previewUrl)
    audioRef.current = audio
    audio.ontimeupdate = () => setPlaybackTime(audio.currentTime)
    audio.onended = () => {
      setPlayingTrackId(null)
      setPlaybackTime(0)
      audioRef.current = null
    }
    audio.play()
    setPlayingTrackId(trackId)
  }

  const handleConnectSpotify = async () => {
    try {
      const url = await spotifyService.getAuthUrl()
      window.location.href = url
    } catch {
      setError('Failed to start Spotify connection')
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#9FCFBF' }} />
      </div>
    )
  }

  const isUserSpotifyConnected = user?.id === data?.user1.id
    ? data?.user1.spotifyConnected
    : data?.user2.spotifyConnected

  const bothConnected = data?.user1.spotifyConnected && data?.user2.spotifyConnected
  const tracks = data?.playlist?.tracks || []
  const user1Tracks = tracks.filter((t) => t.addedBy === data?.user1.id).length
  const user2Tracks = tracks.filter((t) => t.addedBy === data?.user2.id).length

  // Spotify not connected CTA
  if (!isUserSpotifyConnected) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#E1F5EE' }}>
          <Music className="w-8 h-8" style={{ color: '#2D5C4F' }} />
        </div>
        <h3 className="text-lg font-bold mb-2" style={{ color: '#2D5C4F', fontFamily: 'Lora, Georgia, serif' }}>
          Connect Spotify
        </h3>
        <p className="text-sm mb-6" style={{ color: '#6B7B75' }}>
          Link your Spotify account to create a shared playlist with your match
        </p>
        <button
          onClick={handleConnectSpotify}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold transition-all"
          style={{ backgroundColor: '#1DB954' }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Connect Spotify
        </button>
      </div>
    )
  }

  // Playlist not created yet
  if (!data?.playlist) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#E1F5EE' }}>
          <Music className="w-8 h-8" style={{ color: '#2D5C4F' }} />
        </div>
        <h3 className="text-lg font-bold mb-2" style={{ color: '#2D5C4F', fontFamily: 'Lora, Georgia, serif' }}>
          Shared Playlist
        </h3>
        {!bothConnected ? (
          <p className="text-sm" style={{ color: '#6B7B75' }}>
            Waiting for your match to connect Spotify...
          </p>
        ) : (
          <>
            <p className="text-sm mb-4" style={{ color: '#6B7B75' }}>
              Both of you have Spotify connected! Create your shared playlist.
            </p>
            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold transition-all disabled:opacity-50"
              style={{ backgroundColor: '#2D5C4F' }}
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Music className="w-4 h-4" />}
              Create Playlist
            </button>
          </>
        )}
      </div>
    )
  }

  // Main playlist view
  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#F9F6F0' }}>
      {/* Track count progress */}
      <div className="px-4 py-3 border-b flex-shrink-0" style={{ borderColor: '#E1F5EE', backgroundColor: '#fff' }}>
        <div className="flex items-center justify-between mb-2">
          <Music className="w-4 h-4" style={{ color: '#2D5C4F' }} />
          <span className="text-xs font-semibold" style={{ color: '#2D5C4F' }}>
            Our 2-Match Vibe
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: '#6B7B75' }}>{data.user1.firstName}</span>
              <span style={{ color: '#8A8578' }}>{user1Tracks}/20</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#E1F5EE' }}>
              <div className="h-full rounded-full" style={{ backgroundColor: '#2D5C4F', width: `${(user1Tracks / 20) * 100}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: '#6B7B75' }}>{data.user2.firstName}</span>
              <span style={{ color: '#8A8578' }}>{user2Tracks}/20</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#E1F5EE' }}>
              <div className="h-full rounded-full" style={{ backgroundColor: '#E8735A', width: `${(user2Tracks / 20) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-4 py-2 border-b flex-shrink-0" style={{ borderColor: '#E1F5EE', backgroundColor: '#fff' }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9FCFBF' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search tracks to add..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2"
            style={{ borderColor: '#E1F5EE', backgroundColor: '#F9F6F0' }}
          />
          {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" style={{ color: '#9FCFBF' }} />}
        </div>

        {/* Search results */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-2"
            >
              <div className="max-h-48 overflow-y-auto rounded-xl border" style={{ borderColor: '#E1F5EE' }}>
                {searchResults.map((track) => {
                  const alreadyAdded = tracks.some((t) => t.spotifyId === track.spotifyId)
                  return (
                    <div
                      key={track.spotifyId}
                      className="flex items-center gap-3 p-2 border-b last:border-0"
                      style={{ borderColor: '#E1F5EE' }}
                    >
                      {track.albumArt && (
                        <img src={track.albumArt} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: '#2B2B2B' }}>{track.name}</p>
                        <p className="text-xs truncate" style={{ color: '#8A8578' }}>{track.artist}</p>
                      </div>
                      {alreadyAdded ? (
                        <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: '#E1F5EE', color: '#2D5C4F' }}>
                          Added
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddTrack(track.spotifyId)}
                          disabled={addingTrackId === track.spotifyId}
                          className="p-1.5 rounded-full flex-shrink-0 transition-colors"
                          style={{ backgroundColor: '#2D5C4F', color: '#fff' }}
                        >
                          {addingTrackId === track.spotifyId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      {/* Track list */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {tracks.length === 0 ? (
          <div className="text-center py-12">
            <Music className="w-12 h-12 mx-auto mb-3" style={{ color: '#9FCFBF' }} />
            <p className="font-medium" style={{ color: '#2D5C4F', fontFamily: 'Lora, Georgia, serif' }}>
              No tracks yet
            </p>
            <p className="text-sm mt-1" style={{ color: '#6B7B75' }}>
              Search for a song above to add it
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {tracks.map((track, index) => (
              <motion.div
                key={track.spotifyId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index < tracks.length - 1 ? 0 : 0.1 }}
                className="flex items-center gap-3 p-3 rounded-2xl mb-2 shadow-sm"
                style={{ backgroundColor: '#fff' }}
              >
                {/* Album art with play overlay */}
                <div className="relative flex-shrink-0">
                  {track.albumArt ? (
                    <img src={track.albumArt} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E1F5EE' }}>
                      <Music className="w-5 h-5" style={{ color: '#9FCFBF' }} />
                    </div>
                  )}
                  {track.previewUrl && (
                    <button
                      onClick={() => togglePreview(track.previewUrl, track.spotifyId)}
                      className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
                    >
                      {playingTrackId === track.spotifyId ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      )}
                    </button>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#2B2B2B' }}>{track.name}</p>
                  <p className="text-xs truncate" style={{ color: '#8A8578' }}>{track.artist}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9FCFBF' }}>
                    Added by {track.addedByName}
                  </p>
                </div>

                {/* Playing indicator */}
                {playingTrackId === track.spotifyId && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs tabular-nums" style={{ color: '#8A8578' }}>{formatTime(playbackTime)}</span>
                    <div className="flex gap-0.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1 rounded-full"
                          style={{ backgroundColor: '#2D5C4F' }}
                          animate={{ height: [8, 16, 8] }}
                          transition={{ duration: 0.5, delay: i * 0.15, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
