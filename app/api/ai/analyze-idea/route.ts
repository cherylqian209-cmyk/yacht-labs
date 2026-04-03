import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { analyzeIdea, generateTasks } from '@/lib/ai/gemini'

export async function POST(request: NextRequest) {
  try {
    const { idea } = await request.json()

    if (!idea || typeof idea !== 'string') {
      return NextResponse.json({ error: 'idea is required' }, { status: 400 })
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

    // Run AI analysis
    const analysis = await analyzeIdea(idea)

    // Create project in DB
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: session.user.id,
        name: analysis.projectName ?? 'New Project',
        description: analysis.description ?? idea.slice(0, 200),
        idea,
        analysis,
        phase: 'think',
        status: 'planning',
      })
      .select()
      .single()

    if (projectError) {
      console.error('Project insert error:', projectError)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    // Generate and save tasks
    const rawTasks = await generateTasks(analysis)
    if (rawTasks && rawTasks.length > 0) {
      const taskRows = rawTasks.map(
        (t: {
          title: string
          description?: string
          phase?: string
          priority?: string
          estimatedHours?: number
          aiGenerated?: boolean
        }, idx: number) => ({
          project_id: project.id,
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
      await supabase.from('tasks').insert(taskRows)
    }

    return NextResponse.json({ project, analysis })
  } catch (err) {
    console.error('analyze-idea error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
