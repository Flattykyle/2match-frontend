import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Edit2,
  MapPin,
  Camera,
  Bell,
  Shield,
  Eye,
  LogOut,
  Trash2,
  Save,
  UserX,
  Sun,
  Moon,
  Mail,
  Heart,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { getProfileCompletion } from '../services/profileService'
import { ProfileCompletion } from '../types'
import VerificationSection from '../components/VerificationSection'

const Settings = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { darkMode, toggleDarkMode } = useThemeStore()
  const [saved, setSaved] = useState(false)
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null)

  const [settings, setSettings] = useState({
    emailNotifications: true,
    matchNotifications: true,
    messageNotifications: true,
    likesNotifications: true,
    marketingEmails: false,
    showOnline: true,
    showDistance: true,
    showAge: true,
    profileVisibility: 'everyone',
    email: '',
    phone: '',
  })

  useEffect(() => {
    const fetchCompletion = async () => {
      try {
        const data = await getProfileCompletion()
        setCompletion(data)
      } catch (err) {
        console.error('Error fetching profile completion:', err)
      }
    }
    if (user) fetchCompletion()
  }, [user])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      logout()
      navigate('/')
    }
  }

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
  const allTags = [...(user.hobbies || []), ...(user.interests || [])]

  return (
    <div className="min-h-[calc(100vh-4rem)] py-6 sm:py-10">
      <div className="max-w-3xl mx-auto px-4 space-y-8">

        {/* ============ PROFILE HERO CARD ============ */}
        <section className="relative overflow-hidden rounded-3xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 opacity-90" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/30 to-transparent" />

          <div className="relative z-10 p-6 sm:p-8">
            {/* Completion bar */}
            {completion && completion.percentage < 100 && (
              <div className="mb-4 bg-white/20 backdrop-blur rounded-full p-1">
                <div className="flex items-center gap-3 px-3">
                  <span className="text-white/90 text-xs font-medium whitespace-nowrap">
                    {completion.percentage}% complete
                  </span>
                  <div className="flex-1 bg-white/30 rounded-full h-1.5">
                    <div
                      className="bg-white h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${completion.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-5 sm:gap-6">
              {/* Profile photo */}
              <div className="relative flex-shrink-0">
                {user.profilePictures && user.profilePictures.length > 0 ? (
                  <img
                    src={user.profilePictures[0]}
                    alt="Profile"
                    className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-white/30 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center ring-4 ring-white/30">
                    <Camera className="w-8 h-8 text-white/70" />
                  </div>
                )}
                {user.profilePictures && user.profilePictures.length > 1 && (
                  <span className="absolute -bottom-1 -right-1 bg-white text-gray-800 text-xs font-bold px-2 py-0.5 rounded-full shadow">
                    +{user.profilePictures.length - 1}
                  </span>
                )}
              </div>

              {/* Name + quick stats */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
                  {user.firstName} {user.lastName}
                </h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-white/80 text-sm">
                  {age && <span>{age} years</span>}
                  <span className="capitalize">{user.gender}</span>
                  {(user.locationCity || user.locationCountry) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {user.locationCity}{user.locationCity && user.locationCountry && ', '}{user.locationCountry}
                    </span>
                  )}
                </div>
                {user.bio && (
                  <p className="text-white/70 text-sm mt-2 line-clamp-2">{user.bio}</p>
                )}
              </div>
            </div>

            {/* Tags preview */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {allTags.slice(0, 5).map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-white/20 backdrop-blur text-white text-xs rounded-full font-medium">
                    {tag}
                  </span>
                ))}
                {allTags.length > 5 && (
                  <span className="px-3 py-1 text-white/60 text-xs">
                    +{allTags.length - 5} more
                  </span>
                )}
              </div>
            )}

            {/* Edit Profile button */}
            <button
              onClick={() => navigate('/profile/edit')}
              className="mt-5 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold rounded-xl transition-all border border-white/25"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </section>

        {/* ============ APPEARANCE (Dark Mode) ============ */}
        <section className="card border-l-4 border-l-accent-400 dark:border-l-accent-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                darkMode
                  ? 'bg-indigo-900 shadow-lg shadow-indigo-500/30'
                  : 'bg-amber-100 shadow-lg shadow-amber-300/30'
              }`}>
                {darkMode ? (
                  <Moon className="w-6 h-6 text-indigo-200" />
                ) : (
                  <Sun className="w-6 h-6 text-amber-600" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  {darkMode ? 'Dark Mode' : 'Light Mode'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {darkMode ? 'Easy on the eyes at night' : 'Bright and clear during the day'}
                </p>
              </div>
            </div>

            <button
              onClick={toggleDarkMode}
              className={`relative w-16 h-8 rounded-full transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-700 ${
                darkMode ? 'bg-indigo-600' : 'bg-amber-300'
              }`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full shadow-md transition-all duration-500 flex items-center justify-center ${
                darkMode ? 'left-9 bg-indigo-200' : 'left-1 bg-white'
              }`}>
                {darkMode ? (
                  <Moon className="w-3.5 h-3.5 text-indigo-700" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                )}
              </div>
            </button>
          </div>
        </section>

        {/* ============ NOTIFICATIONS ============ */}
        <section className="card border-l-4 border-l-secondary-400 dark:border-l-secondary-500">
          <div className="flex items-center gap-3 mb-5">
            <Bell className="w-5 h-5 text-secondary-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
          </div>

          <div className="space-y-1">
            {[
              { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
              { key: 'matchNotifications', label: 'New Matches', desc: 'Get notified when you have a new match' },
              { key: 'messageNotifications', label: 'Messages', desc: 'Get notified about new messages' },
              { key: 'likesNotifications', label: 'Likes', desc: 'Get notified when someone likes you' },
              { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive tips, offers, and updates' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{item.label}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[item.key as keyof typeof settings] as boolean}
                    onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-500 peer-checked:to-secondary-500"></div>
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* ============ PRIVACY & SAFETY ============ */}
        <section className="card border-l-4 border-l-green-400 dark:border-l-green-500">
          <div className="flex items-center gap-3 mb-5">
            <Shield className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Privacy & Safety</h2>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Who can see your profile
            </label>
            <select
              value={settings.profileVisibility}
              onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value })}
              className="input-field"
            >
              <option value="everyone">Everyone</option>
              <option value="matches">Only My Matches</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>

          <div className="space-y-1">
            {[
              { key: 'showOnline', label: 'Show Online Status', desc: "Let others see when you're online", icon: Eye },
              { key: 'showDistance', label: 'Show Distance', desc: 'Display distance on your profile', icon: MapPin },
              { key: 'showAge', label: 'Show Age', desc: 'Display your age on your profile', icon: Heart },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{item.label}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[item.key as keyof typeof settings] as boolean}
                      onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-500 peer-checked:to-secondary-500"></div>
                  </label>
                </div>
              )
            })}
          </div>

          {/* Privacy tools links */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <button
              onClick={() => navigate('/blocked-users')}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <UserX className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">Blocked Users</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/profile-views')}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">Profile Views</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        {/* ============ VERIFICATION ============ */}
        <section className="card border-l-4 border-l-blue-400 dark:border-l-blue-500 !p-0 overflow-hidden">
          <VerificationSection />
        </section>

        {/* ============ ACCOUNT ============ */}
        <section className="card border-l-4 border-l-primary-400 dark:border-l-primary-500">
          <div className="flex items-center gap-3 mb-5">
            <Mail className="w-5 h-5 text-primary-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Account</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="your.email@example.com"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number (Optional)</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="input-field"
              />
            </div>
          </div>
        </section>

        {/* ============ SAVE BUTTON (sticky on mobile) ============ */}
        <div className="sticky bottom-20 md:bottom-4 z-40">
          <button
            onClick={handleSave}
            className={`w-full btn-primary flex items-center justify-center gap-2 shadow-2xl ${
              saved ? '!from-green-500 !to-emerald-500 hover:!from-green-600 hover:!to-emerald-600' : ''
            }`}
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* ============ SIGN OUT & DANGER ZONE ============ */}
        <section className="space-y-4 pb-8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-gray-700 dark:text-gray-300 font-semibold group"
          >
            <LogOut className="w-5 h-5 group-hover:text-primary-500 transition-colors" />
            <span className="group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              Sign Out
            </span>
          </button>

          <button
            onClick={handleDeleteAccount}
            className="w-full flex items-center justify-center gap-2 p-3 text-sm text-gray-400 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </section>

      </div>
    </div>
  )
}

export default Settings
