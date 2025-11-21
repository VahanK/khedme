import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { submitRevision } from '@/utils/database/deliverables'

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
    const { deliverableId, fileId } = body

    if (!deliverableId) {
      return NextResponse.json({ error: 'Missing required field: deliverableId' }, { status: 400 })
    }

    const deliverable = await submitRevision({
      deliverableId,
      fileId,
      submittedBy: user.id,
    })

    return NextResponse.json({ success: true, deliverable })
  } catch (error: any) {
    console.error('Error submitting revision:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
