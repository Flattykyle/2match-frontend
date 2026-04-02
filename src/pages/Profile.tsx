import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit2, MapPin, Heart, Camera, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { getProfileCompletion } from '../services/profileService'
import { ProfileCompletion } from '../types'

const Profile = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null)
  const [_loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCompletion = async () => {
      try {
        const data = await getProfileCompletion()
        setCompletion(data)
      } catch (err) {
        console.error('Error fetching profile completion:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchCompletion()
    }
  }, [user])

  if (!user) {
    navigate('/login')
    return null
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const age = user.dateOfBirth ? calculateAge(user.dateOfBirth) : null

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">
            <span className="gradient-text">Your Profile</span>
          </h1>
          <button
            onClick={() => navigate('/profile/edit')}
            className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Edit2 className="w-5 h-5" />
            Edit Profile
          </button>
        </div>

        {/* Profile Completion */}
        {completion && completion.percentage < 100 && (
          <div className="card mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-900 mb-2">
                  Complete Your Profile ({completion.percentage}%)
                </h3>
                <div className="w-full bg-amber-200 rounded-full h-2 mb-3">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${completion.percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-amber-800 mb-2">
                  Missing: {completion.missingFields.join(', ')}
                </p>
                <button
                  onClick={() => navigate('/profile/edit')}
                  className="text-sm font-semibold text-amber-700 hover:text-amber-900 underline"
                >
                  Complete now →
                </button>
              </div>
            </div>
          </div>
        )}

        {completion && completion.percentage === 100 && (
          <div className="card mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <p className="text-green-800 font-semibold">
                Your profile is 100% complete! Great job! 🎉
              </p>
            </div>
          </div>
        )}

        {/* Main Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Photos and Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Photos */}
            <div className="card">
              {user.profilePictures && user.profilePictures.length > 0 ? (
                <div className="space-y-3">
                  <img
                    src={user.profilePictures[0]}
                    alt="Primary profile"
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  {user.profilePictures.length > 1 && (
                    <div className="grid grid-cols-3 gap-2">
                      {user.profilePictures.slice(1).map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Profile ${index + 2}`}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex flex-col items-center justify-center text-gray-500">
                  <Camera className="w-16 h-16 mb-4 opacity-50" />
                  <p className="font-medium">No photos yet</p>
                  <button
                    onClick={() => navigate('/profile/edit')}
                    className="mt-4 text-primary-600 hover:text-primary-700 underline text-sm"
                  >
                    Add photos
                  </button>
                </div>
              )}
            </div>

            {/* Basic Info Card */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4 gradient-text">Basic Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                {age && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-semibold">{age} years</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-semibold capitalize">{user.gender}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="font-semibold capitalize">{user.lookingFor}</span>
                </div>
                {(user.locationCity || user.locationCountry) && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-600 mt-0.5" />
                    <span className="font-semibold">
                      {user.locationCity}
                      {user.locationCity && user.locationCountry && ', '}
                      {user.locationCountry}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <div className="card">
              <h3 className="text-xl font-bold mb-3 gradient-text">About Me</h3>
              <p className="text-gray-700 leading-relaxed">
                {user.bio || (
                  <span className="text-gray-500 italic">
                    No bio added yet. Click "Edit Profile" to add one!
                  </span>
                )}
              </p>
            </div>

            {/* Hobbies */}
            {user.hobbies && user.hobbies.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-bold mb-3 gradient-text">Hobbies</h3>
                <div className="flex flex-wrap gap-2">
                  {user.hobbies.map((hobby, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 rounded-full text-sm font-medium"
                    >
                      {hobby}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Talents */}
            {user.talents && user.talents.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-bold mb-3 gradient-text">Talents</h3>
                <div className="flex flex-wrap gap-2">
                  {user.talents.map((talent, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-secondary-100 to-secondary-200 text-secondary-700 rounded-full text-sm font-medium"
                    >
                      {talent}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interests */}
            {user.interests && user.interests.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-bold mb-3 gradient-text">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Preferences */}
            {user.preferences && (
              <div className="card">
                <h3 className="text-xl font-bold mb-3 gradient-text">
                  Match Preferences
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Age Range</p>
                    <p className="text-lg font-bold text-primary-700">
                      {user.preferences.ageMin} - {user.preferences.ageMax}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Distance</p>
                    <p className="text-lg font-bold text-secondary-700">
                      {user.preferences.distance} km
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Gender</p>
                    <p className="text-lg font-bold text-purple-700 capitalize">
                      {user.preferences.genderPreference}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
