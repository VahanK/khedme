import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProjectDeliverables } from '@/utils/database/deliverables'

export async function GET(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = params

    // Verify user is part of this project
    const { data: project } = await supabase
      .from('projects')
      .select('client_id, freelancer_id')
      .eq('id', projectId)
      .single()

    if (!project || (project.client_id !== user.id && project.freelancer_id !== user.id)) {
      return NextResponse.json({ error: 'Unauthorized - not project participant' }, { status: 403 })
    }

    const deliverables = await getProjectDeliverables(projectId)

    return NextResponse.json({ success: true, deliverables })
  } catch (error: any) {
    console.error('Error fetching deliverables:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
