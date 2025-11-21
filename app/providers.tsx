'use client'

import { HeroUIProvider } from '@heroui/react'
import { ToastProvider } from '@/lib/context/ToastContext'
import { ToastContainer } from '@/components/ui/Toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <ToastProvider>
        {children}
        <ToastContainer />
      </ToastProvider>
    </HeroUIProvider>
  )
}
