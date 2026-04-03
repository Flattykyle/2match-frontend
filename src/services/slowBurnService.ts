import api from './api'

export interface PromptExchangeSender {
  id: string
  firstName: string
  profilePictures: string[]
}

export interface PromptExchange {
  id: string
  matchId: string
  senderId: string
  question: string
  answer: string
  createdAt: string
  sender: PromptExchangeSender
}

export interface PromptExchangeResponse {
  exchange: PromptExchange
  exchangeCount: number
  chatUnlocked: boolean
}

export interface PromptExchangesListResponse {
  exchanges: PromptExchange[]
  exchangeCount: number
  chatUnlocked: boolean
  slowBurnEnabled: boolean
}

export const createPromptExchange = async (
  matchId: string,
  question: string,
  answer: string
): Promise<PromptExchangeResponse> => {
  const response = await api.post(`/matches/${matchId}/prompt-exchange`, { question, answer })
  return response.data
}

export const getPromptExchanges = async (matchId: string): Promise<PromptExchangesListResponse> => {
  const response = await api.get(`/matches/${matchId}/prompt-exchanges`)
  return response.data
}
