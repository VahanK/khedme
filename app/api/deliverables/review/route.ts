import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { reviewDeliverable } from '@/utils/database/deliverables'

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
    const { deliverableId, status, notes } = body

    if (!deliverableId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: deliverableId, status' },
        { status: 400 }
      )
    }

    if (!['approved', 'needs_revision', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: approved, needs_revision, or rejected' },
        { status: 400 }
      )
    }

    const deliverable = await reviewDeliverable({
      deliverableId,
      status,
      reviewedBy: user.id,
      notes,
    })

    return NextResponse.json({ success: true, deliverable })
  } catch (error: any) {
    console.error('Error reviewing deliverable:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
