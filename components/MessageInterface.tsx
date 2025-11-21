'use client'

import React, { useState, useEffect, useRef } from 'react'
import Button from './ui/Button'
import { Message, Conversation } from '@/types/database.types'

interface MessageInterfaceProps {
  conversation: Conversation
  messages: Message[]
  currentUserId: string
  onSendMessage: (content: string) => Promise<void>
}

export default function MessageInterface({
  conversation,
  messages,
  currentUserId,
  onSendMessage
}: MessageInterfaceProps) {
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      await onSendMessage(newMessage)
      setNewMessage('')
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

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-soft border border-neutral-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900">
          Conversation
        </h3>
        {conversation.project_id && (
          <p className="text-sm text-neutral-500 mt-1">
            Project related
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
              <p className="text-sm text-neutral-400">Send a message to start the conversation</p>
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
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
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
              disabled={sending}
            />
            <p className="text-xs text-neutral-500 mt-2">
              Remember: Do not share contact information before payment is settled
            </p>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!newMessage.trim() || sending}
            className="shrink-0"
          >
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </form>
    </div>
  )
}
