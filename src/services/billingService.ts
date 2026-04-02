import api from './api'

export type SubscriptionTier = 'FREE' | 'PREMIUM' | 'PLATINUM'

export interface SubscriptionStatus {
  subscriptionTier: SubscriptionTier
  subscriptionExpiresAt: string | null
  weeklyBoostsRemaining: number
  lastBoostResetAt: string
  lastBoostedAt: string | null
  nextBoostReset: string
}

export interface WhoVibedUser {
  id: string
  username: string
  firstName: string
  lastName: string
  profilePictures: string[]
  bio: string | null
  likedAt: string
}

export const billingService = {
  getStatus: async (): Promise<SubscriptionStatus> => {
    const response = await api.get<SubscriptionStatus>('/billing/status')
    return response.data
  },

  createCheckout: async (tier: 'PREMIUM' | 'PLATINUM'): Promise<string> => {
    const response = await api.post<{ url: string }>('/billing/checkout', { tier })
    return response.data.url
  },

  useBoost: async (): Promise<{ message: string; boostsRemaining: number }> => {
    const response = await api.post('/billing/boost')
    return response.data
  },

  getWhoVibedYou: async (): Promise<WhoVibedUser[]> => {
    const response = await api.get<{ users: WhoVibedUser[] }>('/billing/who-vibed')
    return response.data.users
  },
}
