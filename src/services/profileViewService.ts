import api from './api'

export const profileViewService = {
  // Track a profile view
  trackProfileView: async (userId: string) => {
    const response = await api.post(`/profile-views/${userId}`)
    return response.data
  },

  // Get who viewed my profile
  getProfileViewers: async (page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    const response = await api.get(`/profile-views/viewers?${params}`)
    return response.data
  },

  // Get profiles I viewed
  getViewedProfiles: async (page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    const response = await api.get(`/profile-views/viewed?${params}`)
    return response.data
  },

  // Get profile view statistics
  getProfileViewStats: async () => {
    const response = await api.get('/profile-views/stats')
    return response.data
  },
}
