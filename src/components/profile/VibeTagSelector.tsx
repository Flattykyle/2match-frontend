import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { vibeTagService, VibeTag, VibeTagsGrouped, VibeTagCategory } from '../../services/vibeTagService'

/* ── Types ── */
interface VibeTagSelectorProps {
  /** Called after saving tags to the server */
  onSave?: (tags: VibeTag[]) => void
  /** Filter mode: no save button, just multi-select for discovery filters */
  filterMode?: boolean
  /** Controlled selected IDs for filter mode */
  selectedTagIds?: string[]
  /** Callback for filter mode selection changes */
  onSelectionChange?: (ids: string[]) => void
  className?: string
}

const MIN_TAGS = 3
const MAX_TAGS = 5

const CATEGORY_ORDER: VibeTagCategory[] = ['PERSONALITY', 'LIFESTYLE', 'DATING_STYLE', 'HUMOUR', 'VALUES', 'INTERESTS']

const categoryLabels: Record<string, string> = {
  PERSONALITY: 'Personality',
  LIFESTYLE: 'Lifestyle',
  DATING_STYLE: 'Dating Style',
  HUMOUR: 'Humour',
  VALUES: 'Values',
  INTERESTS: 'Interests',
}

/* ── Spring animation for satisfying select bounce ── */
const chipSpring = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 15,
}

/* ── Component ── */
export default function VibeTagSelector({
  onSave,
  filterMode = false,
  selectedTagIds,
  onSelectionChange,
  className = '',
}: VibeTagSelectorProps) {
  const [allTags, setAllTags] = useState<VibeTagsGrouped>({})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [activeCategory, setActiveCategory] = useState<VibeTagCategory>('PERSONALITY')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [shakeTagId, setShakeTagId] = useState<string | null>(null)
  const tabsRef = useRef<HTMLDivElement>(null)

  const maxTags = filterMode ? Infinity : MAX_TAGS

  // Load tags + user's current selection
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const grouped = await vibeTagService.getAll()
        setAllTags(grouped)

        // Set initial active category to first one that has tags
        const firstCat = CATEGORY_ORDER.find((c) => grouped[c]?.length)
        if (firstCat) setActiveCategory(firstCat)

        if (filterMode && selectedTagIds) {
          setSelectedIds(new Set(selectedTagIds))
        } else if (!filterMode) {
          const mine = await vibeTagService.getMine()
          setSelectedIds(new Set(mine.map((t) => t.id)))
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load vibe tags')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Sync controlled selectedTagIds in filter mode
  useEffect(() => {
    if (filterMode && selectedTagIds) {
      setSelectedIds(new Set(selectedTagIds))
    }
  }, [filterMode, selectedTagIds])

  const handleToggle = useCallback(
    (tag: VibeTag) => {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        if (next.has(tag.id)) {
          next.delete(tag.id)
        } else if (next.size >= maxTags) {
          setShakeTagId(tag.id)
          setTimeout(() => setShakeTagId(null), 600)
          return prev
        } else {
          next.add(tag.id)
        }

        if (filterMode && onSelectionChange) {
          onSelectionChange(Array.from(next))
        }

        return next
      })
    },
    [maxTags, filterMode, onSelectionChange]
  )

  const handleSave = async () => {
    if (selectedIds.size < MIN_TAGS) {
      setError(`Select at least ${MIN_TAGS} tags`)
      return
    }
    try {
      setSaving(true)
      setError('')
      const saved = await vibeTagService.update(Array.from(selectedIds))
      onSave?.(saved)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const selectedCount = selectedIds.size
  const atMax = !filterMode && selectedCount >= MAX_TAGS

  // Get tags for the active category
  const categoryTags = allTags[activeCategory] || []
  const availableCategories = CATEGORY_ORDER.filter((c) => allTags[c]?.length)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#9FCFBF' }} />
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Counter */}
      {!filterMode && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ color: '#2B2B2B' }}>Your Vibe Tags</h3>
          <span
            className="text-sm font-bold px-3 py-1 rounded-full"
            style={{
              backgroundColor: atMax ? '#E8735A' : '#E1F5EE',
              color: atMax ? '#fff' : '#2D5C4F',
            }}
          >
            {selectedCount} of {MAX_TAGS} selected
          </span>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-500 mb-3 px-1">{error}</div>
      )}

      {/* Category tabs — horizontal scroll */}
      <div
        ref={tabsRef}
        className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {availableCategories.map((cat) => {
          const isActive = cat === activeCategory
          const catCount = (allTags[cat] || []).filter((t) => selectedIds.has(t.id)).length

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap"
              style={{
                backgroundColor: isActive ? '#2D5C4F' : '#F5EDD8',
                color: isActive ? '#fff' : '#6B7B75',
              }}
            >
              {categoryLabels[cat]}
              {catCount > 0 && (
                <span
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full"
                  style={{
                    backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : '#E8735A',
                    color: '#fff',
                  }}
                >
                  {catCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tags grid — wrapping flex */}
      <div className="flex flex-wrap gap-2.5">
        <AnimatePresence mode="popLayout">
          {categoryTags.map((tag) => {
            const isSelected = selectedIds.has(tag.id)
            const isDisabled = atMax && !isSelected
            const isShaking = shakeTagId === tag.id

            return (
              <motion.button
                key={tag.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: isDisabled ? 0.4 : 1,
                  scale: isShaking ? [1, 0.95, 1.05, 0.97, 1] : isSelected ? 1 : 1,
                }}
                whileTap={!isDisabled ? { scale: 0.9 } : undefined}
                transition={chipSpring}
                onClick={() => handleToggle(tag)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold select-none transition-colors"
                style={{
                  backgroundColor: isSelected ? '#E8735A' : 'transparent',
                  color: isSelected ? '#fff' : '#2B2B2B',
                  border: isSelected ? '2px solid #E8735A' : '2px solid #E1E5E3',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                }}
              >
                <span className="text-base leading-none">{tag.emoji}</span>
                <span>{tag.label}</span>
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 90 }}
                    transition={chipSpring}
                    className="ml-0.5"
                  >
                    ✓
                  </motion.span>
                )}
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Save button (profile mode only) */}
      {!filterMode && (
        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={saving || selectedCount < MIN_TAGS}
            className="w-full py-3 rounded-2xl text-white font-bold text-sm transition-all disabled:opacity-40"
            style={{ backgroundColor: '#2D5C4F' }}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : selectedCount < MIN_TAGS ? (
              `Select ${MIN_TAGS - selectedCount} more tag${MIN_TAGS - selectedCount > 1 ? 's' : ''}`
            ) : (
              'Save Vibe Tags'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
