import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientProjectDetail from '@/components/project/ClientProjectDetail'

export default async function ClientProjectPage({
  params,
  searchParams
}: {
  params: Promise<{ projectId: string }>
  searchParams: Promise<{ payment?: string }>
}) {
  const supabase = await createClient()
  const { projectId } = await params
  const { payment } = await searchParams

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

  // Fetch project with all details
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
          hourly_rate,
          title
        )
      )
    `)
    .eq('id', projectId)
    .eq('client_id', user.id)
    .single()

  if (projectError || !project) {
    redirect('/dashboard/client')
  }

  // Fetch accepted proposal
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

  return (
    <ClientProjectDetail
      userName={profile?.full_name || user.email || 'User'}
      onSignOut={handleSignOut}
      project={project}
      acceptedProposal={acceptedProposal}
      showPaymentSuccess={payment === 'success'}
    />
  )
}
