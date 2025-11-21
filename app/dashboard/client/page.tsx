import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ClientTabs from '@/components/dashboard/ClientTabs'
import { acceptProposal } from '@/utils/database/proposals'

export default async function ModernClientDashboard() {
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

  // Redirect to select role if no role is set
  if (!profile?.role) {
    redirect('/auth/select-role')
  }

  // Redirect to correct dashboard if wrong role
  if (profile.role !== 'client') {
    redirect(`/dashboard/${profile.role}`)
  }

  // Fetch client profile data
  const { data: clientProfile } = await supabase
    .from('client_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch client's projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*, proposals(count)')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Count active projects
  const { count: activeProjectsCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', user.id)
    .in('status', ['open', 'in_progress', 'in_review'])

  // Count hired freelancers (unique freelancers in active projects)
  const { data: hiredFreelancers } = await supabase
    .from('projects')
    .select('freelancer_id')
    .eq('client_id', user.id)
    .not('freelancer_id', 'is', null)
    .in('status', ['in_progress', 'in_review'])

  const uniqueFreelancersCount = new Set(hiredFreelancers?.map(p => p.freelancer_id)).size

  // Calculate total spent (from completed projects)
  const { data: completedProjects } = await supabase
    .from('projects')
    .select('budget_max')
    .eq('client_id', user.id)
    .eq('status', 'completed')
    .eq('payment_status', 'paid')

  const totalSpent = completedProjects?.reduce((sum, p) => sum + (p.budget_max || 0), 0) || 0

  // Fetch active projects (funded and in progress)
  const { data: activeProjects } = await supabase
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
          skills
        )
      )
    `)
    .eq('client_id', user.id)
    .in('status', ['in_progress', 'in_review'])
    .eq('escrow_status', 'verified_held')
    .order('created_at', { ascending: false })

  // Fetch recent proposals on client's projects
  const { data: recentProposals } = await supabase
    .from('proposals')
    .select(`
      *,
      projects!inner (
        id,
        title,
        description,
        client_id
      ),
      profiles:freelancer_id (
        id,
        full_name,
        email,
        freelancer_profiles (
          avatar_url,
          rating,
          skills
        )
      )
    `)
    .eq('projects.client_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch all freelancers with their profiles for browse tab
  const { data: freelancers } = await supabase
    .from('profiles')
    .select(`
      *,
      freelancer_profiles (
        title,
        bio,
        hourly_rate,
        rating,
        total_reviews,
        completed_projects,
        skills,
        availability,
        languages,
        location,
        avatar_url,
        years_of_experience
      )
    `)
    .eq('role', 'freelancer')
    .not('freelancer_profiles', 'is', null)
    .order('created_at', { ascending: false })

  // Get all unique skills and languages for the filters
  const allSkills = new Set<string>()
  const allLanguages = new Set<string>()
  freelancers?.forEach(f => {
    f.freelancer_profiles?.skills?.forEach((skill: string) => allSkills.add(skill))
    f.freelancer_profiles?.languages?.forEach((lang: string) => allLanguages.add(lang))
  })

  // Calculate profile completion
  const profileItems = [
    !!profile?.full_name,
    !!clientProfile?.company_name,
    !!clientProfile?.company_description,
    !!clientProfile?.company_website,
  ]
  const completedItems = profileItems.filter(Boolean).length
  const profileCompletion = Math.round((completedItems / profileItems.length) * 100)

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

    redirect('/dashboard/client')
  }

  return (
    <DashboardLayout
      userName={profile?.full_name || user.email || 'User'}
      userEmail={user.email}
      userAvatar={clientProfile?.avatar_url}
      userRole="client"
      onSignOut={handleSignOut}
      stats={{
        activeProjects: activeProjectsCount || 0,
        pendingProposals: recentProposals?.length || 0,
        unreadMessages: 0,
      }}
    >
      <ClientTabs
        profileCompletion={profileCompletion}
        totalSpent={totalSpent}
        activeProjectsCount={activeProjectsCount || 0}
        pendingProposalsCount={recentProposals?.length || 0}
        uniqueFreelancersCount={uniqueFreelancersCount}
        profile={profile}
        clientProfile={clientProfile}
        projects={projects || []}
        activeProjects={activeProjects || []}
        recentProposals={recentProposals || []}
        completedProjects={completedProjects || []}
        freelancers={freelancers || []}
        availableSkills={Array.from(allSkills).sort()}
        availableLanguages={Array.from(allLanguages).sort()}
        userRole="client"
        onAcceptProposal={handleAcceptProposal}
        onDeclineProposal={handleDeclineProposal}
      />
    </DashboardLayout>
  )
}
