import { createClient } from '@/lib/supabase/server'
import { FreelancerProfile, ClientProfile, FreelancerWithProfile } from '@/types/database.types'

export async function getFreelancerProfile(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      freelancer_profile:freelancer_profiles(*)
    `)
    .eq('id', userId)
    .single()

  if (error) throw error
  return data as FreelancerWithProfile
}

export async function getClientProfile(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      client_profile:client_profiles(*)
    `)
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function updateFreelancerProfile(
  userId: string,
  profile: Partial<FreelancerProfile>
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('freelancer_profiles')
    .upsert({
      id: userId,
      ...profile
    })
    .select()
    .single()

  if (error) throw error
  return data as FreelancerProfile
}

export async function updateClientProfile(
  userId: string,
  profile: Partial<ClientProfile>
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('client_profiles')
    .upsert({
      id: userId,
      ...profile
    })
    .select()
    .single()

  if (error) throw error
  return data as ClientProfile
}

export async function searchFreelancers(searchParams: {
  skills?: string[]
  minRate?: number
  maxRate?: number
  availability?: string
  minRating?: number
}) {
  const supabase = await createClient()

  let query = supabase
    .from('freelancer_profiles')
    .select(`
      *,
      profile:profiles!id(
        id,
        full_name,
        email
      )
    `)

  // Filter by skills
  if (searchParams.skills && searchParams.skills.length > 0) {
    query = query.overlaps('skills', searchParams.skills)
  }

  // Filter by hourly rate
  if (searchParams.minRate !== undefined) {
    query = query.gte('hourly_rate', searchParams.minRate)
  }
  if (searchParams.maxRate !== undefined) {
    query = query.lte('hourly_rate', searchParams.maxRate)
  }

  // Filter by availability
  if (searchParams.availability) {
    query = query.eq('availability', searchParams.availability)
  }

  // Filter by rating
  if (searchParams.minRating !== undefined) {
    query = query.gte('rating', searchParams.minRating)
  }

  const { data, error } = await query.order('rating', { ascending: false })

  if (error) throw error
  return data
}

export async function getFreelancerReviews(freelancerId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:profiles!reviewer_id(
        id,
        full_name,
        email
      ),
      project:projects(
        id,
        title
      )
    `)
    .eq('reviewee_id', freelancerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createReview(
  projectId: string,
  reviewerId: string,
  revieweeId: string,
  rating: number,
  comment?: string
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      project_id: projectId,
      reviewer_id: reviewerId,
      reviewee_id: revieweeId,
      rating,
      comment
    })
    .select()
    .single()

  if (error) throw error
  return data
}
