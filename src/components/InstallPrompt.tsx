import { useState, useEffect } from 'react'
import { Download, X, Smartphone, Heart } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = '2match-install-dismissed'
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  useEffect(() => {
    // Check if already installed as standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true

    if (isStandalone) return

    // Check if user dismissed recently
    const dismissedAt = localStorage.getItem(DISMISS_KEY)
    if (dismissedAt && Date.now() - Number(dismissedAt) < DISMISS_DURATION) return

    // Detect iOS
    const ua = navigator.userAgent
    const isiOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
    setIsIOS(isiOS)

    // On iOS, show our custom prompt after a short delay (no beforeinstallprompt on Safari)
    if (isiOS) {
      const timer = setTimeout(() => setShowPrompt(true), 3000)
      return () => clearTimeout(timer)
    }

    // For Android/Chrome/Edge - listen for the native install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true)
      return
    }

    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setShowIOSGuide(false)
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
  }

  if (!showPrompt) return null

  return (
    <>
      {/* Backdrop for iOS guide modal */}
      {showIOSGuide && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          onClick={handleDismiss}
        />
      )}

      {/* iOS Guide Modal */}
      {showIOSGuide && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[90%] max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Smartphone className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Install 2-Match on iOS
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-3 text-left">
              <p className="flex items-start gap-2">
                <span className="font-bold text-primary-500 shrink-0">1.</span>
                Tap the <strong>Share</strong> button
                <svg className="inline w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                at the bottom of Safari
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-primary-500 shrink-0">2.</span>
                Scroll down and tap <strong>"Add to Home Screen"</strong>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-primary-500 shrink-0">3.</span>
                Tap <strong>"Add"</strong> to install
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Install Banner */}
      {!showIOSGuide && (
        <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[55] animate-slide-up">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Gradient accent bar */}
            <div className="h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500" />

            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* App icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shrink-0 shadow-lg">
                  <Heart className="w-6 h-6 text-white" fill="white" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                    Get the 2-Match App
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Install for a faster experience with instant notifications
                  </p>
                </div>

                {/* Close button */}
                <button
                  onClick={handleDismiss}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleDismiss}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Not now
                </button>
                <button
                  onClick={handleInstall}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  Install
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default InstallPrompt
