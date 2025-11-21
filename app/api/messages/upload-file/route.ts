import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateFile } from '@/lib/constants/file-types'

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

    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const messageId = formData.get('messageId') as string | null

    if (!file || !projectId) {
      return NextResponse.json({ error: 'Missing file or projectId' }, { status: 400 })
    }

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Verify user is part of the project
    const { data: project } = await supabase
      .from('projects')
      .select('client_id, freelancer_id')
      .eq('id', projectId)
      .single()

    if (!project || (project.client_id !== user.id && project.freelancer_id !== user.id)) {
      return NextResponse.json({ error: 'Unauthorized - not project participant' }, { status: 403 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const fileExt = file.name.split('.').pop()
    const fileName = `${projectId}/${timestamp}-${randomStr}.${fileExt}`

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
    }

    // Insert into project_files table
    const { data: fileRecord, error: fileError } = await supabase
      .from('project_files')
      .insert({
        project_id: projectId,
        uploaded_by: user.id,
        file_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        file_type: file.type,
      })
      .select()
      .single()

    if (fileError) {
      console.error('File record error:', fileError)
      // Try to delete uploaded file if database insert fails
      await supabase.storage.from('project-files').remove([uploadData.path])
      return NextResponse.json({ error: `Failed to save file record: ${fileError.message}` }, { status: 500 })
    }

    // If messageId is provided, link the file to the message
    if (messageId) {
      const { error: attachmentError } = await supabase
        .from('message_attachments')
        .insert({
          message_id: messageId,
          file_id: fileRecord.id,
        })

      if (attachmentError) {
        console.error('Attachment link error:', attachmentError)
        // File is already uploaded and in project_files, so we continue
      }
    }

    return NextResponse.json({
      success: true,
      file: fileRecord,
    })
  } catch (error: any) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
