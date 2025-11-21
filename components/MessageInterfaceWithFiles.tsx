'use client'

import React, { useState, useEffect, useRef } from 'react'
import Button from './ui/Button'
import { Message, Conversation, ProjectFile } from '@/types/database.types'
import { Paperclip, File, X, Upload } from 'lucide-react'

interface MessageWithFiles extends Message {
  attachments?: ProjectFile[]
}

interface MessageInterfaceProps {
  conversation: Conversation
  messages: MessageWithFiles[]
  currentUserId: string
  projectId?: string
  onSendMessage: (content: string, fileId?: string) => Promise<void>
}

export default function MessageInterfaceWithFiles({
  conversation,
  messages,
  currentUserId,
  projectId,
  onSendMessage
}: MessageInterfaceProps) {
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !projectId) return

    setSelectedFile(file)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)

      const response = await fetch('/api/messages/upload-file', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()
      setUploadedFileId(data.file.id)
    } catch (error: any) {
      console.error('File upload error:', error)
      alert(error.message || 'Failed to upload file')
      setSelectedFile(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setUploadedFileId(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!newMessage.trim() && !uploadedFileId) || sending) return

    setSending(true)
    try {
      await onSendMessage(newMessage || '📎 File attached', uploadedFileId || undefined)
      setNewMessage('')
      setSelectedFile(null)
      setUploadedFileId(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes}m ago`
    }
    if (hours < 24) {
      return `${hours}h ago`
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-soft border border-neutral-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900">
          Conversation
        </h3>
        {conversation.project_id && (
          <p className="text-sm text-neutral-500 mt-1">
            Project related • Files shared here appear in project workspace
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-neutral-500">No messages yet</p>
              <p className="text-sm text-neutral-400">Send a message or share a file to start the conversation</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOwn = message.sender_id === currentUserId

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-slide-up`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      isOwn
                        ? 'bg-primary-100 text-neutral-900'
                        : 'bg-neutral-100 text-neutral-900'
                    }`}
                  >
                    {message.content && (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    )}

                    {/* File Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.attachments.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center gap-2 p-2 bg-white/50 rounded-lg border border-neutral-200"
                          >
                            <File className="w-4 h-4 text-primary-600" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{file.file_name}</p>
                              {file.file_size && (
                                <p className="text-xs text-neutral-500">{formatFileSize(file.file_size)}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-neutral-700' : 'text-neutral-500'
                      }`}
                    >
                      {formatTime(message.created_at)}
                      {isOwn && message.is_read && ' • Read'}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="px-6 py-4 border-t border-neutral-200">
        {/* File Preview */}
        {selectedFile && (
          <div className="mb-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="flex items-center gap-2">
              <File className="w-4 h-4 text-primary-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-neutral-500">{formatFileSize(selectedFile.size)}</p>
              </div>
              {uploading ? (
                <Upload className="w-4 h-4 text-primary-600 animate-pulse" />
              ) : (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1 hover:bg-primary-100 rounded"
                >
                  <X className="w-4 h-4 text-neutral-600" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(e)
                }
              }}
              placeholder="Type your message... (Press Enter to send)"
              rows={3}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent resize-none"
              disabled={sending || uploading}
            />
            <p className="text-xs text-neutral-500 mt-2">
              Remember: Do not share contact information before payment is settled
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {/* File Upload Button */}
            {projectId && (
              <label className="cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading || sending}
                />
                <div className="p-3 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors">
                  <Paperclip className="w-5 h-5 text-neutral-600" />
                </div>
              </label>
            )}

            {/* Send Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={(!newMessage.trim() && !uploadedFileId) || sending || uploading}
              className="shrink-0"
            >
              {sending ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
