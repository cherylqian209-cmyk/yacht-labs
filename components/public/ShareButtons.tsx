'use client'

import { useState } from 'react'
import { Link2, Check } from 'lucide-react'

interface Props {
  project: { name: string; slug: string }
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

export default function ShareButtons({ project }: Props) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/p/${project.slug}`
    : `/p/${project.slug}`

  const trackShare = (platform: string) => {
    fetch(`/api/projects/${project.slug}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform }),
    })
  }

  const shareToX = () => {
    trackShare('twitter')
    const text = `Just shipped ${project.name} using @yachtlabs! Check out the execution timeline:`
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank',
      'width=550,height=420'
    )
  }

  const shareToLinkedIn = () => {
    trackShare('linkedin')
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank',
      'width=550,height=420'
    )
  }

  const copyLink = async () => {
    trackShare('copy')
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const btnClass =
    'flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors text-sm font-medium'

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm text-purple-200">Share:</span>

      <button onClick={shareToX} className={btnClass}>
        <XIcon /> X / Twitter
      </button>

      <button onClick={shareToLinkedIn} className={btnClass}>
        <LinkedInIcon /> LinkedIn
      </button>

      <button onClick={copyLink} className={btnClass}>
        {copied ? <><Check size={14} /> Copied!</> : <><Link2 size={14} /> Copy Link</>}
      </button>
    </div>
  )
}
