'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectFileWithDetails, FileCommentWithUser } from '@/types/database.types'
import FileCard from './FileCard'
import FileComments from './FileComments'
import BatchFileUploader from './BatchFileUploader'
import { Button, Modal, ModalContent, ModalHeader, ModalBody, Tabs, Tab } from '@heroui/react'
import { ArrowLeftIcon, FolderOpenIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'
import { getFileDownloadUrl } from '@/utils/database/files'

interface WorkspaceFilesClientProps {
  projectId: string
  projectTitle: string
  initialFiles: ProjectFileWithDetails[]
  currentUserId: string
}

export default function WorkspaceFilesClient({
  projectId,
  projectTitle,
  initialFiles,
  currentUserId
}: WorkspaceFilesClientProps) {
  const router = useRouter()
  const [files, setFiles] = useState<ProjectFileWithDetails[]>(initialFiles)
  const [selectedFile, setSelectedFile] = useState<ProjectFileWithDetails | null>(null)
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload file')
      }

      // Refresh the page to show new file
      router.refresh()
    } catch (error: any) {
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownload = async (file: ProjectFileWithDetails) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/files/${file.id}`)
      const data = await response.json()

      if (data.downloadUrl) {
        // Open download in new tab
        window.open(data.downloadUrl, '_blank')
      }
    } catch (error) {
      console.error('Failed to download file:', error)
      alert('Failed to download file')
    }
  }

  const handleViewComments = (file: ProjectFileWithDetails) => {
    setSelectedFile(file)
    setIsCommentsModalOpen(true)
  }

  const handleAddComment = async (comment: string) => {
    if (!selectedFile) return

    try {
      const response = await fetch(`/api/files/${selectedFile.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add comment')
      }

      // Refresh to show new comment
      router.refresh()
    } catch (error: any) {
      console.error('Failed to add comment:', error)
      throw error
    }
  }

  const handleUpdateComment = async (commentId: string, comment: string) => {
    try {
      const response = await fetch(`/api/files/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update comment')
      }

      // Refresh to show updated comment
      router.refresh()
    } catch (error: any) {
      console.error('Failed to update comment:', error)
      throw error
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/files/comments/${commentId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete comment')
      }

      // Refresh to remove deleted comment
      router.refresh()
    } catch (error: any) {
      console.error('Failed to delete comment:', error)
      throw error
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="light"
            startContent={<ArrowLeftIcon className="w-4 h-4" />}
            onPress={() => router.back()}
            className="mb-4"
          >
            Back to Project
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FolderOpenIcon className="w-8 h-8 text-primary" />
                Workspace Files
              </h1>
              <p className="text-gray-600 mt-1">{projectTitle}</p>
            </div>
          </div>
        </div>

        <Tabs aria-label="File management tabs" className="mb-6">
          <Tab key="files" title="All Files">
            <div className="py-4">
              {/* Batch File Uploader */}
              <div className="mb-6">
                <BatchFileUploader
                  projectId={projectId}
                  onUpload={handleUpload}
                />
              </div>

              {/* Files Grid */}
              {files.length === 0 ? (
                <div className="text-center py-12">
                  <CloudArrowUpIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No files yet
                  </h3>
                  <p className="text-gray-600">
                    Upload your first file to get started
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {files.map((file) => (
                    <FileCard
                      key={file.id}
                      file={file}
                      onDownload={handleDownload}
                      onViewComments={handleViewComments}
                    />
                  ))}
                </div>
              )}
            </div>
          </Tab>
        </Tabs>

        {/* Comments Modal */}
        <Modal
          isOpen={isCommentsModalOpen}
          onClose={() => setIsCommentsModalOpen(false)}
          size="2xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalBody className="p-0">
              {selectedFile && (
                <FileComments
                  fileId={selectedFile.id}
                  fileName={selectedFile.file_name}
                  comments={(selectedFile.comments as FileCommentWithUser[]) || []}
                  currentUserId={currentUserId}
                  onAddComment={handleAddComment}
                  onUpdateComment={handleUpdateComment}
                  onDeleteComment={handleDeleteComment}
                />
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </div>
    </div>
  )
}
