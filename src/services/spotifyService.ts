import api from './api'

export interface SpotifyTrack {
  name: string
  artist: string
  albumArt: string | null
  previewUrl: string | null
  spotifyId: string
}

export const spotifyService = {
  getAuthUrl: async (): Promise<string> => {
    const response = await api.get<{ url: string }>('/spotify/auth')
    return response.data.url
  },

  getTopTracks: async (): Promise<SpotifyTrack[]> => {
    const response = await api.get<SpotifyTrack[]>('/spotify/top-tracks')
    return response.data
  },

  search: async (q: string): Promise<SpotifyTrack[]> => {
    const response = await api.get<SpotifyTrack[]>(`/spotify/search?q=${encodeURIComponent(q)}`)
    return response.data
  },
}
