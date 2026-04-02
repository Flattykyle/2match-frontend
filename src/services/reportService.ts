import api from './api'

export interface ReportData {
  userId: string
  reason: 'inappropriate_content' | 'fake_profile' | 'harassment' | 'spam' | 'other'
  description?: string
}

export const reportService = {
  // Report a user
  reportUser: async (data: ReportData) => {
    const response = await api.post('/reports', data)
    return response.data
  },

  // Get my submitted reports
  getMyReports: async () => {
    const response = await api.get('/reports/my-reports')
    return response.data
  },

  // Delete a report
  deleteReport: async (reportId: string) => {
    const response = await api.delete(`/reports/${reportId}`)
    return response.data
  },

  // Admin: Get all reports
  getAllReports: async (status?: string, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    if (status && status !== 'all') {
      params.append('status', status)
    }
    const response = await api.get(`/reports/all?${params}`)
    return response.data
  },

  // Admin: Update report status
  updateReportStatus: async (
    reportId: string,
    status: string,
    actionTaken?: string
  ) => {
    const response = await api.put(`/reports/${reportId}`, {
      status,
      actionTaken,
    })
    return response.data
  },
}
