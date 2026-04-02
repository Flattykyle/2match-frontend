import { useState, useEffect } from 'react'
import {
  Search as SearchIcon,
  Filter,
  X,
  Loader2,
  Save,
  Trash2,
  MapPin,
  Sparkles,
} from 'lucide-react'
import { searchUsers, likeUser, SearchFilters, PotentialMatch } from '../services/discoveryService'
import MatchCard from '../components/MatchCard'

interface SavedSearch {
  id: string
  name: string
  filters: SearchFilters
}

const Search = () => {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<PotentialMatch[]>([])
  const [total, setTotal] = useState(0)
  const [showFilters, setShowFilters] = useState(true)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [searchName, setSearchName] = useState('')

  // Filters state
  const [filters, setFilters] = useState<SearchFilters>(() => {
    const saved = localStorage.getItem('searchFilters')
    return saved ? JSON.parse(saved) : {
      query: '',
      location: '',
      hobbies: '',
      talents: '',
      ageMin: 18,
      ageMax: 80,
      distance: 100,
      gender: 'any',
      lookingFor: '',
      minCompatibility: 0,
      page: 1,
      limit: 20,
    }
  })

  // Saved searches
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    const saved = localStorage.getItem('savedSearches')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('searchFilters', JSON.stringify(filters))
  }, [filters])

  useEffect(() => {
    performSearch()
  }, [filters.page])

  const performSearch = async () => {
    try {
      setLoading(true)
      const response = await searchUsers(filters)
      setResults(response.users)
      setTotal(response.pagination.total)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 })
    performSearch()
  }

  const handleClearFilters = () => {
    const defaultFilters: SearchFilters = {
      query: '',
      location: '',
      hobbies: '',
      talents: '',
      ageMin: 18,
      ageMax: 80,
      distance: 100,
      gender: 'any',
      lookingFor: '',
      minCompatibility: 0,
      page: 1,
      limit: 20,
    }
    setFilters(defaultFilters)
    setTimeout(() => performSearch(), 100)
  }

  const handleSaveSearch = () => {
    if (!searchName.trim()) return

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchName.trim(),
      filters: { ...filters },
    }

    const updated = [...savedSearches, newSearch]
    setSavedSearches(updated)
    localStorage.setItem('savedSearches', JSON.stringify(updated))
    setSearchName('')
    setShowSaveModal(false)
  }

  const handleLoadSearch = (search: SavedSearch) => {
    setFilters(search.filters)
    setTimeout(() => performSearch(), 100)
  }

  const handleDeleteSearch = (id: string) => {
    const updated = savedSearches.filter(s => s.id !== id)
    setSavedSearches(updated)
    localStorage.setItem('savedSearches', JSON.stringify(updated))
  }

  const handleLike = async (userId: string) => {
    try {
      const response = await likeUser(userId)
      if (response.isMatch) {
        alert(`It's a match!`)
      }
      // Remove from results
      setResults(results.filter(r => r.id !== userId))
    } catch (error) {
      console.error('Like error:', error)
    }
  }

  const handlePass = (userId: string) => {
    setResults(results.filter(r => r.id !== userId))
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <SearchIcon className="w-8 h-8" />
            Search Profiles
          </h1>
          <p className="text-gray-600 mt-2">
            {total > 0 ? `${total} ${total === 1 ? 'profile' : 'profiles'} found` : 'No results yet'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar */}
          <div
            className={`${
              showFilters ? 'w-full lg:w-80' : 'w-0 hidden lg:block'
            } transition-all duration-300 overflow-hidden flex-shrink-0`}
          >
            <div className="card space-y-4 lg:space-y-6 sticky top-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary-600" />
                  Filters
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Query */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search by name
                </label>
                <input
                  type="text"
                  value={filters.query || ''}
                  onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                  placeholder="Enter name or username..."
                  className="input-field"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Location
                </label>
                <input
                  type="text"
                  value={filters.location || ''}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  placeholder="City or country..."
                  className="input-field"
                />
              </div>

              {/* Hobbies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hobbies
                </label>
                <input
                  type="text"
                  value={filters.hobbies || ''}
                  onChange={(e) => setFilters({ ...filters, hobbies: e.target.value })}
                  placeholder="e.g., hiking, reading..."
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
              </div>

              {/* Talents */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  Talents
                </label>
                <input
                  type="text"
                  value={filters.talents || ''}
                  onChange={(e) => setFilters({ ...filters, talents: e.target.value })}
                  placeholder="e.g., singing, coding..."
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
              </div>

              {/* Age Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age Range: {filters.ageMin} - {filters.ageMax}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="18"
                    max="80"
                    value={filters.ageMin}
                    onChange={(e) => setFilters({ ...filters, ageMin: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gradient-to-r from-primary-200 to-primary-400 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="range"
                    min="18"
                    max="80"
                    value={filters.ageMax}
                    onChange={(e) => setFilters({ ...filters, ageMax: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gradient-to-r from-secondary-200 to-secondary-400 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Distance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distance: {filters.distance} km
                </label>
                <input
                  type="range"
                  min="1"
                  max="500"
                  value={filters.distance}
                  onChange={(e) => setFilters({ ...filters, distance: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gradient-to-r from-primary-200 to-accent-400 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={filters.gender}
                  onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                  className="input-field"
                >
                  <option value="any">Any</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Looking For */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Looking For
                </label>
                <select
                  value={filters.lookingFor || ''}
                  onChange={(e) => setFilters({ ...filters, lookingFor: e.target.value })}
                  className="input-field"
                >
                  <option value="">Any</option>
                  <option value="Dating">Dating</option>
                  <option value="Hookup">Hookup</option>
                  <option value="Both">Both</option>
                </select>
              </div>

              {/* Compatibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Compatibility: {filters.minCompatibility}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minCompatibility}
                  onChange={(e) => setFilters({ ...filters, minCompatibility: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gradient-to-r from-red-300 via-yellow-300 to-green-400 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <SearchIcon className="w-5 h-5" />
                      Search
                    </>
                  )}
                </button>
                <button
                  onClick={handleClearFilters}
                  className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Search
                </button>
              </div>

              {/* Saved Searches */}
              {savedSearches.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-semibold mb-3 text-gray-700">Saved Searches</h3>
                  <div className="space-y-2">
                    {savedSearches.map((search) => (
                      <div
                        key={search.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <button
                          onClick={() => handleLoadSearch(search)}
                          className="flex-1 text-left text-sm font-medium text-gray-700"
                        >
                          {search.name}
                        </button>
                        <button
                          onClick={() => handleDeleteSearch(search.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {!showFilters && (
              <button
                onClick={() => setShowFilters(true)}
                className="mb-4 px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors w-full sm:w-auto"
              >
                <Filter className="w-5 h-5" />
                Show Filters
              </button>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
                  <p className="text-gray-600">Searching...</p>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="card text-center py-20">
                <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Results Found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search criteria
                </p>
                <button onClick={handleClearFilters} className="btn-primary">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {results.map((user) => (
                  <MatchCard
                    key={user.id}
                    user={user}
                    onLike={() => handleLike(user.id)}
                    onPass={() => handlePass(user.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Search Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Save Search</h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Enter search name..."
              className="input-field mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSearch}
                disabled={!searchName.trim()}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Search
