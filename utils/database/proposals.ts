import { createClient } from '@/lib/supabase/server'
import { Proposal } from '@/types/database.types'

export async function getProposalsByProject(projectId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposals')
    .select(`
      *,
      freelancer:profiles!freelancer_id(
        id,
        full_name,
        email,
        freelancer_profile:freelancer_profiles(*)
      )
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getMyProposals(freelancerId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposals')
    .select(`
      *,
      project:projects(
        id,
        title,
        description,
        budget_min,
        budget_max,
        status,
        client:profiles!client_id(
          id,
          full_name,
          email,
          client_profile:client_profiles(*)
        )
      )
    `)
    .eq('freelancer_id', freelancerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createProposal(
  proposal: Omit<Proposal, 'id' | 'created_at' | 'updated_at' | 'status'>
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposals')
    .insert(proposal)
    .select()
    .single()

  if (error) throw error
  return data as Proposal
}

export async function updateProposalStatus(
  proposalId: string,
  status: Proposal['status']
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposals')
    .update({ status })
    .eq('id', proposalId)
    .select()
    .single()

  if (error) throw error
  return data as Proposal
}

export async function acceptProposal(proposalId: string, projectId: string) {
  const supabase = await createClient()

  // Get the proposal with budget to calculate escrow
  const { data: proposal, error: proposalError } = await supabase
    .from('proposals')
    .select('freelancer_id, proposed_budget')
    .eq('id', proposalId)
    .single()

  if (proposalError) throw proposalError

  // Calculate escrow amounts (5% platform fee)
  const platformFeePercentage = 5.0
  const escrowAmount = proposal.proposed_budget
  const platformFeeAmount = (escrowAmount * platformFeePercentage) / 100
  const freelancerPayoutAmount = escrowAmount - platformFeeAmount

  // Start a transaction-like operation
  // 1. Accept the proposal (triggers notification via database trigger)
  const { error: acceptError } = await supabase
    .from('proposals')
    .update({ status: 'accepted' })
    .eq('id', proposalId)

  if (acceptError) throw acceptError

  // 2. Reject all other proposals for this project (triggers notifications via database trigger)
  const { error: rejectError } = await supabase
    .from('proposals')
    .update({ status: 'rejected' })
    .eq('project_id', projectId)
    .neq('id', proposalId)

  if (rejectError) throw rejectError

  // 3. Update project with freelancer, status, and escrow details
  const { data: updatedProject, error: updateError } = await supabase
    .from('projects')
    .update({
      freelancer_id: proposal.freelancer_id,
      status: 'in_progress',
      escrow_amount: escrowAmount,
      escrow_status: 'pending_payment',
      platform_fee_amount: platformFeeAmount,
      platform_fee_percentage: platformFeePercentage,
      freelancer_payout_amount: freelancerPayoutAmount,
    })
    .eq('id', projectId)
    .select()
    .single()

  if (updateError) throw updateError

  // 4. Create escrow transaction record
  const { error: transactionError } = await supabase
    .from('escrow_transactions')
    .insert({
      project_id: projectId,
      transaction_type: 'proposal_accepted',
      amount: escrowAmount,
      status: 'pending',
      description: `Proposal accepted - Escrow amount set to $${escrowAmount}`,
      created_at: new Date().toISOString(),
    })

  if (transactionError) {
    console.error('Failed to create escrow transaction:', transactionError)
    // Don't throw - this is not critical for the acceptance workflow
  }

  return {
    success: true,
    project: updatedProject,
    escrowAmount,
    platformFeeAmount,
    freelancerPayoutAmount
  }
}
