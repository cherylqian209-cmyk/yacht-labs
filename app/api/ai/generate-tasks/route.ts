import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { generateTasks } from '@/lib/ai/gemini'

export async function POST(request: NextRequest) {
  try {
    const { projectId, projectPlan } = await request.json()

    if (!projectId || !projectPlan) {
      return NextResponse.json({ error: 'projectId and projectPlan are required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rawTasks = await generateTasks(projectPlan)

    const taskRows = rawTasks.map(
      (t: {
        title: string
        description?: string
        phase?: string
        priority?: string
        estimatedHours?: number
        aiGenerated?: boolean
      }, idx: number) => ({
        project_id: projectId,
        title: t.title,
        description: t.description ?? '',
        phase: t.phase ?? 'build',
        priority: t.priority ?? 'medium',
        estimated_hours: t.estimatedHours ?? 2,
        ai_generated: t.aiGenerated ?? true,
        status: 'todo',
        order_index: idx,
      })
    )

    const { data: tasks, error } = await supabase.from('tasks').insert(taskRows).select()

    if (error) {
      return NextResponse.json({ error: 'Failed to save tasks' }, { status: 500 })
    }

    return NextResponse.json({ tasks })
  } catch (err) {
    console.error('generate-tasks error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
