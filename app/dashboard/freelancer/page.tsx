import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import FreelancerTabs from '@/components/dashboard/FreelancerTabs'

export default async function ModernFreelancerDashboard() {
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
  if (profile.role !== 'freelancer') {
    redirect(`/dashboard/${profile.role}`)
  }

  // Fetch freelancer profile data
  const { data: freelancerProfile } = await supabase
    .from('freelancer_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch proposals (excluding accepted proposals that have been paid)
  const { data: proposals } = await supabase
    .from('proposals')
    .select(`
      *,
      projects (
        title,
        description,
        status,
        client_id,
        escrow_status,
        profiles!projects_client_id_fkey (
          full_name
        )
      )
    `)
    .eq('freelancer_id', user.id)
    .order('created_at', { ascending: false })

  // Filter out accepted proposals that have been funded (these appear in Active Projects)
  const filteredProposals = proposals?.filter(proposal => {
    // @ts-ignore
    const project = proposal.projects
    // Keep if: proposal is pending OR (accepted but not yet funded)
    return proposal.status === 'pending' ||
           (proposal.status === 'accepted' && (!project?.escrow_status || project.escrow_status !== 'verified_held'))
  }).slice(0, 5) || []

  // Fetch active projects
  const { data: activeProjects } = await supabase
    .from('projects')
    .select(`
      *,
      profiles!projects_client_id_fkey (
        full_name,
        email
      )
    `)
    .eq('freelancer_id', user.id)
    .in('status', ['in_progress', 'in_review'])
    .order('created_at', { ascending: false })

  const activeProjectsCount = activeProjects?.length || 0

  // Count proposals by status
  const { count: pendingProposalsCount } = await supabase
    .from('proposals')
    .select('*', { count: 'exact', head: true })
    .eq('freelancer_id', user.id)
    .eq('status', 'pending')

  const { count: acceptedProposalsCount } = await supabase
    .from('proposals')
    .select('*', { count: 'exact', head: true })
    .eq('freelancer_id', user.id)
    .eq('status', 'accepted')

  // Calculate total earnings
  const { data: completedProjects } = await supabase
    .from('projects')
    .select('budget_max')
    .eq('freelancer_id', user.id)
    .eq('status', 'completed')
    .eq('payment_status', 'paid')

  const totalEarnings = completedProjects?.reduce((sum, p) => sum + (p.budget_max || 0), 0) || 0

  // Fetch available projects
  const { data: appliedProjectIds } = await supabase
    .from('proposals')
    .select('project_id')
    .eq('freelancer_id', user.id)

  const appliedIds = appliedProjectIds?.map(p => p.project_id) || []

  let availableProjectsQuery = supabase
    .from('projects')
    .select(`
      *,
      profiles!projects_client_id_fkey (
        full_name
      )
    `)
    .eq('status', 'open')

  // Only exclude applied projects if there are any
  if (appliedIds.length > 0) {
    availableProjectsQuery = availableProjectsQuery.not('id', 'in', `(${appliedIds.join(',')})`)
  }

  const { data: availableProjects } = await availableProjectsQuery
    .order('created_at', { ascending: false })
    .limit(2)

  // Fetch completed projects
  const { data: completedProjectsList } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      description,
      status,
      budget_max,
      created_at,
      completed_at,
      profiles!projects_client_id_fkey (
        full_name
      )
    `)
    .eq('freelancer_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  // Calculate profile completion
  const profileItems = [
    !!freelancerProfile?.bio,
    !!freelancerProfile?.skills && freelancerProfile.skills.length > 0,
    !!freelancerProfile?.portfolio_url,
    !!freelancerProfile?.avatar_url,
  ]
  const completedItems = profileItems.filter(Boolean).length
  const profileCompletion = Math.round((completedItems / profileItems.length) * 100)

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/signin')
  }

  return (
    <DashboardLayout
      userName={profile?.full_name || user.email || 'User'}
      userEmail={user.email}
      userAvatar={freelancerProfile?.avatar_url}
      userRole="freelancer"
      onSignOut={handleSignOut}
      stats={{
        activeProjects: activeProjectsCount || 0,
        pendingProposals: pendingProposalsCount || 0,
        unreadMessages: 0,
      }}
    >
      <FreelancerTabs
        profileCompletion={profileCompletion}
        totalEarnings={totalEarnings}
        activeProjectsCount={activeProjectsCount || 0}
        pendingProposalsCount={pendingProposalsCount || 0}
        profile={profile}
        freelancerProfile={freelancerProfile}
        proposals={filteredProposals}
        availableProjects={availableProjects || []}
        completedProjects={completedProjectsList || []}
        activeProjects={activeProjects || []}
        userRole="freelancer"
      />
    </DashboardLayout>
  )
}
