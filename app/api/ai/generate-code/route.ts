import { NextRequest, NextResponse } from 'next/server'
import { generateCode } from '@/lib/ai/gemini'

export async function POST(request: NextRequest) {
  try {
    const { task, context } = await request.json()

    if (!task || typeof task !== 'string') {
      return NextResponse.json({ error: 'task is required' }, { status: 400 })
    }

    const result = await generateCode(task, context ?? '')
    return NextResponse.json(result)
  } catch (err) {
    console.error('generate-code error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
