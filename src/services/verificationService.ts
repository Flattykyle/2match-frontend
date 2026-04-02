import api from './api'

export const verificationService = {
  // Email verification
  sendEmailVerification: async () => {
    const response = await api.post('/verification/email/send')
    return response.data
  },

  verifyEmail: async (token: string) => {
    const response = await api.post('/verification/email/verify', { token })
    return response.data
  },

  // Phone verification
  sendPhoneVerification: async (phoneNumber: string) => {
    const response = await api.post('/verification/phone/send', { phoneNumber })
    return response.data
  },

  verifyPhone: async (code: string) => {
    const response = await api.post('/verification/phone/verify', { code })
    return response.data
  },

  // Photo verification
  submitPhotoVerification: async () => {
    const response = await api.post('/verification/photo/submit')
    return response.data
  },

  // Get verification status
  getVerificationStatus: async () => {
    const response = await api.get('/verification/status')
    return response.data
  },
}
