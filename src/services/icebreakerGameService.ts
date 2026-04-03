import api from './api'
import type { GameType } from '../store/icebreakerGameStore'

export interface StartGameResponse {
  sessionId: string
  gameType: GameType
  matchId: string
}

export interface SubmitStatementsResponse {
  message: string
  partnerReady: boolean
}

export interface SubmitGuessResponse {
  correct: boolean
  lieIndex: number
}

export interface SubmitAnswerResponse {
  message: string
  partnerReady: boolean
  result?: {
    myAnswer: string
    partnerAnswer: string
    agreed: boolean
    question?: string
  }
}

export interface SubmitWYRResponse {
  message: string
  partnerReady: boolean
  result?: {
    myChoices: string[]
    partnerChoices: string[]
    matchCount: number
    totalQuestions: number
    questions: { optionA: string; optionB: string }[]
  }
}

export const icebreakerGameService = {
  startGame: async (matchId: string, gameType: GameType): Promise<StartGameResponse> => {
    const response = await api.post<StartGameResponse>('/icebreaker/start', { matchId, gameType })
    return response.data
  },

  submitStatements: async (
    sessionId: string,
    statements: string[],
    lieIndex: number
  ): Promise<SubmitStatementsResponse> => {
    const response = await api.post<SubmitStatementsResponse>(`/icebreaker/${sessionId}/statements`, {
      statements,
      lieIndex,
    })
    return response.data
  },

  submitGuess: async (sessionId: string, guessIndex: number): Promise<SubmitGuessResponse> => {
    const response = await api.post<SubmitGuessResponse>(`/icebreaker/${sessionId}/guess`, {
      guessIndex,
    })
    return response.data
  },

  submitHotTake: async (sessionId: string, answer: string): Promise<SubmitAnswerResponse> => {
    const response = await api.post<SubmitAnswerResponse>(`/icebreaker/${sessionId}/hot-take`, {
      answer,
    })
    return response.data
  },

  submitWYRChoices: async (sessionId: string, choices: string[]): Promise<SubmitWYRResponse> => {
    const response = await api.post<SubmitWYRResponse>(`/icebreaker/${sessionId}/wyr`, {
      choices,
    })
    return response.data
  },
}
