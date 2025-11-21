import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FreelancerProjectDetail from '@/components/project/FreelancerProjectDetail'

export default async function FreelancerProjectPage({
  params
}: {
  params: Promise<{ projectId: string }>
}) {
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

  if (profile?.role !== 'freelancer') {
    redirect(`/dashboard/${profile?.role || 'client'}`)
  }

  // Fetch project with all details
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(`
      *,
      client:profiles!client_id (
        id,
        full_name,
        email
      )
    `)
    .eq('id', projectId)
    .eq('freelancer_id', user.id)
    .single()

  if (projectError || !project) {
    redirect('/dashboard/freelancer')
  }

  // Fetch accepted proposal
  const { data: acceptedProposal } = await supabase
    .from('proposals')
    .select('*')
    .eq('project_id', projectId)
    .eq('freelancer_id', user.id)
    .eq('status', 'accepted')
    .single()

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/signin')
  }

  return (
    <FreelancerProjectDetail
      userName={profile?.full_name || user.email || 'User'}
      onSignOut={handleSignOut}
      project={project}
      acceptedProposal={acceptedProposal}
    />
  )
}
