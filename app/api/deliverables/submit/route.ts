import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { submitDeliverable } from '@/utils/database/deliverables'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, fileId, title, description } = body

    if (!projectId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, title' },
        { status: 400 }
      )
    }

    const deliverable = await submitDeliverable({
      projectId,
      fileId,
      title,
      description,
      submittedBy: user.id,
    })

    return NextResponse.json({ success: true, deliverable })
  } catch (error: any) {
    console.error('Error submitting deliverable:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
