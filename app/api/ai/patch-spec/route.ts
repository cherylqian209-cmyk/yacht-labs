import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { patchSpec, generateTasks } from '@/lib/ai/gemini'

export async function POST(request: NextRequest) {
  try {
    const { projectId, prompt } = await request.json()

    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch current project spec (server-owned read, scoped to this user)
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('id, analysis, name')
      .eq('id', projectId)
      .eq('user_id', session.user.id)
      .single()

    if (fetchError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Merge new requirements into existing spec
    const updatedAnalysis = await patchSpec(project.analysis ?? {}, prompt)

    // Regenerate tasks from the updated spec
    const rawTasks = await generateTasks(updatedAnalysis)

    // Delete stale tasks before inserting fresh ones
    await supabase.from('tasks').delete().eq('project_id', projectId)

    if (rawTasks && rawTasks.length > 0) {
      const taskRows = rawTasks.map(
        (
          t: {
            title: string
            description?: string
            phase?: string
            priority?: string
            estimatedHours?: number
          },
          idx: number
        ) => ({
          project_id: projectId,
          title: t.title,
          description: t.description ?? '',
          phase: t.phase ?? 'build',
          priority: t.priority ?? 'medium',
          estimated_hours: t.estimatedHours ?? 2,
          ai_generated: true,
          status: 'todo',
          order_index: idx,
        })
      )
      const { error: taskError } = await supabase.from('tasks').insert(taskRows)
      if (taskError) {
        console.error('Task insert error after patch:', taskError)
      }
    }

    // Update spec and reset to think phase so user reviews the new plan
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({ analysis: updatedAnalysis, phase: 'think' })
      .eq('id', projectId)
      .select()
      .single()

    if (updateError) {
      console.error('Project update error:', updateError)
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
    }

    return NextResponse.json({ project: updatedProject, analysis: updatedAnalysis })
  } catch (err) {
    console.error('patch-spec error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
