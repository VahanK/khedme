'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  HomeIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  PlusCircleIcon,
  FolderIcon,
  PaperAirplaneIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import NotificationBell from '@/components/notifications/NotificationBell'

interface SidebarProps {
  userRole: 'freelancer' | 'client'
  userName?: string
  userEmail?: string
  userAvatar?: string
  isOpen: boolean
  onClose: () => void
  onSignOut: () => void
  stats?: {
    activeProjects?: number
    unreadMessages?: number
    pendingProposals?: number
    earnings?: number
    profileCompletion?: number
  }
}

const freelancerMenuItems = [
  { href: '/dashboard/freelancer/profile/edit', label: 'Profile', icon: UserCircleIcon, badgeKey: null, primary: true },
  { href: '/dashboard/freelancer', label: 'Dashboard', icon: HomeIcon, badgeKey: null, primary: true },
  { href: '/dashboard/freelancer/projects', label: 'Browse Projects', icon: BriefcaseIcon, badgeKey: null, primary: false },
  { href: '/dashboard/freelancer/proposals', label: 'My Proposals', icon: DocumentTextIcon, badgeKey: 'pendingProposals', primary: false },
  { href: '/dashboard/freelancer/active', label: 'Active Projects', icon: FolderIcon, badgeKey: 'activeProjects', primary: false },
  { href: '/dashboard/freelancer/earnings', label: 'Earnings', icon: CurrencyDollarIcon, badgeKey: null, primary: false },
]

const clientMenuItems = [
  { href: '/dashboard/client/profile/edit', label: 'Profile', icon: UserCircleIcon, badgeKey: null, primary: true },
  { href: '/dashboard/client', label: 'Dashboard', icon: HomeIcon, badgeKey: null, primary: true },
  { href: '/dashboard/client/projects/new', label: 'Post Project', icon: PlusCircleIcon, badgeKey: null, primary: false },
  { href: '/dashboard/client/projects', label: 'My Projects', icon: FolderIcon, badgeKey: 'activeProjects', primary: false },
  { href: '/dashboard/client/proposals', label: 'Proposals', icon: PaperAirplaneIcon, badgeKey: 'pendingProposals', primary: false },
  { href: '/dashboard/client/active', label: 'Active Projects', icon: ChartBarIcon, badgeKey: 'activeProjects', primary: false },
]

export default function Sidebar({
  userRole,
  userName,
  userEmail,
  userAvatar,
  isOpen,
  onClose,
  onSignOut,
  stats = {}
}: SidebarProps) {
  const pathname = usePathname()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const menuItems = userRole === 'freelancer' ? freelancerMenuItems : clientMenuItems

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false)
    onSignOut()
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-200 z-50 lg:static lg:z-0 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Logo/Header */}
          <div className="p-6 border-b border-gray-100">
            <Link href="/" className="block mb-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Khedme</h1>
            </Link>

            {/* User Profile Section */}
            {(userName || userEmail) && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={userName || 'User'}
                      className="w-full h-full object-cover"
                      key={userAvatar}
                    />
                  ) : (
                    <span>{(userName || userEmail || 'U').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {userName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate capitalize">
                    {userRole}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {/* Primary Actions */}
            <div className="mb-6">
              <ul className="space-y-1">
                {menuItems.filter(item => item.primary).map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  const badgeCount = item.badgeKey && stats[item.badgeKey as keyof typeof stats]

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => onClose()}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-purple-50 text-purple-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${
                          isActive ? 'text-purple-600' : 'text-gray-400'
                        }`} />
                        <span className={`text-sm font-medium flex-1`}>
                          {item.label}
                        </span>

                        {badgeCount && badgeCount > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-purple-600 rounded-full">
                            {badgeCount > 99 ? '99+' : badgeCount}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Work Section */}
            <div>
              <p className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Work
              </p>
              <ul className="space-y-1">
                {menuItems.filter(item => !item.primary).map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  const badgeCount = item.badgeKey && stats[item.badgeKey as keyof typeof stats]

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => onClose()}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-purple-50 text-purple-700'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`w-4.5 h-4.5 ${
                          isActive ? 'text-purple-600' : 'text-gray-400'
                        }`} />
                        <span className={`text-sm font-medium flex-1`}>
                          {item.label}
                        </span>

                        {badgeCount && badgeCount > 0 && (
                          <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-purple-600 bg-purple-100 rounded-full">
                            {badgeCount > 99 ? '99+' : badgeCount}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-100 space-y-2">
            {/* Notifications */}
            <div className="flex items-center gap-3 px-3 py-2.5">
              <span className="text-sm font-medium flex-1 text-gray-700">Notifications</span>
              <NotificationBell />
            </div>

            {/* Sign Out */}
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Sign Out</h3>
                <p className="text-sm text-gray-600">Are you sure you want to sign out?</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <form action={handleConfirmLogout} className="flex-1">
                <button
                  type="submit"
                  className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
