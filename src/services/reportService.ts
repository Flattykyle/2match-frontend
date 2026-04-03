import api from './api'

export type ReportReason =
  | 'INAPPROPRIATE_PHOTOS'
  | 'HARASSMENT'
  | 'FAKE_PROFILE'
  | 'UNSAFE_BEHAVIOR'
  | 'HATE_SPEECH'
  | 'OTHER'

export const reportService = {
  reportUser: async (userId: string, reason: ReportReason, optionalNote?: string): Promise<{ reportId: string }> => {
    const response = await api.post(`/users/${userId}/report`, { reason, optionalNote })
    return response.data
  },

  blockUser: async (userId: string): Promise<void> => {
    await api.post(`/users/${userId}/block`)
  },

  // Legacy methods kept for backward compatibility
  getMyReports: async () => {
    const response = await api.get('/reports/my-reports')
    return response.data
  },

  getAllReports: async (status?: string, page = 1, limit = 20) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
    if (status && status !== 'all') params.append('status', status)
    const response = await api.get(`/reports/all?${params}`)
    return response.data
  },

  updateReportStatus: async (reportId: string, status: string, actionTaken?: string) => {
    const response = await api.put(`/reports/${reportId}`, { status, actionTaken })
    return response.data
  },

  deleteReport: async (reportId: string) => {
    const response = await api.delete(`/reports/${reportId}`)
    return response.data
  },
}
