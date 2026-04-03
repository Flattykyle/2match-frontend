import { create } from 'zustand'

/* ── Types ── */
export type GameType = 'TWO_TRUTHS' | 'HOT_TAKES' | 'WOULD_YOU_RATHER'
export type GamePhase = 'idle' | 'submitting' | 'waiting' | 'guessing' | 'reveal' | 'complete'

export interface GameSession {
  id: string
  matchId: string
  gameType: GameType
  phase: GamePhase
  mySubmission: string[] | null       // TWO_TRUTHS: 3 statements; HOT_TAKES: 'agree'|'disagree'; WYR: choices[]
  partnerSubmission: string[] | null
  partnerReady: boolean
  result: GameResult | null
  partnerName: string
}

export interface GameResult {
  // TWO_TRUTHS
  lieIndex?: number                   // which statement was the lie (0-2)
  guessCorrect?: boolean
  // HOT_TAKES
  myAnswer?: string
  partnerAnswer?: string
  agreed?: boolean
  question?: string
  // WOULD_YOU_RATHER
  myChoices?: string[]
  partnerChoices?: string[]
  matchCount?: number
  totalQuestions?: number
  questions?: { optionA: string; optionB: string }[]
}

interface IcebreakerGameState {
  session: GameSession | null
  isLauncherOpen: boolean
  isModalOpen: boolean
  loading: boolean

  openLauncher: () => void
  closeLauncher: () => void
  startGame: (session: GameSession) => void
  updatePhase: (phase: GamePhase) => void
  setPartnerReady: () => void
  setMySubmission: (data: string[]) => void
  setPartnerSubmission: (data: string[]) => void
  setResult: (result: GameResult) => void
  closeGame: () => void
  setLoading: (v: boolean) => void
}

export const useIcebreakerGameStore = create<IcebreakerGameState>((set) => ({
  session: null,
  isLauncherOpen: false,
  isModalOpen: false,
  loading: false,

  openLauncher: () => set({ isLauncherOpen: true }),
  closeLauncher: () => set({ isLauncherOpen: false }),

  startGame: (session) => set({ session, isModalOpen: true, isLauncherOpen: false }),

  updatePhase: (phase) =>
    set((s) => (s.session ? { session: { ...s.session, phase } } : {})),

  setPartnerReady: () =>
    set((s) => (s.session ? { session: { ...s.session, partnerReady: true } } : {})),

  setMySubmission: (data) =>
    set((s) => (s.session ? { session: { ...s.session, mySubmission: data } } : {})),

  setPartnerSubmission: (data) =>
    set((s) => (s.session ? { session: { ...s.session, partnerSubmission: data } } : {})),

  setResult: (result) =>
    set((s) => (s.session ? { session: { ...s.session, result, phase: 'complete' as GamePhase } } : {})),

  closeGame: () => set({ session: null, isModalOpen: false }),

  setLoading: (v) => set({ loading: v }),
}))
