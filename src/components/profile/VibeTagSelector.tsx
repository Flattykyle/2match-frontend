import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { vibeTagService, VibeTag, VibeTagsGrouped } from '../../services/vibeTagService'

/* ── Types ── */
interface VibeTagSelectorProps {
  onSave?: (tags: VibeTag[]) => void
  className?: string
}

const MAX_TAGS = 5

const categoryLabels: Record<string, string> = {
  LIFESTYLE: 'Lifestyle',
  PERSONALITY: 'Personality',
  INTERESTS: 'Interests',
  VALUES: 'Values',
}

const categoryEmojis: Record<string, string> = {
  LIFESTYLE: '🌿',
  PERSONALITY: '✨',
  INTERESTS: '🎯',
  VALUES: '💎',
}

/* ── Shake animation for "max reached" feedback ── */
const shakeVariants = {
  shake: {
    x: [0, -6, 6, -4, 4, -2, 2, 0],
    transition: { duration: 0.4 },
  },
}

/* ── Component ── */
export default function VibeTagSelector({ onSave, className = '' }: VibeTagSelectorProps) {
  const [allTags, setAllTags] = useState<VibeTagsGrouped>({})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [shakeTagId, setShakeTagId] = useState<string | null>(null)
  const [showMaxTooltip, setShowMaxTooltip] = useState(false)

  // Load all tags + user's current selection
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [grouped, mine] = await Promise.all([
          vibeTagService.getAll(),
          vibeTagService.getMine(),
        ])
        setAllTags(grouped)
        setSelectedIds(new Set(mine.map((t) => t.id)))
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load vibe tags')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleToggle = useCallback(
    (tag: VibeTag) => {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        if (next.has(tag.id)) {
          // Deselect
          next.delete(tag.id)
          setShowMaxTooltip(false)
        } else if (next.size >= MAX_TAGS) {
          // At max — shake + tooltip
          setShakeTagId(tag.id)
          setShowMaxTooltip(true)
          setTimeout(() => {
            setShakeTagId(null)
            setShowMaxTooltip(false)
          }, 1200)
          return prev // Don't change selection
        } else {
          // Select
          next.add(tag.id)
          if (next.size >= MAX_TAGS) {
            setShowMaxTooltip(true)
            setTimeout(() => setShowMaxTooltip(false), 2000)
          }
        }
        return next
      })
    },
    []
  )

  const handleSave = async () => {
    try {
      setSaving(true)
      const saved = await vibeTagService.update(Array.from(selectedIds))
      onSave?.(saved)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const selectedCount = selectedIds.size
  const atMax = selectedCount >= MAX_TAGS

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Counter */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[var(--color-text)]">Your Vibe Tags</h3>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {showMaxTooltip && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="text-xs font-semibold text-[var(--color-danger)]"
              >
                Max {MAX_TAGS} tags
              </motion.span>
            )}
          </AnimatePresence>
          <span
            className={[
              'text-sm font-bold px-2.5 py-0.5 rounded-full',
              atMax
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-primary-50)] text-[var(--color-primary)]',
            ].join(' ')}
          >
            {selectedCount}/{MAX_TAGS}
          </span>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-5">
        {(Object.entries(allTags) as [string, VibeTag[]][]).map(([category, tags]) => {
          if (!tags || tags.length === 0) return null

          return (
            <div key={category}>
              <h4 className="text-sm font-bold text-[var(--color-text-secondary)] mb-2 flex items-center gap-1.5">
                <span>{categoryEmojis[category] || ''}</span>
                {categoryLabels[category] || category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const isSelected = selectedIds.has(tag.id)
                  const isDisabled = atMax && !isSelected
                  const isShaking = shakeTagId === tag.id

                  return (
                    <motion.button
                      key={tag.id}
                      variants={isShaking ? shakeVariants : undefined}
                      animate={isShaking ? 'shake' : undefined}
                      whileTap={!isDisabled ? { scale: 0.93 } : undefined}
                      onClick={() => handleToggle(tag)}
                      className={[
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold',
                        'transition-all duration-200 select-none',
                        isSelected
                          ? 'bg-[var(--color-primary)] text-white shadow-sm'
                          : isDisabled
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                          : 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)] hover:bg-[var(--color-primary-100)] dark:bg-secondary-800 dark:text-primary-300 dark:hover:bg-secondary-700',
                      ].join(' ')}
                    >
                      <span className="text-base leading-none">{tag.emoji}</span>
                      <span>{tag.label}</span>
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-0.5 text-white/80"
                        >
                          ✓
                        </motion.span>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Save button */}
      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Vibe Tags'
          )}
        </button>
      </div>
    </div>
  )
}
