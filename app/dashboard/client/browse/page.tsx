import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BrowseFreelancersClient from './BrowseFreelancersClient'

export default async function BrowseFreelancersPage() {
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

  // Fetch all freelancers with their profiles
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

  // Fetch client's projects for the invite modal
  const { data: clientProjects } = await supabase
    .from('projects')
    .select('id, title, status')
    .eq('client_id', user.id)
    .in('status', ['open', 'in_progress'])
    .order('created_at', { ascending: false })

  // Get all unique skills for the filter
  const allSkills = new Set<string>()
  freelancers?.forEach(f => {
    f.freelancer_profiles?.skills?.forEach((skill: string) => allSkills.add(skill))
  })

  return (
    <BrowseFreelancersClient
      freelancers={freelancers || []}
      clientProjects={clientProjects || []}
      availableSkills={Array.from(allSkills).sort()}
      clientId={user.id}
    />
  )
}
