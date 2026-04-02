import api from './api'

export interface VibeTagData {
  id: string
  label: string
  emoji: string
  category: string
}

export interface PotentialMatch {
  id: string
  username: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  lookingFor: string
  bio?: string
  locationCity?: string
  locationCountry?: string
  profilePictures: string[]
  hobbies: string[]
  talents: string[]
  interests: string[]
  vibeTags?: VibeTagData[]
  compatibility: number
  breakdown: {
    overallScore: number
    breakdown: {
      hobbies: number
      talents: number
      location: number
      age: number
      lookingFor: number
    }
    sharedHobbies: string[]
    sharedTalents: string[]
    distance: number | null
  }
  distance?: number | null
  distanceText?: string | null
  isOnline?: boolean
  lastActive?: string
  emailVerified?: boolean
  phoneVerified?: boolean
  photoVerified?: boolean
}

export interface PotentialMatchesResponse {
  users: PotentialMatch[]
  pagination: {
    limit: number
    total: number
    nextCursor: string | null
    hasMore: boolean
    // Legacy compat (offset-based responses may still include these)
    page?: number
    totalPages?: number
  }
}

export interface LikeResponse {
  message: string
  isMatch: boolean
  match?: any
}

export interface LikedUser extends PotentialMatch {
  isMatch: boolean
  likedAt: string
}

export interface LikedUsersResponse {
  likedUsers: LikedUser[]
  total: number
  matchesCount: number
}

/**
 * Get potential matches (cursor-based pagination)
 * @param cursor - pass the last user's id to get the next page (null for first page)
 */
export const getPotentialMatches = async (
  _page: number = 1, // Deprecated: kept for call-site compat, cursor is used now
  limit: number = 20,
  minCompatibility: number = 0,
  sortBy: 'compatibility' | 'distance' = 'compatibility',
  maxDistance?: number,
  nearMeOnly: boolean = false,
  vibeTags?: string[],
  cursor?: string | null
): Promise<PotentialMatchesResponse> => {
  const params: any = {
    limit,
    minCompatibility,
    sortBy,
    nearMeOnly,
  }

  if (cursor) {
    params.cursor = cursor
  }

  if (maxDistance !== undefined) {
    params.maxDistance = maxDistance
  }

  if (vibeTags && vibeTags.length > 0) {
    params.vibeTags = vibeTags.join(',')
  }

  const response = await api.get<PotentialMatchesResponse>(
    `/discovery/potential-matches`,
    { params }
  )
  return response.data
}

/**
 * Like a user
 */
export const likeUser = async (userId: string): Promise<LikeResponse> => {
  const response = await api.post<LikeResponse>(`/discovery/like/${userId}`)
  return response.data
}

/**
 * Pass on a user
 */
export const passUser = async (userId: string): Promise<void> => {
  await api.post(`/discovery/pass/${userId}`)
}

/**
 * Block a user
 */
export const blockUser = async (userId: string): Promise<void> => {
  await api.post(`/discovery/block/${userId}`)
}

/**
 * Undo a pass
 */
export const undoPass = async (userId: string): Promise<void> => {
  await api.delete(`/discovery/pass/${userId}`)
}

/**
 * Get all users the current user has liked
 */
export const getLikedUsers = async (): Promise<LikedUsersResponse> => {
  const response = await api.get<LikedUsersResponse>('/discovery/liked-users')
  return response.data
}

export interface SearchFilters {
  query?: string
  location?: string
  hobbies?: string
  talents?: string
  ageMin?: number
  ageMax?: number
  distance?: number
  gender?: string
  lookingFor?: string
  minCompatibility?: number
  onlineOnly?: boolean
  page?: number
  limit?: number
}

/**
 * Search users with filters
 */
export const searchUsers = async (filters: SearchFilters = {}): Promise<PotentialMatchesResponse> => {
  const params: any = {}

  if (filters.query) params.query = filters.query
  if (filters.location) params.location = filters.location
  if (filters.hobbies) params.hobbies = filters.hobbies
  if (filters.talents) params.talents = filters.talents
  if (filters.ageMin !== undefined) params.ageMin = filters.ageMin
  if (filters.ageMax !== undefined) params.ageMax = filters.ageMax
  if (filters.distance !== undefined) params.distance = filters.distance
  if (filters.gender) params.gender = filters.gender
  if (filters.lookingFor) params.lookingFor = filters.lookingFor
  if (filters.minCompatibility !== undefined) params.minCompatibility = filters.minCompatibility
  if (filters.onlineOnly !== undefined) params.onlineOnly = filters.onlineOnly
  if (filters.page !== undefined) params.page = filters.page
  if (filters.limit !== undefined) params.limit = filters.limit

  const response = await api.get<PotentialMatchesResponse>('/discovery/search', { params })
  return response.data
}

/**
 * Unblock a user
 */
export const unblockUser = async (userId: string): Promise<void> => {
  await api.delete(`/discovery/block/${userId}`)
}

export interface BlockedUser {
  id: string
  username: string
  firstName: string
  lastName: string
  profilePictures: string[]
  blockedAt: string
}

export interface BlockedUsersResponse {
  blockedUsers: BlockedUser[]
}

/**
 * Get all blocked users
 */
export const getBlockedUsers = async (): Promise<BlockedUsersResponse> => {
  const response = await api.get<BlockedUsersResponse>('/discovery/blocked-users')
  return response.data
}
