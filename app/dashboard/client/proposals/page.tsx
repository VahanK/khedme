import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ProposalsClient from './ProposalsClient'
import { Card, CardBody, Tabs, Tab } from '@heroui/react'
import { acceptProposal } from '@/utils/database/proposals'

export default async function ProposalsPage() {
  const supabase = await createClient()

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

  // Fetch all proposals for client's projects (including negotiation fields)
  const { data: proposals, error } = await supabase
    .from('proposals')
    .select(`
      *,
      negotiation_count,
      original_budget,
      negotiation_history,
      source,
      projects!inner (
        id,
        title,
        description,
        client_id
      ),
      profiles:freelancer_id (
        id,
        full_name,
        freelancer_profiles (
          avatar_url,
          hourly_rate,
          rating,
          skills
        )
      )
    `)
    .eq('projects.client_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching proposals:', error)
  }

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/signin')
  }

  const handleAcceptProposal = async (proposalId: string) => {
    'use server'
    const supabase = await createClient()

    // Get the proposal's project_id
    const { data: proposal, error: fetchError } = await supabase
      .from('proposals')
      .select('project_id')
      .eq('id', proposalId)
      .single()

    if (fetchError || !proposal) {
      console.error('Error fetching proposal:', fetchError)
      throw fetchError || new Error('Proposal not found')
    }

    try {
      // Use the enhanced acceptProposal function
      const result = await acceptProposal(proposalId, proposal.project_id)

      if (result.success) {
        // Redirect to payment page for the project
        redirect(`/dashboard/client/projects/${proposal.project_id}/payment`)
      }
    } catch (error) {
      console.error('Error accepting proposal:', error)
      throw error
    }
  }

  const handleDeclineProposal = async (proposalId: string) => {
    'use server'
    const supabase = await createClient()

    const { error } = await supabase
      .from('proposals')
      .update({ status: 'rejected' })
      .eq('id', proposalId)

    if (error) {
      console.error('Error declining proposal:', error)
      throw error
    }

    redirect('/dashboard/client/proposals')
  }

  const pendingProposals = proposals?.filter(p => p.status === 'pending' || p.status === 'negotiating' || p.status === 'final_offer') || []
  const acceptedProposals = proposals?.filter(p => p.status === 'accepted') || []
  const rejectedProposals = proposals?.filter(p => p.status === 'rejected') || []

  return (
    <DashboardLayout
      userName={profile?.full_name || user.email || 'User'}
      userRole="client"
      onSignOut={handleSignOut}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Proposals Received</h2>
        <p className="text-gray-600 mt-1">Review and manage freelancer proposals</p>
      </div>

      <Card>
        <CardBody className="p-0">
          <Tabs aria-label="Proposal status tabs" size="lg" className="px-4 pt-4">
            <Tab
              key="pending"
              title={
                <div className="flex items-center gap-2">
                  <span>Pending</span>
                  <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {pendingProposals.length}
                  </span>
                </div>
              }
            >
              <div className="p-4">
                {pendingProposals.length > 0 ? (
                  <ProposalsClient
                    proposals={pendingProposals}
                    userRole="client"
                    onAccept={handleAcceptProposal}
                    onDecline={handleDeclineProposal}
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">⏳</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending proposals</h3>
                    <p className="text-gray-600">Pending proposals will appear here</p>
                  </div>
                )}
              </div>
            </Tab>

            <Tab
              key="accepted"
              title={
                <div className="flex items-center gap-2">
                  <span>Accepted</span>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {acceptedProposals.length}
                  </span>
                </div>
              }
            >
              <div className="p-4">
                {acceptedProposals.length > 0 ? (
                  <ProposalsClient
                    proposals={acceptedProposals}
                    userRole="client"
                    onAccept={handleAcceptProposal}
                    onDecline={handleDeclineProposal}
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">✓</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No accepted proposals yet</h3>
                    <p className="text-gray-600">Accepted proposals will appear here</p>
                  </div>
                )}
              </div>
            </Tab>

            <Tab
              key="rejected"
              title={
                <div className="flex items-center gap-2">
                  <span>Rejected</span>
                  <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {rejectedProposals.length}
                  </span>
                </div>
              }
            >
              <div className="p-4">
                {rejectedProposals.length > 0 ? (
                  <ProposalsClient
                    proposals={rejectedProposals}
                    userRole="client"
                    onAccept={handleAcceptProposal}
                    onDecline={handleDeclineProposal}
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">✗</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No rejected proposals</h3>
                    <p className="text-gray-600">Rejected proposals will appear here</p>
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </DashboardLayout>
  )
}
