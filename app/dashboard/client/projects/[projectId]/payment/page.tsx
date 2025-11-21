import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PaymentPageClient from '@/components/payment/PaymentPageClient'

export default async function PaymentPage({ params }: { params: Promise<{ projectId: string }> }) {
  const supabase = await createClient()
  const { projectId } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'client') {
    redirect(`/dashboard/${profile?.role || 'freelancer'}`)
  }

  // Fetch project with escrow details
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(`
      *,
      freelancer:profiles!freelancer_id (
        id,
        full_name,
        email,
        freelancer_profiles (
          avatar_url,
          rating,
          skills,
          hourly_rate
        )
      )
    `)
    .eq('id', projectId)
    .eq('client_id', user.id)
    .single()

  if (projectError || !project) {
    redirect('/dashboard/client')
  }

  // Fetch the accepted proposal
  const { data: acceptedProposal } = await supabase
    .from('proposals')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'accepted')
    .single()

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/signin')
  }

  const handleCompletePayment = async () => {
    'use server'
    const supabase = await createClient()

    try {
      // Update project status to 'in_progress' and escrow status to 'funded'
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          status: 'in_progress',
          escrow_status: 'funded',
          payment_received_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)

      if (projectError) {
        console.error('Error updating project:', projectError)
        return { success: false, error: 'Failed to update project status' }
      }

      // Create escrow transaction record
      const transactionId = `txn_${projectId}_${Date.now()}`

      const { error: transactionError } = await supabase
        .from('escrow_transactions')
        .insert({
          project_id: projectId,
          transaction_type: 'payment_completed',
          amount: project.escrow_amount,
          status: 'completed',
          description: `Payment completed successfully for project: ${project.title}. Amount: $${project.escrow_amount}`,
          transaction_id: transactionId,
          created_at: new Date().toISOString(),
        })

      if (transactionError) {
        console.error('Error creating transaction record:', transactionError)
        // Don't fail if transaction record fails, project status is already updated
      }

      // Send notification to freelancer
      if (project.freelancer_id) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: project.freelancer_id,
            type: 'project_started',
            title: 'Payment Received - Project Started!',
            message: `Payment has been received for "${project.title}". You can now start working on the project.`,
            link: `/dashboard/freelancer/projects/${projectId}`,
            created_at: new Date().toISOString()
          })

        if (notificationError) {
          console.error('Error sending notification:', notificationError)
          // Don't fail if notification fails
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Payment completion error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  return (
    <PaymentPageClient
      userName={profile?.full_name || user.email || 'User'}
      onSignOut={handleSignOut}
      project={project}
      acceptedProposal={acceptedProposal}
      handleCompletePayment={handleCompletePayment}
    />
  )
}
