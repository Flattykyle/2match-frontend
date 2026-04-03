import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getDailyPicks, DailyPicksResponse, DailyPick } from '../services/discoveryService'

interface DiscoveryState {
  dailyPicks: DailyPick[]
  expiresAt: string | null
  passedIds: string[]
  interestedIds: string[]
  loading: boolean
  error: string | null

  loadPicks: () => Promise<void>
  markInterest: (userId: string) => void
  markPass: (userId: string) => void
}

export const useDiscoveryStore = create<DiscoveryState>()(
  persist(
    (set, get) => ({
      dailyPicks: [],
      expiresAt: null,
      passedIds: [],
      interestedIds: [],
      loading: false,
      error: null,

      loadPicks: async () => {
        set({ loading: true, error: null })
        try {
          const data: DailyPicksResponse = await getDailyPicks()

          // If the stored expiry has passed, clear acted-on sets
          const prev = get().expiresAt
          if (prev && new Date(prev).getTime() < Date.now()) {
            set({ passedIds: [], interestedIds: [] })
          }

          set({
            dailyPicks: data.picks,
            expiresAt: data.expiresAt,
            loading: false,
          })
        } catch (err: any) {
          set({
            error: err.response?.data?.error || err.response?.data?.message || 'Failed to load picks',
            loading: false,
          })
        }
      },

      markInterest: (userId) =>
        set((s) => ({
          interestedIds: s.interestedIds.includes(userId)
            ? s.interestedIds
            : [...s.interestedIds, userId],
        })),

      markPass: (userId) =>
        set((s) => ({
          passedIds: s.passedIds.includes(userId)
            ? s.passedIds
            : [...s.passedIds, userId],
        })),
    }),
    {
      name: '2match-discovery-storage',
      partialize: (state) => ({
        passedIds: state.passedIds,
        interestedIds: state.interestedIds,
        expiresAt: state.expiresAt,
      }),
    }
  )
)
