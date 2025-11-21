import { createClient } from '@/lib/supabase/server'
import { DeliverableStatus } from '@/types/database.types'

export interface SubmitDeliverableParams {
  projectId: string
  fileId?: string
  title: string
  description?: string
  submittedBy: string
}

export interface ReviewDeliverableParams {
  deliverableId: string
  status: 'approved' | 'needs_revision' | 'rejected'
  reviewedBy: string
  notes?: string
}

export interface RequestRevisionParams {
  deliverableId: string
  requestedBy: string
  revisionNotes: string
}

/**
 * Freelancer submits a deliverable
 */
export async function submitDeliverable({
  projectId,
  fileId,
  title,
  description,
  submittedBy,
}: SubmitDeliverableParams) {
  const supabase = await createClient()

  // Check if project belongs to this freelancer
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('freelancer_id, status')
    .eq('id', projectId)
    .single()

  if (projectError || !project) {
    throw new Error('Project not found')
  }

  if (project.freelancer_id !== submittedBy) {
    throw new Error('Only the assigned freelancer can submit deliverables')
  }

  // Create deliverable
  const { data, error } = await supabase
    .from('deliverables')
    .insert({
      project_id: projectId,
      file_id: fileId,
      title,
      description,
      status: 'submitted' as DeliverableStatus,
      submitted_by: submittedBy,
      revision_number: 1,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to submit deliverable: ${error.message}`)
  }

  return data
}

/**
 * Get all deliverables for a project
 */
export async function getProjectDeliverables(projectId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deliverables')
    .select(
      `
      *,
      file:project_files(id, file_name, file_path, file_type, file_size),
      submitter:profiles!deliverables_submitted_by_fkey(id, full_name, email),
      reviewer:profiles!deliverables_reviewed_by_fkey(id, full_name, email),
      revisions:deliverable_revisions(
        id,
        revision_notes,
        status,
        created_at,
        completed_at,
        requester:profiles!deliverable_revisions_requested_by_fkey(id, full_name, email)
      )
    `
    )
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch deliverables: ${error.message}`)
  }

  return data
}

/**
 * Get single deliverable with details
 */
export async function getDeliverable(deliverableId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deliverables')
    .select(
      `
      *,
      file:project_files(id, file_name, file_path, file_type, file_size),
      submitter:profiles!deliverables_submitted_by_fkey(id, full_name, email),
      reviewer:profiles!deliverables_reviewed_by_fkey(id, full_name, email),
      revisions:deliverable_revisions(
        id,
        revision_notes,
        status,
        created_at,
        completed_at,
        requester:profiles!deliverable_revisions_requested_by_fkey(id, full_name, email)
      )
    `
    )
    .eq('id', deliverableId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch deliverable: ${error.message}`)
  }

  return data
}

/**
 * Client reviews a deliverable (approve, request revision, or reject)
 */
export async function reviewDeliverable({
  deliverableId,
  status,
  reviewedBy,
  notes,
}: ReviewDeliverableParams) {
  const supabase = await createClient()

  // Get deliverable and verify client access
  const { data: deliverable, error: fetchError } = await supabase
    .from('deliverables')
    .select('project_id')
    .eq('id', deliverableId)
    .single()

  if (fetchError || !deliverable) {
    throw new Error('Deliverable not found')
  }

  // Verify user is the client
  const { data: project } = await supabase
    .from('projects')
    .select('client_id')
    .eq('id', deliverable.project_id)
    .single()

  if (!project || project.client_id !== reviewedBy) {
    throw new Error('Only the client can review deliverables')
  }

  // Update deliverable status
  const { data, error } = await supabase
    .from('deliverables')
    .update({
      status,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', deliverableId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to review deliverable: ${error.message}`)
  }

  // If requesting revision, create a revision request
  if (status === 'needs_revision' && notes) {
    await requestRevision({
      deliverableId,
      requestedBy: reviewedBy,
      revisionNotes: notes,
    })
  }

  return data
}

/**
 * Client requests a revision
 */
export async function requestRevision({
  deliverableId,
  requestedBy,
  revisionNotes,
}: RequestRevisionParams) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deliverable_revisions')
    .insert({
      deliverable_id: deliverableId,
      requested_by: requestedBy,
      revision_notes: revisionNotes,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to request revision: ${error.message}`)
  }

  return data
}

/**
 * Freelancer submits a revised deliverable
 */
export async function submitRevision({
  deliverableId,
  fileId,
  submittedBy,
}: {
  deliverableId: string
  fileId?: string
  submittedBy: string
}) {
  const supabase = await createClient()

  // Get current deliverable
  const { data: deliverable, error: fetchError } = await supabase
    .from('deliverables')
    .select('revision_number, submitted_by')
    .eq('id', deliverableId)
    .single()

  if (fetchError || !deliverable) {
    throw new Error('Deliverable not found')
  }

  if (deliverable.submitted_by !== submittedBy) {
    throw new Error('Only the original submitter can submit revisions')
  }

  // Update deliverable with new file and increment revision number
  const { data, error } = await supabase
    .from('deliverables')
    .update({
      file_id: fileId,
      status: 'submitted' as DeliverableStatus,
      revision_number: deliverable.revision_number + 1,
      submitted_at: new Date().toISOString(),
      reviewed_by: null,
      reviewed_at: null,
    })
    .eq('id', deliverableId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to submit revision: ${error.message}`)
  }

  // Mark pending revisions as completed
  await supabase
    .from('deliverable_revisions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('deliverable_id', deliverableId)
    .eq('status', 'pending')

  return data
}

/**
 * Delete a deliverable (only if not approved)
 */
export async function deleteDeliverable(deliverableId: string, userId: string) {
  const supabase = await createClient()

  // Get deliverable
  const { data: deliverable, error: fetchError } = await supabase
    .from('deliverables')
    .select('submitted_by, status')
    .eq('id', deliverableId)
    .single()

  if (fetchError || !deliverable) {
    throw new Error('Deliverable not found')
  }

  // Only submitter can delete, and only if not approved
  if (deliverable.submitted_by !== userId) {
    throw new Error('Only the submitter can delete this deliverable')
  }

  if (deliverable.status === 'approved') {
    throw new Error('Cannot delete an approved deliverable')
  }

  const { error } = await supabase.from('deliverables').delete().eq('id', deliverableId)

  if (error) {
    throw new Error(`Failed to delete deliverable: ${error.message}`)
  }

  return { success: true }
}
