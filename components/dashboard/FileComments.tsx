'use client'

import { useState } from 'react'
import { Card, CardHeader, CardBody, Avatar, Button, Textarea, Divider } from '@heroui/react'
import { FileCommentWithUser } from '@/types/database.types'
import { formatDistanceToNow } from 'date-fns'
import { PaperAirplaneIcon, TrashIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface FileCommentsProps {
  fileId: string
  fileName: string
  comments: FileCommentWithUser[]
  currentUserId?: string
  onAddComment: (comment: string) => Promise<void>
  onUpdateComment?: (commentId: string, comment: string) => Promise<void>
  onDeleteComment?: (commentId: string) => Promise<void>
}

export default function FileComments({
  fileId,
  fileName,
  comments,
  currentUserId,
  onAddComment,
  onUpdateComment,
  onDeleteComment
}: FileCommentsProps) {
  const [newComment, setNewComment] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      await onAddComment(newComment.trim())
      setNewComment('')
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (commentId: string) => {
    if (!onUpdateComment || !editText.trim()) return

    setIsSubmitting(true)
    try {
      await onUpdateComment(commentId, editText.trim())
      setEditingId(null)
      setEditText('')
    } catch (error) {
      console.error('Failed to update comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!onDeleteComment) return

    if (!confirm('Are you sure you want to delete this comment?')) return

    setIsSubmitting(true)
    try {
      await onDeleteComment(commentId)
    } catch (error) {
      console.error('Failed to delete comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const startEdit = (comment: FileCommentWithUser) => {
    setEditingId(comment.id)
    setEditText(comment.comment)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col items-start gap-1 pb-3">
        <h3 className="text-lg font-semibold">Comments</h3>
        <p className="text-sm text-gray-500">{fileName}</p>
      </CardHeader>

      <Divider />

      <CardBody className="gap-4">
        {/* Comments List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar
                  src={comment.user?.full_name || undefined}
                  name={comment.user?.full_name || comment.user?.email}
                  size="sm"
                  className="flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {comment.user?.full_name || comment.user?.email || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        {comment.updated_at !== comment.created_at && ' (edited)'}
                      </p>
                    </div>

                    {/* Edit/Delete buttons for own comments */}
                    {currentUserId === comment.user_id && editingId !== comment.id && (
                      <div className="flex gap-1">
                        {onUpdateComment && (
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => startEdit(comment)}
                            disabled={isSubmitting}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                        )}
                        {onDeleteComment && (
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => handleDelete(comment.id)}
                            disabled={isSubmitting}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Comment Text or Edit Form */}
                  {editingId === comment.id ? (
                    <div className="mt-2 space-y-2">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        minRows={2}
                        size="sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="primary"
                          onPress={() => handleUpdate(comment.id)}
                          isLoading={isSubmitting}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={cancelEdit}
                          disabled={isSubmitting}
                          startContent={<XMarkIcon className="w-4 h-4" />}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                      {comment.comment}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <Divider />

        {/* Add Comment Form */}
        <div className="flex gap-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            minRows={2}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleSubmit()
              }
            }}
          />
          <Button
            isIconOnly
            color="primary"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={!newComment.trim()}
            className="flex-shrink-0 self-end"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-gray-400">Press Ctrl+Enter to submit</p>
      </CardBody>
    </Card>
  )
}

function ChatBubbleLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  )
}
