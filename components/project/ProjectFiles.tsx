'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button, Spinner, Card, CardBody, Chip } from '@heroui/react'
import {
  CloudArrowUpIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  DocumentIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

interface ProjectFile {
  id: string
  project_id: string
  uploaded_by: string
  file_name: string
  file_url: string
  file_size: number
  file_type: string
  created_at: string
  uploaded_via: 'direct' | 'chat'
  chat_message_id: string | null
  uploader?: {
    full_name: string
  }
}

interface ProjectFilesProps {
  projectId: string
  currentUserId: string
  userRole: 'client' | 'freelancer'
}

export default function ProjectFiles({
  projectId,
  currentUserId,
  userRole
}: ProjectFilesProps) {
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  // Fetch files
  useEffect(() => {
    const fetchFiles = async () => {
      const { data, error } = await supabase
        .from('project_files')
        .select(`
          *,
          uploader:profiles!uploaded_by (
            full_name
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching files:', error)
      } else {
        setFiles(data || [])
      }
      setLoading(false)
    }

    fetchFiles()

    // Subscribe to real-time updates for new files uploaded via chat
    const channel = supabase
      .channel(`project-files-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_files',
          filter: `project_id=eq.${projectId}`
        },
        async (payload) => {
          // Fetch the uploader info for the new file
          const { data: uploaderData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', payload.new.uploaded_by)
            .single()

          const newFile = {
            ...payload.new,
            uploader: uploaderData
          } as ProjectFile

          setFiles((current) => [newFile, ...current])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    setUploading(true)

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${projectId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      console.log('Uploading file:', file.name, 'to:', fileName)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        alert(`Storage upload failed: ${uploadError.message}`)
        throw uploadError
      }

      console.log('File uploaded successfully:', uploadData)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('project-files')
        .getPublicUrl(fileName)

      console.log('Public URL:', urlData.publicUrl)

      // Save file metadata to database
      const { data: fileData, error: dbError } = await supabase
        .from('project_files')
        .insert({
          project_id: projectId,
          uploaded_by: currentUserId,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_size: file.size,
          file_type: file.type || 'application/octet-stream',
          uploaded_via: 'direct'
        })
        .select(`
          *,
          uploader:profiles!uploaded_by (
            full_name
          )
        `)
        .single()

      if (dbError) {
        console.error('Database insert error:', dbError)
        alert(`Database error: ${dbError.message}`)
        throw dbError
      }

      console.log('File record created:', fileData)

      // Add to files list
      setFiles([fileData, ...files])

      // Reset file input
      e.target.value = ''

      alert('File uploaded successfully!')
    } catch (error: any) {
      console.error('Error uploading file:', error)
      alert(`Failed to upload file: ${error?.message || 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async (fileId: string, fileUrl: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/project-files/')
      const filePath = urlParts[urlParts.length - 1]

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('project-files')
        .remove([filePath])

      if (storageError) {
        console.error('Storage delete error:', storageError)
        // Continue anyway - file might already be deleted
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('project_files')
        .delete()
        .eq('id', fileId)

      if (dbError) throw dbError

      // Remove from list
      setFiles(files.filter(f => f.id !== fileId))
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Failed to delete file. Please try again.')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" color="primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
        <CardBody className="p-6">
          <div className="text-center">
            <CloudArrowUpIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-gray-600 mb-4">
              Upload project files, deliverables, or documentation
            </p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <Button
              as="label"
              htmlFor="file-upload"
              color="primary"
              variant="flat"
              size="lg"
              isLoading={uploading}
              isDisabled={uploading}
              className="cursor-pointer"
            >
              {uploading ? 'Uploading...' : 'Choose File'}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Maximum file size: 10MB
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Files List */}
      {files.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <DocumentIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No files uploaded yet</p>
          <p className="text-sm mt-2">Upload your first file to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file) => {
            const isOwner = file.uploaded_by === currentUserId
            const isChatUpload = file.uploaded_via === 'chat'
            return (
              <Card
                key={file.id}
                className={`shadow-sm hover:shadow-md transition-shadow ${
                  isChatUpload ? 'border-2 border-blue-200 bg-blue-50/30' : ''
                }`}
              >
                <CardBody className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isChatUpload ? 'bg-blue-200' : 'bg-blue-100'
                      }`}>
                        {isChatUpload ? (
                          <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-700" />
                        ) : (
                          <DocumentIcon className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 truncate">{file.file_name}</p>
                          {isChatUpload && (
                            <Chip
                              size="sm"
                              variant="flat"
                              className="bg-blue-100 text-blue-700 border border-blue-300"
                              startContent={<ChatBubbleLeftRightIcon className="w-3 h-3" />}
                            >
                              Sent via Chat
                            </Chip>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">
                          Uploaded by {file.uploader?.full_name || 'Unknown'} • {formatFileSize(file.file_size)} • {formatDate(file.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        as="a"
                        href={file.file_url}
                        download={file.file_name}
                        target="_blank"
                        size="sm"
                        variant="flat"
                        color="primary"
                        isIconOnly
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </Button>
                      {isOwner && (
                        <Button
                          size="sm"
                          variant="flat"
                          color="danger"
                          isIconOnly
                          onPress={() => handleDeleteFile(file.id, file.file_url)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
