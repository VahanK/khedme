import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ProfileEditForm from '@/components/freelancer/ProfileEditForm'

export default async function FreelancerProfileEdit() {
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

  if (!profile?.role || profile.role !== 'freelancer') {
    redirect('/auth/select-role')
  }

  // Fetch freelancer profile
  const { data: freelancerProfile } = await supabase
    .from('freelancer_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Count active projects
  const { count: activeProjectsCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('freelancer_id', user.id)
    .in('status', ['in_progress', 'in_review'])

  // Count pending proposals
  const { count: pendingProposalsCount } = await supabase
    .from('proposals')
    .select('*', { count: 'exact', head: true })
    .eq('freelancer_id', user.id)
    .eq('status', 'pending')

  // Calculate total earnings
  const { data: completedProjects } = await supabase
    .from('projects')
    .select('budget_max')
    .eq('freelancer_id', user.id)
    .eq('status', 'completed')
    .eq('payment_status', 'paid')

  const totalEarnings = completedProjects?.reduce((sum, p) => sum + (p.budget_max || 0), 0) || 0

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
        earnings: totalEarnings,
        profileCompletion,
      }}
    >
      <ProfileEditForm
        profile={profile}
        freelancerProfile={freelancerProfile}
      />
    </DashboardLayout>
  )
}
