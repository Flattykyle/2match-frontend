import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import PremiumGate from '../components/PremiumGate'
import api from '../services/api'

interface PremiumGateContextType {
  showPremiumGate: (feature: string) => void
}

const PremiumGateContext = createContext<PremiumGateContextType | undefined>(undefined)

export const usePremiumGate = () => {
  const ctx = useContext(PremiumGateContext)
  if (!ctx) throw new Error('usePremiumGate must be inside PremiumGateProvider')
  return ctx
}

export function PremiumGateProvider({ children }: { children: ReactNode }) {
  const [feature, setFeature] = useState<string | null>(null)

  const showPremiumGate = useCallback((f: string) => setFeature(f), [])

  // Intercept 403 premium_required responses globally
  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response?.status === 403 &&
          error.response?.data?.error === 'premium_required'
        ) {
          const feat = error.response.data.feature || 'premium_feature'
          setFeature(feat)
        }
        return Promise.reject(error)
      }
    )

    return () => {
      api.interceptors.response.eject(interceptorId)
    }
  }, [])

  return (
    <PremiumGateContext.Provider value={{ showPremiumGate }}>
      {children}
      <PremiumGate
        isOpen={feature !== null}
        onClose={() => setFeature(null)}
        feature={feature || ''}
      />
    </PremiumGateContext.Provider>
  )
}
