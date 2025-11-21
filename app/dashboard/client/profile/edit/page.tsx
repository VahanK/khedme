import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ClientProfileEditForm from '@/components/client/ClientProfileEditForm'

export default async function ClientProfileEdit() {
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

  if (!profile?.role || profile.role !== 'client') {
    redirect('/auth/select-role')
  }

  // Fetch client profile
  const { data: clientProfile } = await supabase
    .from('client_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Count active projects
  const { count: activeProjectsCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', user.id)
    .in('status', ['open', 'in_progress', 'in_review'])

  // Fetch recent proposals
  const { data: recentProposals } = await supabase
    .from('proposals')
    .select(`
      *,
      projects!inner (
        id,
        title,
        client_id
      )
    `)
    .eq('projects.client_id', user.id)
    .eq('status', 'pending')
    .limit(5)

  // Calculate total spent
  const { data: completedProjects } = await supabase
    .from('projects')
    .select('budget_max')
    .eq('client_id', user.id)
    .eq('status', 'completed')
    .eq('payment_status', 'paid')

  const totalSpent = completedProjects?.reduce((sum, p) => sum + (p.budget_max || 0), 0) || 0

  // Calculate profile completion
  const profileItems = [
    !!clientProfile?.company_name,
    !!clientProfile?.company_description,
    !!clientProfile?.company_website,
    !!clientProfile?.avatar_url,
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
      userAvatar={clientProfile?.avatar_url}
      userRole="client"
      onSignOut={handleSignOut}
      stats={{
        activeProjects: activeProjectsCount || 0,
        pendingProposals: recentProposals?.length || 0,
        unreadMessages: 0,
        earnings: totalSpent,
        profileCompletion,
      }}
    >
      <ClientProfileEditForm
        profile={profile}
        clientProfile={clientProfile}
      />
    </DashboardLayout>
  )
}
