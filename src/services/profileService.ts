import api from './api'
import {
  User,
  UpdateProfileData,
  ProfileCompletion,
  PhotoUploadResponse,
} from '../types'

/**
 * Get profile completion percentage
 */
export const getProfileCompletion = async (): Promise<ProfileCompletion> => {
  const response = await api.get<ProfileCompletion>('/profile/completion')
  return response.data
}

/**
 * Update user profile
 */
export const updateProfile = async (data: UpdateProfileData): Promise<User> => {
  const response = await api.put<User>('/profile', data)
  return response.data
}

/**
 * Upload a profile photo
 */
export const uploadProfilePhoto = async (file: File): Promise<PhotoUploadResponse> => {
  const formData = new FormData()
  formData.append('photo', file)

  const response = await api.post<PhotoUploadResponse>('/profile/photos', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

/**
 * Delete a profile photo
 */
export const deleteProfilePhoto = async (photoUrl: string): Promise<void> => {
  await api.delete('/profile/photos', {
    data: { photoUrl },
  })
}

/**
 * Reorder profile photos
 */
export const reorderProfilePhotos = async (photoUrls: string[]): Promise<void> => {
  await api.put('/profile/photos/reorder', { photoUrls })
}

/**
 * Get user's own profile
 */
export const getMyProfile = async (): Promise<User> => {
  const response = await api.get<User>('/auth/me')
  return response.data
}
