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
}
