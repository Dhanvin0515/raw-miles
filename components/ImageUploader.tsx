'use client'
import React, { useState, useRef } from 'react'
import { UploadCloud, X, Loader2 } from 'lucide-react'

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void
  currentImage?: string
  className?: string
}

export default function ImageUploader({ onUploadSuccess, currentImage, className = '' }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0])
    }
  }

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, WEBP).')
      return
    }

    setIsUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error?.message || 'Upload failed')
      }

      onUploadSuccess(data.secure_url)
    } catch (err: any) {
      setError(err.message || 'Network error during upload')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className={`relative ${className}`}>
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />

      {currentImage ? (
        <div className="relative group w-full h-48 rounded-xl overflow-hidden border-2 border-cream-dark">
          <img src={currentImage} alt="Uploaded" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary py-2 px-4 text-sm"
              disabled={isUploading}
            >
              Change Image
            </button>
            <button
              type="button"
              onClick={() => onUploadSuccess('')}
              className="btn-outline bg-white py-2 px-4 text-sm text-red-600 border-none"
              disabled={isUploading}
            >
              <X size={16} />
            </button>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white">
              <Loader2 className="animate-spin mb-2" size={24} />
              <span className="text-sm font-medium">Uploading...</span>
            </div>
          )}
        </div>
      ) : (
        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          }`}
          style={{ 
            borderColor: isDragging ? 'var(--primary)' : 'rgba(0,0,0,0.2)',
            background: isDragging ? 'rgba(212, 175, 55, 0.05)' : 'var(--cream)',
          }}
        >
          {isUploading ? (
            <div className="flex flex-col items-center text-gray-500">
              <Loader2 className="animate-spin mb-2 text-primary" size={32} />
              <span className="font-medium text-sm">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-gray-500 pointer-events-none">
              <UploadCloud size={40} className="mb-3 text-gray-400" />
              <span className="font-semibold text-sm mb-1 text-dark">Click or drag image here</span>
              <span className="text-xs">Supports JPG, PNG, WEBP</span>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-xs font-medium text-red-600">
          {error}
        </div>
      )}
    </div>
  )
}
