import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getFileComments, addFileComment } from '@/utils/database/files'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileId } = await params
    const comments = await getFileComments(fileId)

    return NextResponse.json({ comments })
  } catch (error: any) {
    console.error('Error fetching file comments:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileId } = await params

    const body = await request.json()
    const { comment } = body

    if (!comment || comment.trim() === '') {
      return NextResponse.json(
        { error: 'Comment cannot be empty' },
        { status: 400 }
      )
    }

    // Verify user has access to the file (must be part of the project)
    const { data: file, error: fileError } = await supabase
      .from('project_files')
      .select('project_id')
      .eq('id', fileId)
      .single()

    if (fileError || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('client_id, freelancer_id')
      .eq('id', file.project_id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.client_id !== user.id && project.freelancer_id !== user.id) {
      return NextResponse.json(
        { error: 'You are not authorized to comment on this file' },
        { status: 403 }
      )
    }

    const newComment = await addFileComment(fileId, user.id, comment.trim())

    return NextResponse.json({ comment: newComment }, { status: 201 })
  } catch (error: any) {
    console.error('Error adding file comment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to add comment' },
      { status: 500 }
    )
  }
}
