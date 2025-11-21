import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ProjectCard from '@/components/dashboard/ProjectCard'

export default async function BrowseProjectsPage() {
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

  // Fetch available projects (open projects, not already applied to)
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
      ),
      proposals(count)
    `)
    .eq('status', 'open')

  // Only exclude applied projects if there are any
  if (appliedIds.length > 0) {
    availableProjectsQuery = availableProjectsQuery.not('id', 'in', `(${appliedIds.join(',')})`)
  }

  const { data: availableProjects } = await availableProjectsQuery
    .order('created_at', { ascending: false })

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/signin')
  }

  return (
    <DashboardLayout
      userName={profile?.full_name || user.email || 'User'}
      userRole="freelancer"
      onSignOut={handleSignOut}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Browse Projects</h2>
        <p className="text-gray-600 mt-1">Find your next opportunity</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          {availableProjects && availableProjects.length > 0 ? (
            <div className="grid gap-4">
              {availableProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  title={project.title}
                  description={project.description}
                  budgetMin={project.budget_min}
                  budgetMax={project.budget_max}
                  deadline={project.deadline}
                  requiredSkills={project.required_skills}
                  status={project.status}
                  // @ts-ignore
                  proposalsCount={project.proposals?.[0]?.count || 0}
                  userRole="freelancer"
                  // @ts-ignore
                  clientName={project.profiles?.full_name || 'Unknown Client'}
                  postedAt={project.created_at}
                  delay={index * 0.05}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects available</h3>
              <p className="text-gray-600">
                Check back later for new opportunities!
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
