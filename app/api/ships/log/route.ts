import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { calculateStreak } from '@/lib/streak/checkInPrompt'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, description } = await request.json()

    if (!projectId || !description?.trim()) {
      return NextResponse.json({ error: 'projectId and description are required' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]

    // Prevent duplicate check-ins on the same day
    const { data: existing } = await supabase
      .from('daily_ships')
      .select('id')
      .eq('project_id', projectId)
      .eq('ship_date', today)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already logged today' }, { status: 409 })
    }

    // Insert ship log
    const { error: shipError } = await supabase.from('daily_ships').insert({
      user_id: user.id,
      project_id: projectId,
      ship_description: description.trim(),
      ship_date: today,
    })

    if (shipError) {
      return NextResponse.json({ error: shipError.message }, { status: 500 })
    }

    // Fetch project to compute new streak
    const { data: project } = await supabase
      .from('projects')
      .select('last_ship_date, current_streak, longest_streak')
      .eq('id', projectId)
      .single()

    const newStreak = calculateStreak(project?.last_ship_date, project?.current_streak ?? 0)
    const newLongest = Math.max(newStreak, project?.longest_streak ?? 0)

    await supabase
      .from('projects')
      .update({
        last_ship_date: today,
        current_streak: newStreak,
        longest_streak: newLongest,
      })
      .eq('id', projectId)

    return NextResponse.json({ success: true, streak: newStreak, longestStreak: newLongest })
  } catch (err) {
    console.error('ships/log error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
