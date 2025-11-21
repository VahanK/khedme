import { createClient } from '@/lib/supabase/server'
import { EscrowStatus, EscrowTransactionType } from '@/types/database.types'

export interface SubmitPaymentProofParams {
  projectId: string
  paymentProofUrl: string
  amount: number
  paymentMethod?: string
}

export interface VerifyEscrowParams {
  projectId: string
  verifiedBy: string
  notes?: string
}

export interface ReleaseEscrowParams {
  projectId: string
  releasedBy: string
  transactionId?: string
  paymentMethod?: string
  notes?: string
}

/**
 * Client submits payment proof
 */
export async function submitPaymentProof({
  projectId,
  paymentProofUrl,
  amount,
  paymentMethod,
}: SubmitPaymentProofParams) {
  const supabase = await createClient()

  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (fetchError || !project) {
    throw new Error('Project not found')
  }

  // Update project with payment proof
  const { data, error } = await supabase
    .from('projects')
    .update({
      payment_proof_url: paymentProofUrl,
      escrow_status: 'payment_submitted' as EscrowStatus,
      payment_submitted_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to submit payment proof: ${error.message}`)
  }

  return data
}

/**
 * Admin verifies payment and holds in escrow
 */
export async function verifyEscrow({ projectId, verifiedBy, notes }: VerifyEscrowParams) {
  const supabase = await createClient()

  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (fetchError || !project) {
    throw new Error('Project not found')
  }

  if (project.escrow_status !== 'payment_submitted') {
    throw new Error('Payment has not been submitted yet')
  }

  // Update project - triggers will handle contact sharing and transaction logging
  const { data, error } = await supabase
    .from('projects')
    .update({
      escrow_status: 'verified_held' as EscrowStatus,
      escrow_verified_at: new Date().toISOString(),
      escrow_verified_by: verifiedBy,
    })
    .eq('id', projectId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to verify escrow: ${error.message}`)
  }

  return data
}

/**
 * Client requests payment release (work approved)
 */
export async function requestEscrowRelease(projectId: string) {
  const supabase = await createClient()

  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (fetchError || !project) {
    throw new Error('Project not found')
  }

  if (project.escrow_status !== 'verified_held') {
    throw new Error('Escrow must be verified before release')
  }

  const { data, error } = await supabase
    .from('projects')
    .update({
      escrow_status: 'pending_release' as EscrowStatus,
      escrow_release_requested_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to request escrow release: ${error.message}`)
  }

  return data
}

/**
 * Admin releases payment to freelancer
 */
export async function releaseEscrow({
  projectId,
  releasedBy,
  transactionId,
  paymentMethod,
  notes,
}: ReleaseEscrowParams) {
  const supabase = await createClient()

  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (fetchError || !project) {
    throw new Error('Project not found')
  }

  if (project.escrow_status !== 'pending_release') {
    throw new Error('Escrow release has not been requested')
  }

  // Update project status - trigger will log transaction
  const { data, error } = await supabase
    .from('projects')
    .update({
      escrow_status: 'released' as EscrowStatus,
      escrow_released_at: new Date().toISOString(),
      escrow_released_by: releasedBy,
      payment_status: 'paid',
      status: 'completed',
    })
    .eq('id', projectId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to release escrow: ${error.message}`)
  }

  // Optionally update the transaction with external payment details
  if (transactionId || paymentMethod || notes) {
    await supabase
      .from('escrow_transactions')
      .update({
        transaction_id: transactionId,
        payment_method: paymentMethod,
        notes: notes || 'Payment released to freelancer',
      })
      .eq('project_id', projectId)
      .eq('transaction_type', 'payment_released')
  }

  return data
}

/**
 * Get escrow transactions for a project
 */
export async function getEscrowTransactions(projectId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('escrow_transactions')
    .select(
      `
      *,
      performed_by:profiles!escrow_transactions_performed_by_fkey(id, full_name, email)
    `
    )
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch escrow transactions: ${error.message}`)
  }

  return data
}

/**
 * Get all projects pending escrow verification (admin)
 */
export async function getPendingEscrowVerifications() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .select(
      `
      *,
      client:profiles!projects_client_id_fkey(id, full_name, email),
      freelancer:profiles!projects_freelancer_id_fkey(id, full_name, email)
    `
    )
    .eq('escrow_status', 'payment_submitted')
    .order('payment_submitted_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch pending verifications: ${error.message}`)
  }

  return data
}

/**
 * Get all projects pending escrow release (admin)
 */
export async function getPendingEscrowReleases() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .select(
      `
      *,
      client:profiles!projects_client_id_fkey(id, full_name, email),
      freelancer:profiles!projects_freelancer_id_fkey(id, full_name, email)
    `
    )
    .eq('escrow_status', 'pending_release')
    .order('escrow_release_requested_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch pending releases: ${error.message}`)
  }

  return data
}

/**
 * Get all active escrows (admin)
 */
export async function getActiveEscrows() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .select(
      `
      *,
      client:profiles!projects_client_id_fkey(id, full_name, email),
      freelancer:profiles!projects_freelancer_id_fkey(id, full_name, email)
    `
    )
    .in('escrow_status', ['verified_held', 'pending_release'])
    .order('escrow_verified_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch active escrows: ${error.message}`)
  }

  return data
}

/**
 * Calculate total platform fees earned
 */
export async function getTotalPlatformFees(startDate?: string, endDate?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('projects')
    .select('platform_fee_amount')
    .eq('escrow_status', 'released')

  if (startDate) {
    query = query.gte('escrow_released_at', startDate)
  }

  if (endDate) {
    query = query.lte('escrow_released_at', endDate)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to calculate platform fees: ${error.message}`)
  }

  const total = data?.reduce((sum, project) => sum + (project.platform_fee_amount || 0), 0) || 0

  return total
}
