import api from './api'

export interface SafetySettings {
  slowModeEnabled: boolean
  slowModeLimit: number
  activeHoursStart: number | null
  activeHoursEnd: number | null
  photoShieldEnabled: boolean
  emergencyContactName: string | null
  emergencyContactPhone: string | null
}

export interface SosResponse {
  message: string
  sosEventId: string
  smsSent: boolean
}

export interface DateCheckin {
  id: string
  userId: string
  matchId: string | null
  scheduledAt: string
  respondedAt: string | null
  status: 'PENDING' | 'SAFE' | 'MISSED'
  trustedContactEmail: string | null
  reminderSentAt: string | null
  createdAt: string
  match?: {
    id: string
    user1: { id: string; firstName: string }
    user2: { id: string; firstName: string }
  } | null
}

export interface MoodCheckinResponse {
  checkin: {
    id: string
    mood: string
    note: string | null
    createdAt: string
  }
  suggestion?: string
}

export const safetyService = {
  getSettings: async (): Promise<SafetySettings> => {
    const response = await api.get<SafetySettings>('/safety/settings')
    return response.data
  },

  updateSettings: async (settings: Partial<SafetySettings>): Promise<SafetySettings> => {
    const response = await api.put<SafetySettings & { message: string }>('/safety/settings', settings)
    return response.data
  },

  triggerSOS: async (): Promise<SosResponse> => {
    const response = await api.post<SosResponse>('/safety/sos')
    return response.data
  },

  createDateCheckin: async (data: {
    matchId?: string
    scheduledFor: string
    trustedContactEmail?: string
  }): Promise<DateCheckin> => {
    const response = await api.post<DateCheckin>('/safety/date-checkin', data)
    return response.data
  },

  respondToDateCheckin: async (checkinId: string): Promise<DateCheckin> => {
    const response = await api.post<DateCheckin>(`/safety/date-checkin/${checkinId}/respond`, { status: 'SAFE' })
    return response.data
  },

  getDateCheckins: async (): Promise<DateCheckin[]> => {
    const response = await api.get<DateCheckin[]>('/safety/date-checkins')
    return response.data
  },

  createMoodCheckin: async (mood: string, note?: string): Promise<MoodCheckinResponse> => {
    const response = await api.post<MoodCheckinResponse>('/safety/mood-checkin', { mood, note })
    return response.data
  },

  snoozeProfile: async (days: number): Promise<{ message: string; snoozedUntil: string }> => {
    const response = await api.post<{ message: string; snoozedUntil: string }>('/safety/snooze-profile', { days })
    return response.data
  },
}
