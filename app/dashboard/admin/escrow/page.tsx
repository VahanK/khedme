import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminEscrowDashboard from '@/components/admin/AdminEscrowDashboard'

export default async function AdminEscrowPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Escrow Management</h1>
        <p className="text-default-600">
          Verify payments, release funds, and monitor all escrow transactions
        </p>
      </div>

      <AdminEscrowDashboard />
    </div>
  )
}
