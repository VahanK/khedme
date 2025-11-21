import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMyConversations, getOrCreateConversation } from '@/utils/database/messaging'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversations = await getMyConversations(user.id)

    return NextResponse.json({ conversations })
  } catch (error: any) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { otherUserId, projectId } = body

    if (!otherUserId) {
      return NextResponse.json(
        { error: 'otherUserId is required' },
        { status: 400 }
      )
    }

    const conversation = await getOrCreateConversation(
      user.id,
      otherUserId,
      projectId
    )

    return NextResponse.json({ conversation })
  } catch (error: any) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create conversation' },
      { status: 500 }
    )
  }
}
