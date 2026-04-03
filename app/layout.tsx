import type { Metadata } from 'next'
import { Inter, Space_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
})

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
    <html
      lang="en"
      className={`${inter.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#0a0a0a] text-white">{children}</body>
    </html>
  )
}
