export type SubscriptionTier = 'FREE' | 'PREMIUM' | 'PLATINUM'

export interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  lookingFor: string
  bio?: string
  locationCity?: string
  locationCountry?: string
  latitude?: number
  longitude?: number
  profilePictures?: string[]
  hobbies?: string[]
  talents?: string[]
  interests?: string[]
  preferences?: UserPreferences
  subscriptionTier?: SubscriptionTier
  createdAt: string
  updatedAt: string
  lastActive?: string
}

export interface UserPreferences {
  ageMin: number
  ageMax: number
  distance: number
  genderPreference: string
}

// BEFORE: AuthResponse included accessToken and refreshToken in the JSON body
// AFTER: Tokens are in httpOnly cookies — only user and message in body
export interface AuthResponse {
  message: string
  user: User
}

export interface LoginCredentials {
  identifier: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  username: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  lookingFor: string
  bio?: string
  locationCity?: string
  locationCountry?: string
  latitude?: number
  longitude?: number
  hobbies?: string[]
  talents?: string[]
  interests?: string[]
}

export interface Match {
  id: string
  userId: string
  matchedUserId: string
  matchedUser: User
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  read: boolean
  createdAt: string
}

export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  bio?: string
  locationCity?: string
  locationCountry?: string
  latitude?: number
  longitude?: number
  hobbies?: string[]
  talents?: string[]
  interests?: string[]
  lookingFor?: string
  gender?: string
  preferences?: UserPreferences
}

export interface ProfileCompletion {
  percentage: number
  missingFields: string[]
}

export interface PhotoUploadResponse {
  url: string
  message: string
}
