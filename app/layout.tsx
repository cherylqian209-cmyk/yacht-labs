import type { Metadata } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Yacht Labs | Build. Ship. Done.',
  description:
    'Stop pushing pixels and start onboarding users. Yacht Labs is the AI-powered workbench for your next big move.',
  keywords: ['AI', 'product', 'execution', 'SaaS', 'builder', 'launch'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#0a0a0a] text-white">
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
