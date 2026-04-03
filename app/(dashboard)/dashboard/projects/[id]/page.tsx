import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: project } = await supabase
    .from('projects')
    .select('phase')
    .eq('id', id)
    .single()

  const phase = project?.phase ?? 'think'
  redirect(`/dashboard/projects/${id}/${phase}`)
}
