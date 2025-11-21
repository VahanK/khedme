import { createClient } from '@/lib/supabase/server'
import { Conversation, Message } from '@/types/database.types'

export async function getOrCreateConversation(
  participant1Id: string,
  participant2Id: string,
  projectId?: string
) {
  const supabase = await createClient()

  // Try to find existing conversation
  const { data: existing, error: fetchError } = await supabase
    .from('conversations')
    .select('*')
    .or(`and(participant_1_id.eq.${participant1Id},participant_2_id.eq.${participant2Id}),and(participant_1_id.eq.${participant2Id},participant_2_id.eq.${participant1Id})`)
    .eq('project_id', projectId || '')
    .maybeSingle()

  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

  if (existing) {
    return existing as Conversation
  }

  // Create new conversation
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      participant_1_id: participant1Id,
      participant_2_id: participant2Id,
      project_id: projectId
    })
    .select()
    .single()

  if (error) throw error
  return data as Conversation
}

export async function getMyConversations(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      participant_1:profiles!participant_1_id(
        id,
        full_name,
        email
      ),
      participant_2:profiles!participant_2_id(
        id,
        full_name,
        email
      ),
      project:projects(
        id,
        title
      ),
      messages:messages(
        id,
        content,
        sender_id,
        is_read,
        created_at
      )
    `)
    .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
    .order('last_message_at', { ascending: false })

  if (error) throw error

  // Get only the latest message for each conversation
  return data.map(conv => ({
    ...conv,
    messages: conv.messages?.sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, 1) || []
  }))
}

export async function getConversationMessages(conversationId: string, limit = 50) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!sender_id(
        id,
        full_name,
        email
      ),
      attachments:message_attachments(
        file:project_files(
          id,
          file_name,
          file_path,
          file_size,
          file_type
        )
      )
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data || []).reverse() as Message[]
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content
    })
    .select()
    .single()

  if (error) throw error
  return data as Message
}

export async function markMessagesAsRead(conversationId: string, userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .eq('is_read', false)

  if (error) throw error
}

export async function getUnreadMessageCount(userId: string) {
  const supabase = await createClient()

  // Get all conversations for the user
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('id')
    .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)

  if (convError) throw convError

  const conversationIds = conversations.map(c => c.id)

  // Count unread messages in those conversations
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .in('conversation_id', conversationIds)
    .neq('sender_id', userId)
    .eq('is_read', false)

  if (error) throw error
  return count || 0
}
