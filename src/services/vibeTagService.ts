import api from './api'

export interface VibeTag {
  id: string
  label: string
  emoji: string
  category: 'LIFESTYLE' | 'PERSONALITY' | 'INTERESTS' | 'VALUES'
}

export interface VibeTagsGrouped {
  LIFESTYLE?: VibeTag[]
  PERSONALITY?: VibeTag[]
  INTERESTS?: VibeTag[]
  VALUES?: VibeTag[]
}

export const vibeTagService = {
  /** GET /api/vibe-tags — all active tags grouped by category */
  getAll: async (): Promise<VibeTagsGrouped> => {
    const response = await api.get<{ tags: VibeTagsGrouped }>('/vibe-tags')
    return response.data.tags
  },

  /** GET /api/users/me/vibe-tags — current user's selected tags */
  getMine: async (): Promise<VibeTag[]> => {
    const response = await api.get<{ vibeTags: VibeTag[] }>('/users/me/vibe-tags')
    return response.data.vibeTags
  },

  /** PUT /api/users/me/vibe-tags — update user's selected tags */
  update: async (tagIds: string[]): Promise<VibeTag[]> => {
    const response = await api.put<{ vibeTags: VibeTag[] }>('/users/me/vibe-tags', { tagIds })
    return response.data.vibeTags
  },
}
