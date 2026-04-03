import { GoogleGenerativeAI } from '@google/generative-ai'

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null
  return new GoogleGenerativeAI(apiKey)
}

function extractJSON(text: string): string {
  // Try to extract JSON from markdown code blocks first
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) return codeBlockMatch[1].trim()
  // Otherwise try to find raw JSON
  const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
  if (jsonMatch) return jsonMatch[0]
  return text.trim()
}

export async function analyzeIdea(idea: string) {
  const client = getClient()

  if (!client) {
    // Fallback mock data when no API key
    return {
      projectName: 'New Project',
      description: idea.slice(0, 120),
      coreFeatures: [
        'User authentication & onboarding',
        'Core product functionality',
        'Basic dashboard & reporting',
        'REST API integration',
      ],
      niceToHave: [
        'Advanced analytics',
        'Team collaboration features',
        'Custom theming',
        'Mobile app',
      ],
      outOfScope: [
        'Real-time data streaming',
        'White-label options',
        'AI-powered recommendations (v2)',
      ],
      techStack: {
        frontend: 'Next.js 14, Tailwind CSS, TypeScript',
        backend: 'Next.js API Routes, Node.js',
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
  }

  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' })
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
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const json = extractJSON(text)
    return JSON.parse(json)
  } catch {
    return {
      projectName: 'New Project',
      description: idea.slice(0, 120),
      coreFeatures: ['Core functionality', 'User auth', 'Dashboard', 'API'],
      niceToHave: ['Analytics', 'Notifications', 'Mobile app'],
      outOfScope: ['Real-time streaming', 'White-label', 'AI v2'],
      techStack: {
        frontend: 'Next.js, Tailwind',
        backend: 'Next.js API Routes',
        database: 'Supabase',
        auth: 'Supabase Auth',
        hosting: 'Vercel',
        other: 'Stripe',
      },
      estimatedDays: 7,
      risks: ['Scope creep', 'API limits', 'Testing coverage'],
    }
  }
}

export async function generateTasks(projectPlan: object) {
  const client = getClient()

  const fallbackTasks = [
    {
      title: 'Project initialization & repo setup',
      description: 'Initialize repo, configure tooling, set up CI/CD pipeline',
      phase: 'setup',
      priority: 'high',
      estimatedHours: 2,
      aiGenerated: true,
    },
    {
      title: 'Database schema design',
      description: 'Design and implement database tables, relationships, and indexes',
      phase: 'setup',
      priority: 'high',
      estimatedHours: 3,
      aiGenerated: true,
    },
    {
      title: 'Authentication flow',
      description: 'Implement sign up, login, password reset, and session management',
      phase: 'build',
      priority: 'high',
      estimatedHours: 4,
      aiGenerated: true,
    },
    {
      title: 'Core UI components',
      description: 'Build reusable component library matching design system',
      phase: 'build',
      priority: 'high',
      estimatedHours: 6,
      aiGenerated: true,
    },
    {
      title: 'Main feature implementation',
      description: 'Build the primary feature set defined in the project scope',
      phase: 'build',
      priority: 'high',
      estimatedHours: 8,
      aiGenerated: true,
    },
    {
      title: 'API integration',
      description: 'Connect frontend to backend APIs and handle data fetching',
      phase: 'build',
      priority: 'medium',
      estimatedHours: 4,
      aiGenerated: true,
    },
    {
      title: 'Testing & QA',
      description: 'Write unit tests, integration tests, and perform manual QA',
      phase: 'ship',
      priority: 'medium',
      estimatedHours: 4,
      aiGenerated: true,
    },
    {
      title: 'Production deployment',
      description: 'Configure environment variables, deploy to Vercel, set up monitoring',
      phase: 'ship',
      priority: 'high',
      estimatedHours: 2,
      aiGenerated: true,
    },
  ]

  if (!client) return fallbackTasks

  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' })
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

Return ONLY the JSON array, no markdown or extra text. Generate 8-12 tasks.`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const json = extractJSON(text)
    return JSON.parse(json)
  } catch {
    return fallbackTasks
  }
}

export async function generateCode(task: string, context: string) {
  const client = getClient()

  if (!client) {
    return {
      code: `// Generated code for: ${task}\n// Context: ${context}\n\nexport function placeholder() {\n  // TODO: Implement this\n  console.log('${task}')\n}`,
      explanation: `This is a placeholder implementation for "${task}". Add your GEMINI_API_KEY environment variable to get real AI-generated code.`,
      language: 'typescript',
    }
  }

  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' })
  const prompt = `Generate code for this task: ${task}
Context: ${context}

Return a JSON object with:
{
  "code": "the actual code",
  "explanation": "brief explanation of what the code does",
  "language": "typescript|javascript|python|etc"
}

Return ONLY the JSON object.`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const json = extractJSON(text)
    return JSON.parse(json)
  } catch {
    return {
      code: `// ${task}\n// Implementation needed`,
      explanation: 'Could not generate code. Please try again.',
      language: 'typescript',
    }
  }
}

export async function analyzeMetrics(data: object) {
  const client = getClient()

  const fallbackInsights = [
    {
      type: 'success',
      title: 'Strong User Retention',
      description: 'Your 7-day retention rate is above industry average.',
      action: 'Keep doing what is working. Consider adding a referral program.',
    },
    {
      type: 'warning',
      title: 'Page Load Performance',
      description: 'Average page load is 2.4s. Users expect under 2s.',
      action: 'Optimize images and consider adding a CDN.',
    },
    {
      type: 'info',
      title: 'Mobile Traffic Growing',
      description: 'Mobile visits increased 34% this week.',
      action: 'Prioritize mobile UX improvements in the next sprint.',
    },
  ]

  if (!client) return fallbackInsights

  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' })
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
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const json = extractJSON(text)
    return JSON.parse(json)
  } catch {
    return fallbackInsights
  }
}
