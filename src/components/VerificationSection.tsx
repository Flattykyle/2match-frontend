import { useState, useEffect } from 'react'
import { Shield, CheckCircle, XCircle, Clock, Mail, Phone, Camera, Loader2 } from 'lucide-react'
import { verificationService } from '../services/verificationService'

export default function VerificationSection() {
  const [verificationStatus, setVerificationStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [emailSent, setEmailSent] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadVerificationStatus()
  }, [])

  const loadVerificationStatus = async () => {
    try {
      const status = await verificationService.getVerificationStatus()
      setVerificationStatus(status)
      if (status.phoneNumber) {
        setPhoneNumber(status.phoneNumber)
      }
    } catch (error) {
      console.error('Error loading verification status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmailVerification = async () => {
    setSubmitting(true)
    setMessage(null)
    try {
      await verificationService.sendEmailVerification()
      setEmailSent(true)
      setMessage({ type: 'success', text: 'Verification email sent! Please check your inbox.' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to send verification email' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendPhoneVerification = async () => {
    if (!phoneNumber) {
      setMessage({ type: 'error', text: 'Please enter a phone number' })
      return
    }
    setSubmitting(true)
    setMessage(null)
    try {
      const response = await verificationService.sendPhoneVerification(phoneNumber)
      setCodeSent(true)
      setMessage({ type: 'success', text: 'Verification code sent to your phone!' })
      if (response.verificationCode) {
        setMessage({ type: 'success', text: `Code sent! (Dev mode: ${response.verificationCode})` })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to send verification code' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyPhone = async () => {
    if (!verificationCode) {
      setMessage({ type: 'error', text: 'Please enter the verification code' })
      return
    }
    setSubmitting(true)
    setMessage(null)
    try {
      await verificationService.verifyPhone(verificationCode)
      setMessage({ type: 'success', text: 'Phone verified successfully!' })
      loadVerificationStatus()
      setVerificationCode('')
      setCodeSent(false)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Invalid verification code' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitPhotoVerification = async () => {
    setSubmitting(true)
    setMessage(null)
    try {
      await verificationService.submitPhotoVerification()
      setMessage({ type: 'success', text: 'Photo verification submitted for review!' })
      loadVerificationStatus()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to submit photo verification' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-rose-500" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Verification</h2>
      </div>

      <p className="text-gray-600 dark:text-gray-400">
        Verify your account to increase trust and get more matches!
      </p>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Email Verification */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Email Verification</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Verify your email address</p>
            </div>
          </div>
          {verificationStatus?.emailVerified ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <XCircle className="w-6 h-6 text-gray-400" />
          )}
        </div>

        {!verificationStatus?.emailVerified && (
          <button
            onClick={handleSendEmailVerification}
            disabled={submitting || emailSent}
            className="w-full px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Sending...' : emailSent ? 'Email Sent!' : 'Send Verification Email'}
          </button>
        )}
      </div>

      {/* Phone Verification */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Phone Verification</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Verify your phone number</p>
            </div>
          </div>
          {verificationStatus?.phoneVerified ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <XCircle className="w-6 h-6 text-gray-400" />
          )}
        </div>

        {!verificationStatus?.phoneVerified && (
          <div className="space-y-3">
            {!codeSent ? (
              <>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
                <button
                  onClick={handleSendPhoneVerification}
                  disabled={submitting || !phoneNumber}
                  className="w-full px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending...' : 'Send Verification Code'}
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleVerifyPhone}
                    disabled={submitting || !verificationCode}
                    className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Verifying...' : 'Verify Code'}
                  </button>
                  <button
                    onClick={() => { setCodeSent(false); setVerificationCode(''); }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Change Number
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Photo Verification */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Camera className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Photo Verification</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get a verified badge</p>
            </div>
          </div>
          {verificationStatus?.photoVerified ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : verificationStatus?.photoVerificationStatus === 'pending' ? (
            <Clock className="w-6 h-6 text-yellow-500" />
          ) : (
            <XCircle className="w-6 h-6 text-gray-400" />
          )}
        </div>

        {verificationStatus?.photoVerificationStatus === 'pending' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 px-4 py-3 rounded-lg text-sm">
            Your photo verification is under review. We'll notify you when it's complete!
          </div>
        )}

        {!verificationStatus?.photoVerified && verificationStatus?.photoVerificationStatus !== 'pending' && (
          <button
            onClick={handleSubmitPhotoVerification}
            disabled={submitting}
            className="w-full px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit for Photo Verification'}
          </button>
        )}
      </div>

      {/* Verification Benefits */}
      <div className="bg-gradient-to-r from-rose-50 to-purple-50 dark:from-rose-950/30 dark:to-purple-950/30 rounded-xl p-6">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Why verify?</h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Get a verified badge on your profile</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Increase trust and get more matches</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Stand out from unverified profiles</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
