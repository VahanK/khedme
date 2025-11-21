import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requestEscrowRelease } from '@/utils/database/escrow'

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
    const { projectId } = body

    if (!projectId) {
      return NextResponse.json({ error: 'Missing required field: projectId' }, { status: 400 })
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

    const updatedProject = await requestEscrowRelease(projectId)

    return NextResponse.json({ success: true, project: updatedProject })
  } catch (error: any) {
    console.error('Error requesting escrow release:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
