import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getFileDownloadUrl, deleteProjectFile } from '@/utils/database/files'

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; fileId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the file record
    const { data: file, error: fileError } = await supabase
      .from('project_files')
      .select('*')
      .eq('id', params.fileId)
      .eq('project_id', params.projectId)
      .single()

    if (fileError || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Verify user has access to this project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('client_id, freelancer_id')
      .eq('id', params.projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.client_id !== user.id && project.freelancer_id !== user.id) {
      return NextResponse.json(
        { error: 'You are not authorized to access this file' },
        { status: 403 }
      )
    }

    // Generate signed URL
    const downloadUrl = await getFileDownloadUrl(file.file_path)

    return NextResponse.json({ downloadUrl })
  } catch (error: any) {
    console.error('Error generating download URL:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate download URL' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; fileId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the file record
    const { data: file, error: fileError } = await supabase
      .from('project_files')
      .select('*')
      .eq('id', params.fileId)
      .eq('project_id', params.projectId)
      .single()

    if (fileError || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Verify user uploaded this file
    if (file.uploaded_by !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete files you uploaded' },
        { status: 403 }
      )
    }

    await deleteProjectFile(params.fileId, file.file_path)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete file' },
      { status: 500 }
    )
  }
}
