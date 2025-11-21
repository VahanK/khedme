import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      full_name,
      bio,
      title,
      skills,
      languages,
      hourly_rate,
      portfolio_url,
      avatar_url,
      years_of_experience,
      availability_status,
      service_packages,
    } = body

    // Update profile table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name })
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile update error:', profileError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    // Update or insert freelancer_profile
    const { error: freelancerError } = await supabase
      .from('freelancer_profiles')
      .upsert({
        id: user.id,
        bio,
        title,
        skills,
        languages,
        hourly_rate: parseFloat(hourly_rate),
        portfolio_url,
        avatar_url,
        years_of_experience: years_of_experience ? parseInt(years_of_experience) : null,
        availability: availability_status,
        service_packages: service_packages || [],
        updated_at: new Date().toISOString(),
      })

    if (freelancerError) {
      console.error('Freelancer profile update error:', freelancerError)
      return NextResponse.json({ error: 'Failed to update freelancer profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
