import { useState, KeyboardEvent } from 'react'
import { X, Plus } from 'lucide-react'

interface TagInputProps {
  label: string
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  suggestions?: string[]
  color?: 'primary' | 'secondary' | 'accent'
}

const TagInput = ({
  label,
  tags,
  onChange,
  placeholder = 'Add a tag...',
  maxTags = 10,
  suggestions = [],
  color = 'primary',
}: TagInputProps) => {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const colorClasses = {
    primary: 'bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 hover:from-primary-200 hover:to-primary-300',
    secondary: 'bg-gradient-to-r from-secondary-100 to-secondary-200 text-secondary-700 hover:from-secondary-200 hover:to-secondary-300',
    accent: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 hover:from-purple-200 hover:to-pink-200',
  }

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (!trimmedTag) return
    if (tags.includes(trimmedTag)) return
    if (tags.length >= maxTags) return

    onChange([...tags, trimmedTag])
    setInputValue('')
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag when pressing backspace on empty input
      onChange(tags.slice(0, -1))
    }
  }

  const handleRemoveTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index))
  }

  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(suggestion)
  )

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        <span className="text-gray-500 font-normal ml-2">
          ({tags.length}/{maxTags})
        </span>
      </label>

      {/* Tags Display */}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${colorClasses[color]}`}
          >
            {tag}
            <button
              onClick={() => handleRemoveTag(index)}
              className="hover:scale-110 transition-transform"
              type="button"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      {tags.length < maxTags && (
        <div className="relative">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                setShowSuggestions(e.target.value.length > 0)
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(inputValue.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={placeholder}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => handleAddTag(inputValue)}
              disabled={!inputValue.trim()}
              className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredSuggestions.slice(0, 8).map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAddTag(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 transition-colors text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TagInput
