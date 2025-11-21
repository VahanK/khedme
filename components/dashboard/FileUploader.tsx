'use client'

import { useState, useRef } from 'react'
import { Card, CardBody, Button, Progress } from '@heroui/react'
import { CloudArrowUpIcon, XMarkIcon, DocumentIcon } from '@heroicons/react/24/outline'
import { MAX_FILE_SIZE, ALLOWED_EXTENSIONS, formatFileSize } from '@/lib/constants/file-types'

interface FileUploaderProps {
  onUpload: (file: File) => Promise<void>
  projectId: string
  className?: string
}

export default function FileUploader({ onUpload, projectId, className = '' }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
    }
    return null
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    setError(null)
    const validationError = validateFile(file)

    if (validationError) {
      setError(validationError)
      return
    }

    setSelectedFile(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      // Simulate progress (in a real app, you'd track actual upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      await onUpload(selectedFile)

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Reset after successful upload
      setTimeout(() => {
        setSelectedFile(null)
        setUploadProgress(0)
        setIsUploading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to upload file')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setError(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className={className}>
      <CardBody className="p-6">
        {!selectedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
            }`}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <CloudArrowUpIcon className={`w-16 h-16 mx-auto mb-4 ${
              isDragging ? 'text-primary' : 'text-gray-400'
            }`} />

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isDragging ? 'Drop file here' : 'Upload Project File'}
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Drag and drop your file here, or click to browse
            </p>

            <Button
              color="primary"
              variant="flat"
              onPress={handleBrowseClick}
            >
              Browse Files
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              className="hidden"
              accept={ALLOWED_EXTENSIONS.join(',')}
            />

            <p className="text-xs text-gray-400 mt-4">
              Supported formats: Documents, Images, Design files, Code, Archives
            </p>
            <p className="text-xs text-gray-400">
              Maximum file size: {MAX_FILE_SIZE / 1024 / 1024}MB
            </p>

            {error && (
              <p className="text-xs text-danger mt-3 font-medium">
                {error}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected File Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <DocumentIcon className="w-10 h-10 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              {!isUploading && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={handleCancel}
                >
                  <XMarkIcon className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <Progress
                  value={uploadProgress}
                  color="primary"
                  size="sm"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 text-center">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <p className="text-sm text-danger font-medium text-center">
                {error}
              </p>
            )}

            {/* Upload Button */}
            {!isUploading && (
              <div className="flex gap-2">
                <Button
                  color="primary"
                  className="flex-1"
                  onPress={handleUpload}
                  startContent={<CloudArrowUpIcon className="w-5 h-5" />}
                >
                  Upload File
                </Button>
                <Button
                  variant="flat"
                  onPress={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  )
}
