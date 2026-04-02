import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Shield, Sparkles, Users, TrendingUp, Zap, Search } from 'lucide-react'

const Home = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-secondary-100 to-accent-100 opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg mb-8">
              <Sparkles className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-semibold text-gray-700">
                Join 10,000+ Happy Couples
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Find Your <span className="gradient-text">Perfect Match</span>
              <br />
              Through Real <span className="gradient-text">Compatibility</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Experience intelligent matching powered by shared interests, values, and proximity.
              Connect authentically, chat safely, and find meaningful relationships.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5" fill="currentColor" />
                Get Started Free
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                Sign In
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-8 max-w-3xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 sm:p-4 shadow-lg">
                <div className="text-xl sm:text-3xl md:text-4xl font-bold gradient-text mb-1">10K+</div>
                <div className="text-xs sm:text-sm md:text-base text-gray-600">Active Users</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 sm:p-4 shadow-lg">
                <div className="text-xl sm:text-3xl md:text-4xl font-bold gradient-text mb-1">5K+</div>
                <div className="text-xs sm:text-sm md:text-base text-gray-600">Matches Made</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 sm:p-4 shadow-lg">
                <div className="text-xl sm:text-3xl md:text-4xl font-bold gradient-text mb-1">98%</div>
                <div className="text-xs sm:text-sm md:text-base text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Choose <span className="gradient-text">2-Match?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience dating reimagined with intelligent features designed for meaningful connections
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Feature 1 */}
          <div className="card group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Smart Compatibility</h3>
            <p className="text-gray-600">
              Our advanced algorithm calculates compatibility based on hobbies, talents, location, and values
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Real-time Chat</h3>
            <p className="text-gray-600">
              Instant messaging with typing indicators, read receipts, and emoji support
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Advanced Search</h3>
            <p className="text-gray-600">
              Filter by age, location, interests, and compatibility to find exactly who you're looking for
            </p>
          </div>

          {/* Feature 4 */}
          <div className="card group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Safe & Secure</h3>
            <p className="text-gray-600">
              Your privacy matters. Block, report, and control who sees your profile
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How <span className="gradient-text">2-Match</span> Works
            </h2>
            <p className="text-xl text-gray-600">Get started in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="card text-center">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  1
                </div>
                <div className="mt-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-primary-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Create Profile</h3>
                  <p className="text-gray-600">
                    Add photos, share your hobbies and talents, set your preferences
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="card text-center">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  2
                </div>
                <div className="mt-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Discover Matches</h3>
                  <p className="text-gray-600">
                    Browse compatible profiles and see your match percentage
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="card text-center">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  3
                </div>
                <div className="mt-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Connect & Chat</h3>
                  <p className="text-gray-600">
                    Match mutually and start meaningful conversations instantly
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 rounded-3xl p-12 md:p-16 text-center shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Find Your Match?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of singles finding meaningful connections every day
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold text-lg px-8 py-4 rounded-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            <Heart className="w-6 h-6" fill="currentColor" />
            Start Your Journey Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md mt-10 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">&copy; 2025 2-Match. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
