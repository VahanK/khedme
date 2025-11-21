'use client'

import { useState, useRef } from 'react'
import { Card, CardBody, Button, Progress } from '@heroui/react'
import { CloudArrowUpIcon, XMarkIcon, DocumentIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { MAX_FILE_SIZE, formatFileSize } from '@/lib/constants/file-types'
import { validateFile } from '@/lib/constants/file-types'

interface FileWithStatus {
  file: File
  id: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

interface BatchFileUploaderProps {
  onUpload: (file: File) => Promise<void>
  projectId: string
  className?: string
  maxFiles?: number
}

export default function BatchFileUploader({
  onUpload,
  projectId,
  className = '',
  maxFiles = 10
}: BatchFileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileWithStatus[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFileWrapper = (file: File): string | null => {
    const validation = validateFile(file)
    if (!validation.valid) {
      return validation.error || 'Invalid file'
    }
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

    const files = Array.from(e.dataTransfer.files)
    handleFilesSelect(files)
  }

  const handleFilesSelect = (files: File[]) => {
    const currentCount = selectedFiles.length
    const remainingSlots = maxFiles - currentCount

    if (files.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more file(s). Maximum is ${maxFiles} files.`)
      files = files.slice(0, remainingSlots)
    }

    const newFiles: FileWithStatus[] = files.map(file => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      status: 'pending' as const,
      progress: 0,
      error: validateFileWrapper(file) || undefined
    }))

    setSelectedFiles(prev => [...prev, ...newFiles])
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFilesSelect(Array.from(files))
    }
    // Reset input so the same file can be selected again
    e.target.value = ''
  }

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id))
  }

  const uploadFile = async (fileWithStatus: FileWithStatus): Promise<void> => {
    if (fileWithStatus.error) {
      throw new Error(fileWithStatus.error)
    }

    // Update status to uploading
    setSelectedFiles(prev =>
      prev.map(f => f.id === fileWithStatus.id ? { ...f, status: 'uploading' as const, progress: 0 } : f)
    )

    try {
      // Simulate progress updates (in real scenario, you might track actual upload progress)
      const progressInterval = setInterval(() => {
        setSelectedFiles(prev =>
          prev.map(f => {
            if (f.id === fileWithStatus.id && f.progress < 90) {
              return { ...f, progress: Math.min(f.progress + 15, 90) }
            }
            return f
          })
        )
      }, 150)

      await onUpload(fileWithStatus.file)

      clearInterval(progressInterval)

      // Mark as success
      setSelectedFiles(prev =>
        prev.map(f =>
          f.id === fileWithStatus.id
            ? { ...f, status: 'success' as const, progress: 100 }
            : f
        )
      )
    } catch (err: any) {
      // Mark as error
      setSelectedFiles(prev =>
        prev.map(f =>
          f.id === fileWithStatus.id
            ? { ...f, status: 'error' as const, progress: 0, error: err.message || 'Upload failed' }
            : f
        )
      )
      throw err
    }
  }

  const handleUploadAll = async () => {
    const filesToUpload = selectedFiles.filter(f => f.status === 'pending' && !f.error)

    if (filesToUpload.length === 0) {
      return
    }

    setIsUploading(true)

    try {
      // Upload all files in parallel
      await Promise.allSettled(
        filesToUpload.map(file => uploadFile(file))
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleClearAll = () => {
    if (isUploading) return
    setSelectedFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClearCompleted = () => {
    setSelectedFiles(prev => prev.filter(f => f.status !== 'success'))
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const stats = {
    total: selectedFiles.length,
    pending: selectedFiles.filter(f => f.status === 'pending' && !f.error).length,
    uploading: selectedFiles.filter(f => f.status === 'uploading').length,
    success: selectedFiles.filter(f => f.status === 'success').length,
    error: selectedFiles.filter(f => f.status === 'error' || f.error).length,
  }

  return (
    <Card className={className}>
      <CardBody className="p-6">
        {/* Drop Zone */}
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
            {isDragging ? 'Drop files here' : 'Upload Multiple Files'}
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            Drag and drop your files here, or click to browse
          </p>

          <Button
            color="primary"
            variant="flat"
            onPress={handleBrowseClick}
            isDisabled={selectedFiles.length >= maxFiles}
          >
            Browse Files
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            className="hidden"
            multiple
            disabled={selectedFiles.length >= maxFiles}
          />

          <p className="text-xs text-gray-400 mt-4">
            Supported formats: Documents, Images, Video, Audio, Design files, Code, Archives
          </p>
          <p className="text-xs text-gray-400">
            Maximum file size: {MAX_FILE_SIZE / 1024 / 1024}MB • Up to {maxFiles} files at once
          </p>
        </div>

        {/* Stats Bar */}
        {selectedFiles.length > 0 && (
          <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="font-semibold text-gray-900">{stats.total}</span>
                <span className="text-gray-600 ml-1">files selected</span>
              </div>
              {stats.pending > 0 && (
                <div className="text-gray-600">
                  {stats.pending} pending
                </div>
              )}
              {stats.uploading > 0 && (
                <div className="text-blue-600">
                  {stats.uploading} uploading
                </div>
              )}
              {stats.success > 0 && (
                <div className="text-green-600">
                  {stats.success} completed
                </div>
              )}
              {stats.error > 0 && (
                <div className="text-danger">
                  {stats.error} failed
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {stats.success > 0 && !isUploading && (
                <Button
                  size="sm"
                  variant="light"
                  onPress={handleClearCompleted}
                >
                  Clear Completed
                </Button>
              )}
              {!isUploading && (
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={handleClearAll}
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Files List */}
        {selectedFiles.length > 0 && (
          <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
            {selectedFiles.map((fileWithStatus) => (
              <div
                key={fileWithStatus.id}
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
              >
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {fileWithStatus.status === 'success' && (
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                  )}
                  {(fileWithStatus.status === 'error' || fileWithStatus.error) && (
                    <ExclamationCircleIcon className="w-6 h-6 text-danger" />
                  )}
                  {fileWithStatus.status === 'pending' && !fileWithStatus.error && (
                    <DocumentIcon className="w-6 h-6 text-gray-400" />
                  )}
                  {fileWithStatus.status === 'uploading' && (
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileWithStatus.file.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileWithStatus.file.size)}
                    </p>
                    {fileWithStatus.error && (
                      <>
                        <span className="text-gray-400">•</span>
                        <p className="text-xs text-danger truncate">
                          {fileWithStatus.error}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {fileWithStatus.status === 'uploading' && (
                    <Progress
                      value={fileWithStatus.progress}
                      color="primary"
                      size="sm"
                      className="mt-2"
                    />
                  )}
                </div>

                {/* Remove Button */}
                {!isUploading && fileWithStatus.status !== 'uploading' && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => removeFile(fileWithStatus.id)}
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload All Button */}
        {stats.pending > 0 && (
          <div className="mt-6">
            <Button
              color="primary"
              className="w-full"
              onPress={handleUploadAll}
              isLoading={isUploading}
              startContent={!isUploading && <CloudArrowUpIcon className="w-5 h-5" />}
            >
              {isUploading ? 'Uploading Files...' : `Upload ${stats.pending} File${stats.pending !== 1 ? 's' : ''}`}
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
