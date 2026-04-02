import api from './api'

export interface IcebreakerQuestion {
  id: string
  text: string
  options: string[]
  category: string
}

export interface IcebreakerMatchUser {
  id: string
  firstName: string
  profilePictures: string[]
}

export interface IcebreakerData {
  match: {
    id: string
    icebreakerUnlocked: boolean
    user1: IcebreakerMatchUser
    user2: IcebreakerMatchUser
  }
  questions: IcebreakerQuestion[]
  myAnswers: { questionId: string; answer: string }[]
  otherUserAnswered: boolean
}

export interface SubmitAnswerResponse {
  message: string
  unlocked: boolean
  myAnswerCount: number
  otherUserAnswered: boolean
}

export const icebreakerService = {
  getQuestions: async (matchId: string): Promise<IcebreakerData> => {
    const response = await api.get<IcebreakerData>(`/icebreakers/${matchId}`)
    return response.data
  },

  submitAnswer: async (
    matchId: string,
    questionId: string,
    answer: string
  ): Promise<SubmitAnswerResponse> => {
    const response = await api.post<SubmitAnswerResponse>(
      `/icebreakers/${matchId}/answer`,
      { questionId, answer }
    )
    return response.data
  },
}
