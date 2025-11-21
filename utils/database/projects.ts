import { createClient } from '@/lib/supabase/server'
import { Project, Proposal, ProjectWithDetails } from '@/types/database.types'

export async function getOpenProjects() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:profiles!client_id(
        id,
        full_name,
        email,
        client_profile:client_profiles(*)
      )
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ProjectWithDetails[]
}

export async function getProjectById(projectId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:profiles!client_id(
        id,
        full_name,
        email,
        client_profile:client_profiles(*)
      ),
      freelancer:profiles!freelancer_id(
        id,
        full_name,
        email,
        freelancer_profile:freelancer_profiles(*)
      ),
      files:project_files(*),
      proposals:proposals(
        *,
        freelancer:profiles(
          id,
          full_name,
          email,
          freelancer_profile:freelancer_profiles(*)
        )
      )
    `)
    .eq('id', projectId)
    .single()

  if (error) throw error
  return data as ProjectWithDetails
}

export async function getMyProjects(userId: string, role: 'freelancer' | 'client') {
  const supabase = await createClient()

  const query = supabase
    .from('projects')
    .select(`
      *,
      client:profiles!client_id(
        id,
        full_name,
        email,
        client_profile:client_profiles(*)
      ),
      freelancer:profiles!freelancer_id(
        id,
        full_name,
        email,
        freelancer_profile:freelancer_profiles(*)
      )
    `)
    .order('created_at', { ascending: false })

  // Filter based on role
  if (role === 'client') {
    query.eq('client_id', userId)
  } else {
    query.eq('freelancer_id', userId)
  }

  const { data, error } = await query

  if (error) throw error
  return data as ProjectWithDetails[]
}

export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'status' | 'payment_status' | 'freelancer_id'>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single()

  if (error) throw error
  return data as Project
}

export async function updateProjectStatus(
  projectId: string,
  status: Project['status'],
  freelancerId?: string
) {
  const supabase = await createClient()

  const updateData: any = { status }
  if (freelancerId) {
    updateData.freelancer_id = freelancerId
  }

  const { data, error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', projectId)
    .select()
    .single()

  if (error) throw error
  return data as Project
}

export async function updatePaymentStatus(
  projectId: string,
  paymentStatus: Project['payment_status']
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .update({ payment_status: paymentStatus })
    .eq('id', projectId)
    .select()
    .single()

  if (error) throw error
  return data as Project
}

export async function searchProjects(searchTerm: string, skills?: string[]) {
  const supabase = await createClient()

  let query = supabase
    .from('projects')
    .select(`
      *,
      client:profiles!client_id(
        id,
        full_name,
        email,
        client_profile:client_profiles(*)
      )
    `)
    .eq('status', 'open')
    .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)

  if (skills && skills.length > 0) {
    query = query.overlaps('required_skills', skills)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data as ProjectWithDetails[]
}
