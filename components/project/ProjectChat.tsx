'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Spinner, Chip } from '@heroui/react'
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  DocumentIcon,
  XMarkIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

interface Message {
  id: string
  project_id: string
  sender_id: string
  message: string
  created_at: string
  attached_file_id: string | null
  sender?: {
    full_name: string
  }
  attached_file?: {
    id: string
    file_name: string
    file_size: number
    file_type: string
    file_url: string
  }
}

interface ProjectChatProps {
  projectId: string
  currentUserId: string
  currentUserName: string
  userRole: 'client' | 'freelancer'
}

export default function ProjectChat({
  projectId,
  currentUserId,
  currentUserName,
  userRole
}: ProjectChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('project_messages')
        .select(`
          *,
          sender:profiles!sender_id (
            full_name
          ),
          attached_file:project_files!attached_file_id (
            id,
            file_name,
            file_size,
            file_type,
            file_url
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error)
      } else {
        setMessages(data || [])
      }
      setLoading(false)
    }

    fetchMessages()
  }, [projectId])

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel(`project-messages-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_messages',
          filter: `project_id=eq.${projectId}`
        },
        async (payload) => {
          // Fetch the sender info and attached file for the new message
          const { data: senderData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', payload.new.sender_id)
            .single()

          let attachedFile = null
          if (payload.new.attached_file_id) {
            const { data: fileData } = await supabase
              .from('project_files')
              .select('id, file_name, file_size, file_type, file_url')
              .eq('id', payload.new.attached_file_id)
              .single()
            attachedFile = fileData
          }

          const newMsg = {
            ...payload.new,
            sender: senderData,
            attached_file: attachedFile
          } as Message

          setMessages((current) => [...current, newMsg])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId])

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      setSelectedFile(file)
    }
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      setSelectedFile(file)
    }
  }

  // Upload file to Supabase storage and create project_files record
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setUploading(true)

      // Generate unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${projectId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      console.log('Uploading file:', file.name, 'to:', fileName)

      // Upload to Supabase Storage
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
      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(fileName)

      console.log('Public URL:', publicUrl)

      // Create project_files record
      const { data: fileRecord, error: fileError } = await supabase
        .from('project_files')
        .insert({
          project_id: projectId,
          uploaded_by: currentUserId,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type || 'application/octet-stream',
          file_url: publicUrl,
          uploaded_via: 'chat'
        })
        .select('id')
        .single()

      if (fileError) {
        console.error('Database insert error:', fileError)
        alert(`Database error: ${fileError.message}`)
        throw fileError
      }

      console.log('File record created:', fileRecord)
      alert('File uploaded successfully!')
      return fileRecord.id
    } catch (error: any) {
      console.error('Error uploading file:', error)
      alert(`Failed to upload file: ${error?.message || 'Unknown error'}`)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if ((!newMessage.trim() && !selectedFile) || sending || uploading) return

    setSending(true)

    try {
      let attachedFileId: string | null = null

      // Upload file if selected
      if (selectedFile) {
        attachedFileId = await uploadFile(selectedFile)
        if (!attachedFileId && !newMessage.trim()) {
          // File upload failed and no message text
          setSending(false)
          return
        }
      }

      // Insert message
      const { error } = await supabase
        .from('project_messages')
        .insert({
          project_id: projectId,
          sender_id: currentUserId,
          message: newMessage.trim() || (selectedFile ? `Sent ${selectedFile.name}` : ''),
          attached_file_id: attachedFileId
        })

      if (error) throw error

      // Update the chat_message_id in project_files if file was uploaded
      if (attachedFileId) {
        // We'll get the message ID from the realtime subscription, so we don't update it here
        // The chat_message_id will be set when we fetch messages or via a database trigger if needed
      }

      setNewMessage('')
      setSelectedFile(null)
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" color="primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Drag and Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-blue-500/20 backdrop-blur-sm border-4 border-dashed border-blue-500 rounded-lg flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl">
            <DocumentIcon className="w-16 h-16 text-blue-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-gray-900">Drop file here to upload</p>
            <p className="text-sm text-gray-600 mt-1">Max file size: 10MB</p>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm mt-2">Start the conversation with your {userRole === 'client' ? 'freelancer' : 'client'}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.sender_id === currentUserId
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white rounded-l-2xl rounded-tr-2xl'
                      : 'bg-white text-gray-900 rounded-r-2xl rounded-tl-2xl border border-gray-200'
                  } px-4 py-3 shadow-sm`}
                >
                  {!isOwnMessage && (
                    <p className="text-xs font-semibold mb-1 text-gray-600">
                      {msg.sender?.full_name || 'Unknown'}
                    </p>
                  )}

                  {/* Attached File Display */}
                  {msg.attached_file && (
                    <div
                      className={`mb-2 p-3 rounded-lg ${
                        isOwnMessage ? 'bg-blue-700/50' : 'bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <DocumentIcon className={`w-8 h-8 flex-shrink-0 ${isOwnMessage ? 'text-blue-200' : 'text-gray-600'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${isOwnMessage ? 'text-white' : 'text-gray-900'}`}>
                            {msg.attached_file.file_name}
                          </p>
                          <p className={`text-xs ${isOwnMessage ? 'text-blue-200' : 'text-gray-600'}`}>
                            {formatFileSize(msg.attached_file.file_size)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="flat"
                          isIconOnly
                          onPress={() => handleDownloadFile(msg.attached_file!.file_url, msg.attached_file!.file_name)}
                          className={isOwnMessage ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-700'}
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                  <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      {selectedFile && (
        <div className="mt-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <DocumentIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-600">{formatFileSize(selectedFile.size)}</p>
            </div>
            <Button
              size="sm"
              variant="flat"
              isIconOnly
              onPress={() => setSelectedFile(null)}
              className="bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="*/*"
        />
        <Button
          type="button"
          variant="flat"
          size="lg"
          isIconOnly
          onPress={() => fileInputRef.current?.click()}
          isDisabled={sending || uploading}
          className="bg-gray-100 hover:bg-gray-200 transition-all hover:scale-105 active:scale-95"
        >
          <PaperClipIcon className="w-5 h-5 text-gray-700" />
        </Button>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={selectedFile ? "Add a message (optional)..." : "Type your message..."}
          size="lg"
          variant="bordered"
          classNames={{
            input: "text-base",
            inputWrapper: "transition-all hover:border-blue-400 focus-within:border-blue-500"
          }}
          disabled={sending || uploading}
        />
        <Button
          type="submit"
          color="primary"
          size="lg"
          isIconOnly
          isLoading={sending || uploading}
          isDisabled={(!newMessage.trim() && !selectedFile) || sending || uploading}
          className="transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
        >
          {!sending && !uploading && <PaperAirplaneIcon className="w-5 h-5" />}
        </Button>
      </form>
    </div>
  )
}
