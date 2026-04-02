import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { reportService, ReportData } from '../services/reportService'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  username: string
}

export default function ReportModal({ isOpen, onClose, userId, username }: ReportModalProps) {
  const [reason, setReason] = useState<ReportData['reason']>('inappropriate_content')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await reportService.reportUser({
        userId,
        reason,
        description: description.trim() || undefined,
      })
      setSubmitted(true)
      setTimeout(() => {
        onClose()
        setSubmitted(false)
        setReason('inappropriate_content')
        setDescription('')
      }, 2000)
    } catch (error: any) {
      console.error('Error reporting user:', error)
      alert(error.response?.data?.message || 'Failed to submit report')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      onClose()
      setReason('inappropriate_content')
      setDescription('')
      setSubmitted(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8">
          {/* Close button */}
          <button
            onClick={handleClose}
            disabled={submitting}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>

          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Report Submitted</h3>
              <p className="text-gray-600">
                Thank you for helping keep our community safe. We'll review this report shortly.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Report User</h2>
                  <p className="text-sm text-gray-600">Report @{username}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Reason */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason for reporting
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'inappropriate_content', label: 'Inappropriate Content' },
                      { value: 'fake_profile', label: 'Fake Profile' },
                      { value: 'harassment', label: 'Harassment' },
                      { value: 'spam', label: 'Spam' },
                      { value: 'other', label: 'Other' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={option.value}
                          checked={reason === option.value}
                          onChange={(e) => setReason(e.target.value as ReportData['reason'])}
                          className="w-4 h-4 text-rose-500 focus:ring-rose-500"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional details (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide more context about this report..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={submitting}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
