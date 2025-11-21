import { createClient } from '@/lib/supabase/server'
import { ProjectFile, FileComment, FileCommentWithUser, ProjectFileWithDetails } from '@/types/database.types'

export async function getProjectFiles(projectId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('project_files')
    .select(`
      *,
      uploader:profiles!uploaded_by(
        id,
        full_name,
        email
      )
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ProjectFile[]
}

export async function uploadProjectFile(
  projectId: string,
  userId: string,
  file: File
) {
  const supabase = await createClient()

  // Generate unique file path: projectId/timestamp-filename
  const timestamp = Date.now()
  const filePath = `${projectId}/${timestamp}-${file.name}`

  // Upload to storage
  const { data: storageData, error: storageError } = await supabase
    .storage
    .from('project-files')
    .upload(filePath, file)

  if (storageError) throw storageError

  // Create database entry
  const { data, error } = await supabase
    .from('project_files')
    .insert({
      project_id: projectId,
      uploaded_by: userId,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      file_type: file.type
    })
    .select()
    .single()

  if (error) throw error
  return data as ProjectFile
}

export async function getFileDownloadUrl(filePath: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .storage
    .from('project-files')
    .createSignedUrl(filePath, 60 * 60) // 1 hour expiry

  if (error) throw error
  return data.signedUrl
}

export async function deleteProjectFile(fileId: string, filePath: string) {
  const supabase = await createClient()

  // Delete from storage
  const { error: storageError } = await supabase
    .storage
    .from('project-files')
    .remove([filePath])

  if (storageError) throw storageError

  // Delete from database
  const { error } = await supabase
    .from('project_files')
    .delete()
    .eq('id', fileId)

  if (error) throw error
}

// ============================================
// FILE COMMENTS FUNCTIONS
// ============================================

export async function getFileComments(fileId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('file_comments')
    .select(`
      *,
      user:profiles!user_id(
        id,
        full_name,
        email
      )
    `)
    .eq('file_id', fileId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as FileCommentWithUser[]
}

export async function addFileComment(
  fileId: string,
  userId: string,
  comment: string
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('file_comments')
    .insert({
      file_id: fileId,
      user_id: userId,
      comment
    })
    .select(`
      *,
      user:profiles!user_id(
        id,
        full_name,
        email
      )
    `)
    .single()

  if (error) throw error
  return data as FileCommentWithUser
}

export async function updateFileComment(
  commentId: string,
  comment: string
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('file_comments')
    .update({ comment })
    .eq('id', commentId)
    .select(`
      *,
      user:profiles!user_id(
        id,
        full_name,
        email
      )
    `)
    .single()

  if (error) throw error
  return data as FileCommentWithUser
}

export async function deleteFileComment(commentId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('file_comments')
    .delete()
    .eq('id', commentId)

  if (error) throw error
}

export async function getProjectFilesWithComments(projectId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('project_files')
    .select(`
      *,
      uploader:profiles!uploaded_by(
        id,
        full_name,
        email
      ),
      comments:file_comments(
        *,
        user:profiles!user_id(
          id,
          full_name,
          email
        )
      )
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ProjectFileWithDetails[]
}
