import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { releaseEscrow } from '@/utils/database/escrow'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication and admin role
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { projectId, transactionId, paymentMethod, notes } = body

    if (!projectId) {
      return NextResponse.json({ error: 'Missing required field: projectId' }, { status: 400 })
    }

    const updatedProject = await releaseEscrow({
      projectId,
      releasedBy: user.id,
      transactionId,
      paymentMethod,
      notes,
    })

    return NextResponse.json({ success: true, project: updatedProject })
  } catch (error: any) {
    console.error('Error releasing escrow:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
