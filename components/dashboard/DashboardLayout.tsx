'use client'

interface DashboardLayoutProps {
  children: React.ReactNode
  userName: string
  userEmail?: string
  userAvatar?: string
  userRole: 'freelancer' | 'client'
  onSignOut: () => void
  stats?: {
    activeProjects?: number
    unreadMessages?: number
    pendingProposals?: number
    earnings?: number
    profileCompletion?: number
  }
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
