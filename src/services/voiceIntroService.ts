import api from './api'

export interface VoiceIntroResponse {
  message: string
  voiceIntroUrl: string
  voiceIntroDuration: number
}

export const voiceIntroService = {
  upload: async (audioBlob: Blob): Promise<VoiceIntroResponse> => {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'voice-intro.webm')

    const response = await api.post<VoiceIntroResponse>('/users/me/voice-intro', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  delete: async (): Promise<void> => {
    await api.delete('/users/me/voice-intro')
  },
}
