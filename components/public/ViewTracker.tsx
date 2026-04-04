'use client'

import { useEffect } from 'react'

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      fetch(`/api/projects/${slug}/view`, { method: 'POST' })
    }, 3000)
    return () => clearTimeout(timer)
  }, [slug])

  return null
}
