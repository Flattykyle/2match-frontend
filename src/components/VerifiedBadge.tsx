import { CheckCircle, Mail, Phone, Camera } from 'lucide-react'

interface VerifiedBadgeProps {
  emailVerified?: boolean
  phoneVerified?: boolean
  photoVerified?: boolean
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  className?: string
}

export default function VerifiedBadge({
  emailVerified,
  phoneVerified,
  photoVerified,
  size = 'md',
  showTooltip = true,
  className = '',
}: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  // Only show if at least one verification is complete
  const hasVerification = emailVerified || phoneVerified || photoVerified

  if (!hasVerification) return null

  const verificationCount = [emailVerified, phoneVerified, photoVerified].filter(Boolean).length
  const isFullyVerified = verificationCount === 3

  return (
    <div className={`relative inline-flex group ${className}`}>
      <CheckCircle
        className={`${sizeClasses[size]} ${
          isFullyVerified
            ? 'text-blue-500 fill-blue-500'
            : photoVerified
            ? 'text-green-500 fill-green-500'
            : 'text-purple-500 fill-purple-500'
        } drop-shadow`}
      />

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
            <div className="font-semibold mb-1.5">Verified Account</div>
            <div className="space-y-1">
              {emailVerified && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3" />
                  <span>Email verified</span>
                </div>
              )}
              {phoneVerified && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3" />
                  <span>Phone verified</span>
                </div>
              )}
              {photoVerified && (
                <div className="flex items-center gap-1.5">
                  <Camera className="w-3 h-3" />
                  <span>Photo verified</span>
                </div>
              )}
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div className="border-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
