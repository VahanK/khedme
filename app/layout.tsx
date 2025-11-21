import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Khedme - Freelance Platform for the Middle East',
    template: '%s | Khedme',
  },
  description: 'Professional freelance platform connecting talented freelancers with clients across the Middle East. Find projects, submit proposals, and build your career.',
  keywords: ['freelance', 'Middle East', 'remote work', 'projects', 'freelancer', 'client', 'khedme'],
  authors: [{ name: 'Khedme' }],
  creator: 'Khedme',
  publisher: 'Khedme',
  metadataBase: new URL('https://khedme.com'),
  openGraph: {
    title: 'Khedme - Freelance Platform for the Middle East',
    description: 'Professional freelance platform connecting talented freelancers with clients across the Middle East.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Khedme',
  },
  twitter: {
    card: 'summary',
    title: 'Khedme - Freelance Platform for the Middle East',
    description: 'Professional freelance platform connecting talented freelancers with clients across the Middle East.',
  },
  icons: {
    icon: '/icon',
    apple: '/apple-icon',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
