import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NotificationsPageClient from '@/components/notifications/NotificationsPageClient'
import { getUserNotifications } from '@/utils/database/notifications'

export const metadata = {
  title: 'Notifications',
  description: 'View all your notifications'
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile?.role) {
    redirect('/onboarding')
  }

  // Fetch notifications
  const notifications = await getUserNotifications(user.id, 50)

  return (
    <NotificationsPageClient
      notifications={notifications}
      userRole={profile.role}
    />
  )
}
