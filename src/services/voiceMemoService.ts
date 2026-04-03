import api from './api'

export interface VoiceMemoResponse {
  url: string
  duration: number
}

export interface VoiceMessageResponse {
  message: {
    id: string
    senderId: string
    receiverId: string
    conversationId: string
    content: string
    type: string
    audioUrl: string
    audioDuration: number
    sentAt: string
    sender: {
      id: string
      firstName: string
      lastName: string
      profilePictures: string[]
    }
  }
}

export const voiceMemoService = {
  uploadProfile: async (
    audioBlob: Blob,
    onProgress?: (percent: number) => void
  ): Promise<VoiceMemoResponse> => {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'voice-memo.webm')

    const response = await api.post<VoiceMemoResponse>('/voice-memo/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (e.total && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      },
    })
    return response.data
  },

  deleteProfile: async (): Promise<void> => {
    await api.delete('/voice-memo/profile')
  },

  sendVoiceMessage: async (
    matchId: string,
    audioBlob: Blob,
    onProgress?: (percent: number) => void
  ): Promise<VoiceMessageResponse> => {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'voice-message.webm')

    const response = await api.post<VoiceMessageResponse>(`/messages/${matchId}/voice`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (e.total && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      },
    })
    return response.data
  },
}
