import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProjectFiles, uploadProjectFile } from '@/utils/database/files'
import { MAX_FILE_SIZE, isFileTypeAllowed } from '@/lib/constants/file-types'

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const files = await getProjectFiles(params.projectId)

    return NextResponse.json({ files })
  } catch (error: any) {
    console.error('Error fetching files:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch files' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is part of this project
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
        { error: 'You are not authorized to upload files to this project' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Check file type
    if (!isFileTypeAllowed(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} is not allowed. Please upload a supported file format.` },
        { status: 400 }
      )
    }

    // Check file size (limit to 25MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      )
    }

    const uploadedFile = await uploadProjectFile(params.projectId, user.id, file)

    return NextResponse.json({ file: uploadedFile }, { status: 201 })
  } catch (error: any) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    )
  }
}
