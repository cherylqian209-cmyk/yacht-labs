import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { generateSlug, ensureUniqueSlug } from '@/lib/utils/slugify'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { is_public, custom_slug } = await request.json()

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, user_id, slug')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    let slug: string | null = project.slug

    if (is_public) {
      const base = custom_slug ? generateSlug(custom_slug) : (project.slug ?? generateSlug(project.name))
      slug = await ensureUniqueSlug(supabase, base, id)
    }

    const { data, error } = await supabase
      .from('projects')
      .update({ is_public, slug })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, project: data })
  } catch (err) {
    console.error('visibility route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
