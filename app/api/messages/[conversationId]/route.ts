import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getConversationMessages, sendMessage, markMessagesAsRead } from '@/utils/database/messaging'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId } = await params

    // Verify user is part of this conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('participant_1_id, participant_2_id')
      .eq('id', conversationId)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    if (
      conversation.participant_1_id !== user.id &&
      conversation.participant_2_id !== user.id
    ) {
      return NextResponse.json(
        { error: 'You are not part of this conversation' },
        { status: 403 }
      )
    }

    const messages = await getConversationMessages(conversationId)

    // Mark messages as read
    await markMessagesAsRead(conversationId, user.id)

    return NextResponse.json({ messages })
  } catch (error: any) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId } = await params

    // Verify user is part of this conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('participant_1_id, participant_2_id')
      .eq('id', conversationId)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    if (
      conversation.participant_1_id !== user.id &&
      conversation.participant_2_id !== user.id
    ) {
      return NextResponse.json(
        { error: 'You are not part of this conversation' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { content, fileId } = body

    if ((!content || content.trim().length === 0) && !fileId) {
      return NextResponse.json(
        { error: 'Message content or file attachment is required' },
        { status: 400 }
      )
    }

    const message = await sendMessage(conversationId, user.id, content || '')

    // If fileId is provided, link it to the message
    if (fileId) {
      const { error: attachmentError } = await supabase
        .from('message_attachments')
        .insert({
          message_id: message.id,
          file_id: fileId,
        })

      if (attachmentError) {
        console.error('Error linking file to message:', attachmentError)
        // Continue anyway - message is sent, just attachment link failed
      }
    }

    return NextResponse.json({ message }, { status: 201 })
  } catch (error: any) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    )
  }
}
