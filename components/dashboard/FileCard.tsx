'use client'

import { Card, CardBody, Avatar, Button, Chip } from '@heroui/react'
import { ProjectFileWithDetails } from '@/types/database.types'
import { getFileIcon, formatFileSize, getFileCategory } from '@/lib/constants/file-types'
import { ArrowDownTrayIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'

interface FileCardProps {
  file: ProjectFileWithDetails
  onDownload: (file: ProjectFileWithDetails) => void
  onViewComments?: (file: ProjectFileWithDetails) => void
  showComments?: boolean
}

export default function FileCard({
  file,
  onDownload,
  onViewComments,
  showComments = true
}: FileCardProps) {
  const fileIcon = file.file_type ? getFileIcon(file.file_type) : '📎'
  const fileCategory = file.file_type ? getFileCategory(file.file_type) : 'other'
  const commentCount = file.comments?.length || 0

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'document':
        return 'primary'
      case 'image':
        return 'secondary'
      case 'design':
        return 'warning'
      case 'code':
        return 'success'
      case 'archive':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardBody className="p-4">
        <div className="flex items-start gap-4">
          {/* File Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
              {fileIcon}
            </div>
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {file.file_name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Chip
                    size="sm"
                    variant="flat"
                    color={getCategoryColor(fileCategory)}
                    className="capitalize"
                  >
                    {fileCategory}
                  </Chip>
                  {file.file_size && (
                    <span className="text-xs text-gray-500">
                      {formatFileSize(file.file_size)}
                    </span>
                  )}
                </div>
              </div>

              {/* Download Button */}
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                color="primary"
                onPress={() => onDownload(file)}
                aria-label="Download file"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* Uploader Info */}
            {file.uploader && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <Avatar
                  src={file.uploader.full_name || undefined}
                  name={file.uploader.full_name || file.uploader.email}
                  size="sm"
                  className="w-6 h-6"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600">
                    Uploaded by{' '}
                    <span className="font-medium text-gray-900">
                      {file.uploader.full_name || file.uploader.email}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                  </p>
                </div>

                {/* Comments Badge */}
                {showComments && onViewComments && (
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() => onViewComments(file)}
                    startContent={<ChatBubbleLeftIcon className="w-4 h-4" />}
                    className="text-xs"
                  >
                    {commentCount > 0 ? commentCount : 'Comment'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
