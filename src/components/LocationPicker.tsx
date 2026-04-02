import { useState } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

interface LocationPickerProps {
  locationCity?: string
  locationCountry?: string
  latitude?: number
  longitude?: number
  onChange: (location: {
    locationCity: string
    locationCountry: string
    latitude?: number
    longitude?: number
  }) => void
}

const LocationPicker = ({
  locationCity = '',
  locationCountry = '',
  latitude,
  longitude,
  onChange,
}: LocationPickerProps) => {
  const [city, setCity] = useState(locationCity)
  const [country, setCountry] = useState(locationCountry)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude

        try {
          // Use Nominatim API for reverse geocoding (free, no API key required)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`
          )
          const data = await response.json()

          const cityName = data.address.city || data.address.town || data.address.village || ''
          const countryName = data.address.country || ''

          setCity(cityName)
          setCountry(countryName)
          onChange({
            locationCity: cityName,
            locationCountry: countryName,
            latitude: lat,
            longitude: lon,
          })
        } catch {
          setError('Error getting location name')
        } finally {
          setLoading(false)
        }
      },
      () => {
        setError('Unable to retrieve your location')
        setLoading(false)
      }
    )
  }

  const handleManualUpdate = () => {
    onChange({
      locationCity: city,
      locationCountry: country,
    })
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700">
        Location
      </label>

      {/* Current Location Button */}
      <button
        type="button"
        onClick={handleGetCurrentLocation}
        disabled={loading}
        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all flex items-center justify-center gap-2 text-gray-700 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Getting location...</span>
          </>
        ) : (
          <>
            <MapPin className="w-5 h-5" />
            <span>Use Current Location</span>
          </>
        )}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Manual Input */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => {
              setCity(e.target.value)
              handleManualUpdate()
            }}
            placeholder="Enter city"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <input
            type="text"
            value={country}
            onChange={(e) => {
              setCountry(e.target.value)
              handleManualUpdate()
            }}
            placeholder="Enter country"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* Display Coordinates if available */}
      {latitude && longitude && (
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <MapPin className="w-3 h-3" />
          <span>
            Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </span>
        </div>
      )}
    </div>
  )
}

export default LocationPicker
