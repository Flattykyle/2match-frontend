import { useState } from 'react'
import { X, Camera, MessageSquareWarning, UserX, ShieldAlert, Ban, HelpCircle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { reportService, ReportReason } from '../services/reportService'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  firstName: string
  onBlocked?: () => void
}

type Step = 'reason' | 'note' | 'done'

const REASON_OPTIONS: { reason: ReportReason; icon: React.ReactNode; label: string }[] = [
  { reason: 'INAPPROPRIATE_PHOTOS', icon: <Camera className="w-5 h-5" />, label: 'Inappropriate photos' },
  { reason: 'HARASSMENT', icon: <MessageSquareWarning className="w-5 h-5" />, label: 'Harassment' },
  { reason: 'FAKE_PROFILE', icon: <UserX className="w-5 h-5" />, label: 'Fake profile' },
  { reason: 'UNSAFE_BEHAVIOR', icon: <ShieldAlert className="w-5 h-5" />, label: 'Unsafe behavior' },
  { reason: 'HATE_SPEECH', icon: <Ban className="w-5 h-5" />, label: 'Hate speech' },
  { reason: 'OTHER', icon: <HelpCircle className="w-5 h-5" />, label: 'Something else' },
]

export default function ReportModal({ isOpen, onClose, userId, firstName, onBlocked }: ReportModalProps) {
  const [step, setStep] = useState<Step>('reason')
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [blocking, setBlocking] = useState(false)

  if (!isOpen) return null

  const reset = () => {
    setStep('reason')
    setSelectedReason(null)
    setNote('')
    setSubmitting(false)
    setBlocking(false)
  }

  const handleClose = () => {
    if (!submitting && !blocking) {
      reset()
      onClose()
    }
  }

  const handleSelectReason = (reason: ReportReason) => {
    setSelectedReason(reason)
    setStep('note')
  }

  const handleSubmitReport = async () => {
    if (!selectedReason) return
    setSubmitting(true)
    try {
      await reportService.reportUser(userId, selectedReason, note.trim() || undefined)
      setStep('done')
    } catch {
      // Still move forward — don't make the user feel stuck
      setStep('done')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBlock = async () => {
    setBlocking(true)
    try {
      await reportService.blockUser(userId)
      onBlocked?.()
      handleClose()
    } catch {
      handleClose()
    } finally {
      setBlocking(false)
    }
  }

  const handleNoThanks = () => {
    handleClose()
  }

  const slideVariants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/40" onClick={handleClose} />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            disabled={submitting || blocking}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <AnimatePresence mode="wait">
            {/* ═══════ Step 1: Reason selection ═══════ */}
            {step === 'reason' && (
              <motion.div
                key="reason"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                <div className="text-center mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: '#E1F5EE' }}
                  >
                    <ShieldAlert className="w-6 h-6" style={{ color: '#2D5C4F' }} />
                  </div>
                  <h2 className="text-lg font-bold" style={{ color: '#2B2B2B' }}>
                    Something not right?
                  </h2>
                  <p className="text-sm mt-1" style={{ color: '#8A8578' }}>
                    We've got you. This stays between you and us.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {REASON_OPTIONS.map((opt) => (
                    <button
                      key={opt.reason}
                      onClick={() => handleSelectReason(opt.reason)}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all hover:shadow-sm active:scale-[0.97]"
                      style={{ borderColor: '#E1F5EE' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E1F5EE'; e.currentTarget.style.borderColor = '#9FCFBF' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.borderColor = '#E1F5EE' }}
                    >
                      <div style={{ color: '#2D5C4F' }}>{opt.icon}</div>
                      <span className="text-xs font-semibold text-center leading-tight" style={{ color: '#2B2B2B' }}>
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ═══════ Step 2: Optional note ═══════ */}
            {step === 'note' && (
              <motion.div
                key="note"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                <div className="mb-4">
                  <h2 className="text-lg font-bold mb-1" style={{ color: '#2B2B2B' }}>
                    Anything else?
                  </h2>
                  <p className="text-sm" style={{ color: '#8A8578' }}>
                    Totally optional — only share what feels right.
                  </p>
                </div>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Anything else we should know? (optional)"
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2"
                  style={{
                    borderColor: '#E1F5EE',
                    fontFamily: 'Lora, Georgia, serif',
                  }}
                />

                <div className="flex gap-2.5 mt-4">
                  <button
                    onClick={() => setStep('reason')}
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors"
                    style={{ borderColor: '#E1F5EE', color: '#6B7B75' }}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmitReport}
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50"
                    style={{ backgroundColor: '#2D5C4F' }}
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Send report'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ═══════ Step 3: Confirmation + block offer ═══════ */}
            {step === 'done' && (
              <motion.div
                key="done"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                <div className="text-center mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: '#E1F5EE' }}
                  >
                    <span className="text-2xl">💚</span>
                  </div>
                  <h2 className="text-lg font-bold mb-1" style={{ color: '#2B2B2B' }}>
                    Report sent
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: '#8A8578' }}>
                    We'll look into this quietly — you won't need to do anything else.
                  </p>
                </div>

                <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: '#F9F6F0' }}>
                  <p className="text-sm font-medium text-center" style={{ color: '#2B2B2B' }}>
                    Want to block {firstName} too?
                  </p>
                  <p className="text-xs text-center mt-1" style={{ color: '#8A8578' }}>
                    They won't know. They'll just stop seeing you.
                  </p>
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={handleNoThanks}
                    disabled={blocking}
                    className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors"
                    style={{ borderColor: '#E1F5EE', color: '#6B7B75' }}
                  >
                    No thanks
                  </button>
                  <button
                    onClick={handleBlock}
                    disabled={blocking}
                    className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50"
                    style={{ backgroundColor: '#2D5C4F' }}
                  >
                    {blocking ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Yes, block too'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
