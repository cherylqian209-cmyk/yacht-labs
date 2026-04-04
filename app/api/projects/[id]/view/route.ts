import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

// id param here is the project slug (used for public pages)
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: slug } = await params
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase.rpc('increment_project_views', {
      project_slug: slug,
    })

    if (error) console.error('increment_project_views error:', error)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('view route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
