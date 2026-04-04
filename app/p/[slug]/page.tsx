import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import PublicProjectView from '@/components/public/PublicProjectView'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data } = await supabase
    .from('projects')
    .select('name, description')
    .eq('slug', slug)
    .eq('is_public', true)
    .single()

  if (!data) return { title: 'Project Not Found' }

  const title = `${data.name} — Built with Yacht Labs`
  const description =
    data.description ?? `${data.name} — shipped using the Yacht Labs framework`
  const ogImage = `/api/og?title=${encodeURIComponent(data.name)}`

  return {
    title,
    description,
    openGraph: { title, description, images: [ogImage] },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  }
}

export default async function PublicProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: project, error } = await supabase
    .from('projects')
    .select('*, tasks(*), daily_ships(*)')
    .eq('slug', slug)
    .eq('is_public', true)
    .single()

  if (error || !project) notFound()

  // Sort tasks by order_index, ships newest-first
  project.tasks?.sort(
    (a: { order_index?: number }, b: { order_index?: number }) =>
      (a.order_index ?? 0) - (b.order_index ?? 0)
  )
  project.daily_ships?.sort(
    (a: { ship_date: string }, b: { ship_date: string }) =>
      new Date(b.ship_date).getTime() - new Date(a.ship_date).getTime()
  )

  return <PublicProjectView project={project} />
}
