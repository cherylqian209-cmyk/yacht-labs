import Link from 'next/link'
import { Layers, Zap, Headphones, RefreshCw, FileText } from 'lucide-react'
import StripePricing from '@/components/StripePricing'

const tools = [
  {
    icon: Layers,
    title: 'SAAS LANDING PAGE GENERATOR',
    description:
      'Generate a high-conversion landing page brief and structure for your next SaaS idea in seconds.',
    href: '/dashboard/projects/new',
    color: '#8b5cf6',
  },
  {
    icon: Zap,
    title: 'PROJECT SCAFFOLDER',
    description:
      'Instantly generate a project roadmap, tech stack recommendation, and initial task list.',
    href: '/dashboard/projects/new',
    color: '#14b8a6',
  },
]

const features = [
  {
    icon: Headphones,
    title: 'LISTEN',
    description: 'Track real user feedback and metrics after you ship.',
    color: '#3b82f6',
  },
  {
    icon: RefreshCw,
    title: 'REPEAT',
    description: 'AI-prioritized iteration cycles based on real data.',
    color: '#f59e0b',
  },
  {
    icon: FileText,
    title: 'DOCUMENTATION',
    description: 'Auto-generate docs, changelogs, and READMEs.',
    color: '#22c55e',
  },
]

const pricingTiers = [
  {
    name: 'FREE TIER',
    price: '$0',
    period: '',
    features: [
      '1 active project',
      '10 AI analysis runs / month',
      'Basic task generation',
      'Community support',
    ],
    cta: 'GET STARTED FREE',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'PRO LAB',
    price: '$99',
    period: '/month',
    features: [
      'Unlimited projects',
      'Unlimited AI runs',
      'Code generation',
      'Priority support',
      'Custom templates',
      'Team collaboration',
    ],
    cta: 'START PRO LAB',
    href: '/signup',
    highlight: true,
  },
]

export default function DashboardPage() {
  return (
    <div className="px-6 py-10 max-w-6xl mx-auto space-y-16">
      {/* Hero section */}
      <section>
        <p
          className="text-xs text-[#555555] uppercase tracking-widest mb-2"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          FREE SAMPLES
        </p>
        <h1
          className="text-3xl sm:text-4xl font-bold text-white uppercase tracking-widest mb-8"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          SYNTHESIS LEAD MAGNETS
        </h1>

        {/* Tool cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <div
              key={tool.title}
              className="bg-[#111111] border border-[#222222] rounded-xl p-6 flex flex-col gap-4 hover:border-[#2a2a2a] transition-colors"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${tool.color}22` }}
              >
                <tool.icon size={20} style={{ color: tool.color }} />
              </div>
              <div className="flex-1">
                <h2
                  className="text-sm font-bold text-white uppercase tracking-wider mb-2"
                  style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                >
                  {tool.title}
                </h2>
                <p className="text-[#888888] text-sm leading-relaxed">{tool.description}</p>
              </div>
              <Link
                href={tool.href}
                className="text-xs font-bold uppercase tracking-widest transition-colors"
                style={{
                  fontFamily: 'var(--font-space-mono), monospace',
                  color: tool.color,
                }}
              >
                ACCESS TOOL →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section>
        <p
          className="text-xs text-[#555555] uppercase tracking-widest mb-2"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          WHAT&apos;S INCLUDED
        </p>
        <h2
          className="text-2xl font-bold text-white uppercase tracking-widest mb-8"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          FULL EXECUTION LOOP
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-[#111111] border border-[#222222] rounded-xl p-6"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `${feature.color}22` }}
              >
                <feature.icon size={18} style={{ color: feature.color }} />
              </div>
              <h3
                className="text-sm font-bold text-white uppercase tracking-wider mb-2"
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                {feature.title}
              </h3>
              <p className="text-[#888888] text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Projects shortcut */}
      <section className="bg-[#111111] border border-[#222222] rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2
            className="text-sm font-bold text-white uppercase tracking-widest mb-1"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            MY PROJECTS
          </h2>
          <p className="text-[#888888] text-sm">View and manage all your projects.</p>
        </div>
        <Link
          href="/dashboard/projects"
          className="flex-shrink-0 bg-[#1a1a1a] text-white text-xs font-bold uppercase tracking-widest py-2 px-4 rounded-lg border border-[#333333] hover:bg-[#222222] transition-colors"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          VIEW ALL →
        </Link>
      </section>

      {/* Pricing */}
      <section>
        <p
          className="text-xs text-[#555555] uppercase tracking-widest mb-2"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          THE LAB ACCESS
        </p>
        <h2
          className="text-2xl font-bold text-white uppercase tracking-widest mb-8"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          CHOOSE YOUR VELOCITY
        </h2>
        <StripePricing />
      </section>

      {/* Footer */}
      <footer className="border-t border-[#222222] pt-8 pb-4">
        <p
          className="text-[#555555] text-xs tracking-wider uppercase text-center"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          Think · Build · Ship · Listen · Repeat
        </p>
      </footer>
    </div>
  )
}
