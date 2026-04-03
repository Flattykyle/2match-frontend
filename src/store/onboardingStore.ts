import { create } from 'zustand'

export interface PromptAnswer {
  question: string
  answer: string
}

export interface OnboardingData {
  // Step 1 — Basics
  firstName: string
  lastName: string
  gender: string
  genderCustom: string
  pronouns: string
  locationCity: string
  locationCountry: string
  latitude?: number
  longitude?: number

  // Step 2 — Photos (URLs from Cloudinary, uploaded during step)
  photos: string[]

  // Step 3 — Voice memo (uploaded during step)
  voiceMemoUrl: string
  voiceMemoDuration: number

  // Step 4 — Your Story (3 prompt answers)
  prompts: PromptAnswer[]

  // Step 5 — Flags
  greenFlag: string
  redFlag: string
  currentlyObsessedWith: string

  // Step 6 — Vibe tags (IDs)
  vibeTagIds: string[]

  // Step 7 — Intention
  intention: string

  // Step 8 — Slow burn
  slowBurnEnabled: boolean
}

interface OnboardingState {
  step: number
  data: OnboardingData
  setStep: (step: number) => void
  next: () => void
  back: () => void
  update: (partial: Partial<OnboardingData>) => void
  reset: () => void
}

const INITIAL_DATA: OnboardingData = {
  firstName: '',
  lastName: '',
  gender: '',
  genderCustom: '',
  pronouns: '',
  locationCity: '',
  locationCountry: '',
  photos: [],
  voiceMemoUrl: '',
  voiceMemoDuration: 0,
  prompts: [],
  greenFlag: '',
  redFlag: '',
  currentlyObsessedWith: '',
  vibeTagIds: [],
  intention: '',
  slowBurnEnabled: true,
}

export const TOTAL_STEPS = 9

export const useOnboardingStore = create<OnboardingState>()((set) => ({
  step: 0,
  data: { ...INITIAL_DATA },
  setStep: (step) => set({ step }),
  next: () => set((s) => ({ step: Math.min(s.step + 1, TOTAL_STEPS - 1) })),
  back: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),
  update: (partial) => set((s) => ({ data: { ...s.data, ...partial } })),
  reset: () => set({ step: 0, data: { ...INITIAL_DATA } }),
}))
