import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Loader2, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { updateProfile } from '../services/profileService'
import { UpdateProfileData } from '../types'
import PhotoUpload from '../components/PhotoUpload'
import TagInput from '../components/TagInput'
import LocationPicker from '../components/LocationPicker'

// Suggestions for tags
const HOBBY_SUGGESTIONS = [
  'Reading', 'Gaming', 'Cooking', 'Photography', 'Traveling', 'Hiking',
  'Swimming', 'Dancing', 'Painting', 'Music', 'Sports', 'Yoga', 'Gardening',
  'Movies', 'Writing', 'Cycling', 'Fishing', 'Camping'
]

const TALENT_SUGGESTIONS = [
  'Singing', 'Drawing', 'Coding', 'Public Speaking', 'Languages', 'Piano',
  'Guitar', 'Design', 'Writing', 'Photography', 'Cooking', 'Dancing',
  'Problem Solving', 'Leadership', 'Teaching'
]

const INTEREST_SUGGESTIONS = [
  'Technology', 'Art', 'Science', 'History', 'Fashion', 'Politics',
  'Environment', 'Animals', 'Food', 'Travel', 'Fitness', 'Music',
  'Movies', 'Books', 'Business', 'Philosophy', 'Psychology'
]

const ProfileEdit = () => {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    locationCity: user?.locationCity || '',
    locationCountry: user?.locationCountry || '',
    latitude: user?.latitude,
    longitude: user?.longitude,
    hobbies: user?.hobbies || [],
    talents: user?.talents || [],
    interests: user?.interests || [],
    lookingFor: user?.lookingFor || 'dating',
    gender: user?.gender || '',
    preferences: user?.preferences || {
      ageMin: 18,
      ageMax: 50,
      distance: 50,
      genderPreference: 'any',
    },
  })

  const [photos, setPhotos] = useState<string[]>(user?.profilePictures || [])

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    // Validate bio length
    if (formData.bio.length > 500) {
      setError('Bio must be 500 characters or less')
      setLoading(false)
      return
    }

    try {
      const updateData: UpdateProfileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        locationCity: formData.locationCity,
        locationCountry: formData.locationCountry,
        latitude: formData.latitude,
        longitude: formData.longitude,
        hobbies: formData.hobbies,
        talents: formData.talents,
        interests: formData.interests,
        lookingFor: formData.lookingFor,
        gender: formData.gender,
        preferences: formData.preferences,
      }

      const updatedUser = await updateProfile(updateData)
      setUser(updatedUser)
      setSuccess(true)

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' })

      // Redirect to settings page after 2 seconds
      setTimeout(() => {
        navigate('/settings')
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating profile')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Settings
          </button>
          <h1 className="text-4xl font-bold">
            <span className="gradient-text">Edit Your Profile</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Complete your profile to get better matches
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-green-700 font-medium">
              Profile updated successfully! Redirecting...
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Photos */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 gradient-text">
              Profile Photos
            </h2>
            <PhotoUpload
              photos={photos}
              onPhotosChange={setPhotos}
              maxPhotos={6}
            />
          </div>

          {/* Basic Information */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 gradient-text">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Looking For *
                </label>
                <select
                  value={formData.lookingFor}
                  onChange={(e) =>
                    setFormData({ ...formData, lookingFor: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="dating">Dating</option>
                  <option value="hookup">Hookup</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bio
                <span className="text-gray-500 font-normal ml-2">
                  ({formData.bio.length}/500)
                </span>
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell others about yourself..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Location */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 gradient-text">Location</h2>
            <LocationPicker
              locationCity={formData.locationCity}
              locationCountry={formData.locationCountry}
              latitude={formData.latitude}
              longitude={formData.longitude}
              onChange={(location) =>
                setFormData({ ...formData, ...location })
              }
            />
          </div>

          {/* Hobbies, Talents, Interests */}
          <div className="card space-y-6">
            <h2 className="text-2xl font-bold gradient-text">
              About You
            </h2>

            <TagInput
              label="Hobbies"
              tags={formData.hobbies}
              onChange={(hobbies) => setFormData({ ...formData, hobbies })}
              placeholder="Add a hobby..."
              suggestions={HOBBY_SUGGESTIONS}
              color="primary"
            />

            <TagInput
              label="Talents"
              tags={formData.talents}
              onChange={(talents) => setFormData({ ...formData, talents })}
              placeholder="Add a talent..."
              suggestions={TALENT_SUGGESTIONS}
              color="secondary"
            />

            <TagInput
              label="Interests"
              tags={formData.interests}
              onChange={(interests) => setFormData({ ...formData, interests })}
              placeholder="Add an interest..."
              suggestions={INTEREST_SUGGESTIONS}
              color="accent"
            />
          </div>

          {/* Preferences */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 gradient-text">
              Match Preferences
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Age Range
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={formData.preferences.ageMin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferences: {
                          ...formData.preferences,
                          ageMin: parseInt(e.target.value),
                        },
                      })
                    }
                    min={18}
                    max={100}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                  <span className="text-gray-600">to</span>
                  <input
                    type="number"
                    value={formData.preferences.ageMax}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferences: {
                          ...formData.preferences,
                          ageMax: parseInt(e.target.value),
                        },
                      })
                    }
                    min={18}
                    max={100}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                  <span className="text-gray-600">years</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Distance
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    value={formData.preferences.distance}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferences: {
                          ...formData.preferences,
                          distance: parseInt(e.target.value),
                        },
                      })
                    }
                    min={1}
                    max={200}
                    className="flex-1"
                  />
                  <span className="text-gray-700 font-medium w-16">
                    {formData.preferences.distance} km
                  </span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender Preference
                </label>
                <select
                  value={formData.preferences.genderPreference}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        genderPreference: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="any">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-semibold dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileEdit
