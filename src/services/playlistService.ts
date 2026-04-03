import api from './api'

export interface PlaylistTrack {
  spotifyId: string
  name: string
  artist: string
  albumArt: string | null
  previewUrl: string | null
  addedBy: string
  addedByName: string
  addedAt: string
}

export interface PlaylistUser {
  id: string
  firstName: string
  spotifyConnected: boolean
}

export interface PlaylistData {
  playlist: {
    id: string
    matchId: string
    tracks: PlaylistTrack[]
  } | null
  user1: PlaylistUser
  user2: PlaylistUser
  playlistCreated: boolean
}

export const playlistService = {
  getPlaylist: async (matchId: string): Promise<PlaylistData> => {
    const response = await api.get<PlaylistData>(`/playlist/${matchId}`)
    return response.data
  },

  createPlaylist: async (matchId: string): Promise<any> => {
    const response = await api.post(`/playlist/${matchId}/create`)
    return response.data
  },

  addTrack: async (matchId: string, spotifyId: string): Promise<{ track: PlaylistTrack }> => {
    const response = await api.post<{ track: PlaylistTrack }>(`/playlist/${matchId}/add-track`, { spotifyId })
    return response.data
  },
}
