import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { uploadProfilePhoto, deleteProfilePhoto, reorderProfilePhotos } from '../services/profileService'

interface PhotoUploadProps {
  photos: string[]
  onPhotosChange: (photos: string[]) => void
  maxPhotos?: number
}

const PhotoUpload = ({ photos, onPhotosChange, maxPhotos = 6 }: PhotoUploadProps) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (photos.length >= maxPhotos) {
        setError(`Maximum ${maxPhotos} photos allowed`)
        return
      }

      const file = acceptedFiles[0]
      if (!file) return

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }

      setError(null)
      setUploading(true)

      try {
        const response = await uploadProfilePhoto(file)
        onPhotosChange([...photos, response.url])
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error uploading photo')
      } finally {
        setUploading(false)
      }
    },
    [photos, onPhotosChange, maxPhotos]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    disabled: photos.length >= maxPhotos || uploading,
  })

  const handleDelete = async (index: number, photoUrl: string) => {
    setDeletingIndex(index)
    setError(null)

    try {
      await deleteProfilePhoto(photoUrl)
      const newPhotos = photos.filter((_, i) => i !== index)
      onPhotosChange(newPhotos)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error deleting photo')
    } finally {
      setDeletingIndex(null)
    }
  }

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const newPhotos = [...photos]
    const [movedItem] = newPhotos.splice(fromIndex, 1)
    newPhotos.splice(toIndex, 0, movedItem)

    onPhotosChange(newPhotos)

    try {
      await reorderProfilePhotos(newPhotos)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error reordering photos')
      // Revert on error
      onPhotosChange(photos)
    }
  }

  return (
    <div className="space-y-4">
      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div
            key={photo}
            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('text/plain', index.toString())
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
              if (fromIndex !== index) {
                handleReorder(fromIndex, index)
              }
            }}
          >
            <img
              src={photo}
              alt={`Profile photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                Primary
              </div>
            )}
            <button
              onClick={() => handleDelete(index, photo)}
              disabled={deletingIndex === index}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
            >
              {deletingIndex === index ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}

        {/* Upload Box */}
        {photos.length < maxPhotos && (
          <div
            {...getRootProps()}
            className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-2" />
                <p className="text-sm text-gray-600">Uploading...</p>
              </>
            ) : isDragActive ? (
              <>
                <ImageIcon className="w-8 h-8 text-primary-500 mb-2" />
                <p className="text-sm text-primary-600 font-medium">Drop photo here</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 font-medium">Upload Photo</p>
                <p className="text-xs text-gray-500 mt-1">
                  {photos.length}/{maxPhotos}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Help Text */}
      <div className="text-sm text-gray-600">
        <p className="font-medium mb-1">Photo Tips:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Upload up to {maxPhotos} photos</li>
          <li>First photo will be your primary profile picture</li>
          <li>Drag photos to reorder them</li>
          <li>Supported formats: JPG, PNG, WebP (max 5MB)</li>
        </ul>
      </div>
    </div>
  )
}

export default PhotoUpload
