import OpenAI from 'openai'

const getClient = () => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null
  return new OpenAI({ apiKey })
}

function extractJSON(text: string): string {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) return codeBlockMatch[1].trim()
  const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
  if (jsonMatch) return jsonMatch[0]
  return text.trim()
}

async function ask(prompt: string): Promise<string> {
  const client = getClient()
  if (!client) return ''
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2048,
  })
  return completion.choices[0]?.message?.content ?? ''
}

export async function analyzeIdea(idea: string) {
  const fallback = {
    projectName: 'New Project',
    description: idea.slice(0, 120),
    coreFeatures: [
      'User authentication & onboarding',
      'Core product functionality',
      'Basic dashboard & reporting',
      'REST API integration',
    ],
    niceToHave: ['Advanced analytics', 'Team collaboration', 'Custom theming', 'Mobile app'],
    outOfScope: ['Real-time streaming', 'White-label options', 'AI recommendations (v2)'],
    techStack: {
      frontend: 'Next.js 14, Tailwind CSS, TypeScript',
      backend: 'Next.js API Routes',
      database: 'Supabase (PostgreSQL)',
      auth: 'Supabase Auth',
      hosting: 'Vercel',
      other: 'Stripe for payments',
    },
    estimatedDays: 7,
    risks: [
      'Third-party API rate limits may affect performance',
      'Scope creep if feature requests are not managed',
      'Authentication edge cases need thorough testing',
    ],
  }

  const client = getClient()
  if (!client) return fallback

  const prompt = `Analyze this product idea and return a JSON object with this exact structure:
{
  "projectName": "short catchy project name",
  "description": "2 sentence description",
  "coreFeatures": ["feature1", "feature2", "feature3", "feature4"],
  "niceToHave": ["feature1", "feature2", "feature3"],
  "outOfScope": ["item1", "item2", "item3"],
  "techStack": {
    "frontend": "...",
    "backend": "...",
    "database": "...",
    "auth": "...",
    "hosting": "...",
    "other": "..."
  },
  "estimatedDays": 7,
  "risks": ["risk1", "risk2", "risk3"]
}

Product idea: ${idea}

Return ONLY the JSON object, no markdown or extra text.`

  try {
    const text = await ask(prompt)
    return JSON.parse(extractJSON(text))
  } catch {
    return fallback
  }
}

export async function generateTasks(projectPlan: object) {
  const fallback = [
    { title: 'Project initialization & repo setup', description: 'Initialize repo, configure tooling, CI/CD', phase: 'setup', priority: 'high', estimatedHours: 2, aiGenerated: true },
    { title: 'Database schema design', description: 'Design tables, relationships, and indexes', phase: 'setup', priority: 'high', estimatedHours: 3, aiGenerated: true },
    { title: 'Authentication flow', description: 'Sign up, login, password reset, session management', phase: 'build', priority: 'high', estimatedHours: 4, aiGenerated: true },
    { title: 'Core UI components', description: 'Build reusable component library', phase: 'build', priority: 'high', estimatedHours: 6, aiGenerated: true },
    { title: 'Main feature implementation', description: 'Build the primary feature set', phase: 'build', priority: 'high', estimatedHours: 8, aiGenerated: true },
    { title: 'API integration', description: 'Connect frontend to backend APIs', phase: 'build', priority: 'medium', estimatedHours: 4, aiGenerated: true },
    { title: 'Testing & QA', description: 'Unit tests, integration tests, manual QA', phase: 'ship', priority: 'medium', estimatedHours: 4, aiGenerated: true },
    { title: 'Production deployment', description: 'Configure env vars, deploy to Vercel', phase: 'ship', priority: 'high', estimatedHours: 2, aiGenerated: true },
  ]

  const client = getClient()
  if (!client) return fallback

  const prompt = `Based on this project plan, generate a task list as a JSON array:
${JSON.stringify(projectPlan, null, 2)}

Return a JSON array where each task has:
{
  "title": "short task title",
  "description": "what needs to be done",
  "phase": "setup|build|ship",
  "priority": "high|medium|low",
  "estimatedHours": number,
  "aiGenerated": true
}

Return ONLY the JSON array. Generate 8-12 tasks.`

  try {
    const text = await ask(prompt)
    return JSON.parse(extractJSON(text))
  } catch {
    return fallback
  }
}

export async function generateCode(task: string, context: string) {
  const client = getClient()
  if (!client) {
    return {
      code: `// Generated code for: ${task}\n\nexport function placeholder() {\n  // TODO: Implement\n  console.log('${task}')\n}`,
      explanation: `Placeholder for "${task}". Add OPENAI_API_KEY to enable AI code generation.`,
      language: 'typescript',
    }
  }

  const prompt = `Generate code for this task: ${task}
Context: ${context}

Return a JSON object with:
{
  "code": "the actual code",
  "explanation": "brief explanation",
  "language": "typescript|javascript|python|etc"
}

Return ONLY the JSON object.`

  try {
    const text = await ask(prompt)
    return JSON.parse(extractJSON(text))
  } catch {
    return { code: `// ${task}`, explanation: 'Could not generate code.', language: 'typescript' }
  }
}

export async function analyzeMetrics(data: object) {
  const fallback = [
    { type: 'success', title: 'Strong User Retention', description: 'Your 7-day retention rate is above industry average.', action: 'Consider adding a referral program.' },
    { type: 'warning', title: 'Page Load Performance', description: 'Average page load is 2.4s. Users expect under 2s.', action: 'Optimize images and consider adding a CDN.' },
    { type: 'info', title: 'Mobile Traffic Growing', description: 'Mobile visits increased 34% this week.', action: 'Prioritize mobile UX improvements.' },
  ]

  const client = getClient()
  if (!client) return fallback

  const prompt = `Analyze these product metrics and return insights as a JSON array:
${JSON.stringify(data, null, 2)}

Return a JSON array where each insight has:
{
  "type": "success|warning|info|error",
  "title": "short title",
  "description": "what this means",
  "action": "recommended action"
}

Return ONLY the JSON array. Generate 3-5 insights.`

  try {
    const text = await ask(prompt)
    return JSON.parse(extractJSON(text))
  } catch {
    return fallback
  }
}
