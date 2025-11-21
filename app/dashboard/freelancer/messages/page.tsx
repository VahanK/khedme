import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Card, CardBody } from '@heroui/react'

export default async function MessagesPage() {
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
        <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
        <p className="text-gray-600 mt-1">Communicate with clients</p>
      </div>

      <Card>
        <CardBody className="text-center py-16">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Messaging Coming Soon</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Real-time messaging functionality will be available in the next update.
            Stay tuned for direct communication with your clients!
          </p>
        </CardBody>
      </Card>
    </DashboardLayout>
  )
}
