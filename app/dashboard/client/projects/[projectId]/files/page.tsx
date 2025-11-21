import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProjectFilesWithComments } from '@/utils/database/files'
import WorkspaceFilesClient from '@/components/dashboard/WorkspaceFilesClient'

export default async function ClientProjectFilesPage({
  params
}: {
  params: { projectId: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Get project to verify access
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, title, client_id, freelancer_id')
    .eq('id', params.projectId)
    .single()

  if (projectError || !project) {
    redirect('/dashboard/client')
  }

  // Verify user is part of this project
  if (project.client_id !== user.id && project.freelancer_id !== user.id) {
    redirect('/dashboard/client')
  }

  // Get files with comments
  const files = await getProjectFilesWithComments(params.projectId)

  return (
    <WorkspaceFilesClient
      projectId={params.projectId}
      projectTitle={project.title}
      initialFiles={files}
      currentUserId={user.id}
    />
  )
}
