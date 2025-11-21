import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { submitPaymentProof } from '@/utils/database/escrow'

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
    const { projectId, paymentProofUrl, amount, paymentMethod } = body

    if (!projectId || !paymentProofUrl || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, paymentProofUrl, amount' },
        { status: 400 }
      )
    }

    // Verify user is the client of this project
    const { data: project } = await supabase
      .from('projects')
      .select('client_id')
      .eq('id', projectId)
      .single()

    if (!project || project.client_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized - not project client' }, { status: 403 })
    }

    const updatedProject = await submitPaymentProof({
      projectId,
      paymentProofUrl,
      amount,
      paymentMethod,
    })

    return NextResponse.json({ success: true, project: updatedProject })
  } catch (error: any) {
    console.error('Error submitting payment proof:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
