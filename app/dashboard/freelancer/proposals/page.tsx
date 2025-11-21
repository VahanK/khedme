import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ProposalCard from '@/components/dashboard/ProposalCard'
import { Card, CardBody, Tabs, Tab } from '@heroui/react'

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

  if (profile?.role !== 'freelancer') {
    redirect(`/dashboard/${profile?.role || 'client'}`)
  }

  // Fetch all proposals
  const { data: proposals } = await supabase
    .from('proposals')
    .select(`
      *,
      projects (
        id,
        title,
        description,
        client_id,
        profiles!projects_client_id_fkey (
          full_name,
          client_profiles (
            company_name,
            avatar_url
          )
        )
      )
    `)
    .eq('freelancer_id', user.id)
    .order('created_at', { ascending: false })

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/signin')
  }

  const pendingProposals = proposals?.filter(p => p.status === 'pending') || []
  const acceptedProposals = proposals?.filter(p => p.status === 'accepted') || []
  const rejectedProposals = proposals?.filter(p => p.status === 'rejected') || []
  const withdrawnProposals = proposals?.filter(p => p.status === 'withdrawn') || []

  return (
    <DashboardLayout
      userName={profile?.full_name || user.email || 'User'}
      userRole="freelancer"
      onSignOut={handleSignOut}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Proposals</h2>
        <p className="text-gray-600 mt-1">Track all your project proposals</p>
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
              <div className="p-4 space-y-4">
                {pendingProposals.length > 0 ? (
                  pendingProposals.map((proposal, index) => (
                    <ProposalCard
                      key={proposal.id}
                      id={proposal.id}
                      // @ts-ignore
                      projectTitle={proposal.projects?.title || 'Unknown Project'}
                      // @ts-ignore
                      projectId={proposal.projects?.id || proposal.project_id}
                      // @ts-ignore
                      projectDescription={proposal.projects?.description}
                      // @ts-ignore
                      clientName={proposal.projects?.profiles?.full_name}
                      // @ts-ignore
                      clientCompany={proposal.projects?.profiles?.client_profiles?.company_name}
                      // @ts-ignore
                      clientAvatar={proposal.projects?.profiles?.client_profiles?.avatar_url}
                      proposedBudget={proposal.proposed_budget}
                      estimatedDuration={proposal.estimated_duration}
                      coverLetter={proposal.cover_letter}
                      status={proposal.status}
                      createdAt={proposal.created_at}
                      userRole="freelancer"
                      delay={index * 0.05}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">⏳</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending proposals</h3>
                    <p className="text-gray-600">Your pending proposals will appear here</p>
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
              <div className="p-4 space-y-4">
                {acceptedProposals.length > 0 ? (
                  acceptedProposals.map((proposal, index) => (
                    <ProposalCard
                      key={proposal.id}
                      id={proposal.id}
                      // @ts-ignore
                      projectTitle={proposal.projects?.title || 'Unknown Project'}
                      // @ts-ignore
                      projectId={proposal.projects?.id || proposal.project_id}
                      // @ts-ignore
                      projectDescription={proposal.projects?.description}
                      // @ts-ignore
                      clientName={proposal.projects?.profiles?.full_name}
                      // @ts-ignore
                      clientCompany={proposal.projects?.profiles?.client_profiles?.company_name}
                      // @ts-ignore
                      clientAvatar={proposal.projects?.profiles?.client_profiles?.avatar_url}
                      proposedBudget={proposal.proposed_budget}
                      estimatedDuration={proposal.estimated_duration}
                      coverLetter={proposal.cover_letter}
                      status={proposal.status}
                      createdAt={proposal.created_at}
                      userRole="freelancer"
                      delay={index * 0.05}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">✓</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No accepted proposals yet</h3>
                    <p className="text-gray-600">Keep applying to projects!</p>
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
              <div className="p-4 space-y-4">
                {rejectedProposals.length > 0 ? (
                  rejectedProposals.map((proposal, index) => (
                    <ProposalCard
                      key={proposal.id}
                      id={proposal.id}
                      // @ts-ignore
                      projectTitle={proposal.projects?.title || 'Unknown Project'}
                      // @ts-ignore
                      projectId={proposal.projects?.id || proposal.project_id}
                      // @ts-ignore
                      projectDescription={proposal.projects?.description}
                      // @ts-ignore
                      clientName={proposal.projects?.profiles?.full_name}
                      // @ts-ignore
                      clientCompany={proposal.projects?.profiles?.client_profiles?.company_name}
                      // @ts-ignore
                      clientAvatar={proposal.projects?.profiles?.client_profiles?.avatar_url}
                      proposedBudget={proposal.proposed_budget}
                      estimatedDuration={proposal.estimated_duration}
                      coverLetter={proposal.cover_letter}
                      status={proposal.status}
                      createdAt={proposal.created_at}
                      userRole="freelancer"
                      delay={index * 0.05}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">✗</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No rejected proposals</h3>
                    <p className="text-gray-600">Your rejected proposals will appear here</p>
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
