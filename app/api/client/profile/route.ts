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
      company_name,
      company_description,
      company_website,
      industry,
      company_size,
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

    // Update or insert client_profile
    const { error: clientError } = await supabase
      .from('client_profiles')
      .upsert({
        id: user.id,
        company_name,
        company_description,
        company_website,
        industry,
        company_size,
        updated_at: new Date().toISOString(),
      })

    if (clientError) {
      console.error('Client profile update error:', clientError)
      return NextResponse.json({ error: 'Failed to update client profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
