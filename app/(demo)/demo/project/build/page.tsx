'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Clock, Zap, Code, TrendingUp, X, ChevronRight, Sparkles } from 'lucide-react'
import PhaseNav from '@/components/demo/PhaseNav'
import { demoProject, demoCodeExamples } from '@/lib/demo/demoData'

type Task = (typeof demoProject.build_phase.tasks)[number]

function CodeModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const code = demoCodeExamples[task.code_key as string] ??
    `// AI-generated code for: ${task.title}\n\n// Custom implementation based on your\n// project requirements and tech stack...`

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111111] border border-[#222222] rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[#222222]">
          <div>
            <p
              className="text-xs text-[#8b5cf6] uppercase tracking-widest mb-0.5"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              AI-GENERATED CODE
            </p>
            <h3 className="text-sm font-semibold text-white">{task.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#1a1a1a] rounded-lg transition-colors"
          >
            <X size={16} className="text-[#888888]" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <pre className="bg-[#0a0a0a] border border-[#1a1a1a] text-[#22c55e] p-4 rounded-lg overflow-x-auto text-xs leading-relaxed">
            <code>{code}</code>
          </pre>

          <div className="mt-4 p-4 bg-[#8b5cf611] border border-[#8b5cf633] rounded-lg">
            <div className="flex items-start gap-2">
              <Sparkles size={14} className="text-[#8b5cf6] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#8b5cf6] leading-relaxed">
                <strong>This is example code.</strong> In your real project, AI generates custom
                implementation based on your specific requirements, tech stack, and existing codebase.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-[#222222]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-[#888888] hover:text-white uppercase tracking-wider transition-colors"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            Close
          </button>
          <Link
            href="/signup"
            className="flex items-center gap-2 bg-white text-black font-bold text-xs uppercase tracking-widest py-2.5 px-5 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            Generate Code For My Project →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function DemoBuildPage() {
  const [codeTask, setCodeTask] = useState<Task | null>(null)
  const { build_phase, stats } = demoProject
  const tasks = build_phase.tasks
  const doneTasks = tasks.filter((t) => t.status === 'complete').length
  const progress = Math.round(build_phase.progress * 100)
  const totalHours = tasks.reduce((sum, t) => sum + t.estimated_hours, 0)
  const aiTasks = tasks.filter((t) => t.ai_generated).length

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto space-y-8">
      {codeTask && <CodeModal task={codeTask} onClose={() => setCodeTask(null)} />}

      {/* Header */}
      <div>
        <p
          className="text-xs text-[#555555] uppercase tracking-widest mb-2"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          PHASE 02 · DEMO
        </p>
        <h1
          className="text-3xl font-bold text-white uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          BUILD PHASE
        </h1>
        <p className="text-[#888888] text-sm mt-1">TaskFlow · {progress}% complete</p>
      </div>

      {/* Phase Nav */}
      <PhaseNav />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Clock, label: 'TOTAL HOURS', value: `${totalHours}h`, color: '#f59e0b' },
          { icon: Sparkles, label: 'AI ASSISTS', value: String(aiTasks), color: '#8b5cf6' },
          { icon: Code, label: 'TASKS TOTAL', value: String(tasks.length), color: '#3b82f6' },
          { icon: TrendingUp, label: 'COMPLETE', value: `${progress}%`, color: '#22c55e' },
        ].map((s) => (
          <div key={s.label} className="bg-[#111111] border border-[#222222] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={14} style={{ color: s.color }} />
              <span
                className="text-xs text-[#555555] uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                {s.label}
              </span>
            </div>
            <p
              className="text-2xl font-bold text-white"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Task List */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-sm font-bold text-white uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            TASKS ({doneTasks}/{tasks.length})
          </h2>
          <span className="text-xs text-[#888888]">{progress}% complete</span>
        </div>

        <div className="h-1.5 bg-[#1a1a1a] rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-[#3b82f6] rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 ${
                task.status === 'complete' ? 'bg-[#22c55e08]' : 'bg-[#0a0a0a]'
              }`}
            >
              {/* Status indicator (read-only) */}
              <div
                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                  task.status === 'complete'
                    ? 'bg-[#22c55e] border-[#22c55e]'
                    : task.status === 'in_progress'
                    ? 'border-[#3b82f6] bg-[#3b82f622]'
                    : 'border-[#333333]'
                }`}
                title="Sign up to interact with tasks"
              >
                {task.status === 'complete' && <Check size={11} className="text-white" />}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm ${
                    task.status === 'complete' ? 'text-[#555555] line-through' : 'text-white'
                  }`}
                >
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-xs text-[#555555] mt-0.5 truncate">{task.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {task.status === 'in_progress' && (
                  <span
                    className="text-xs text-[#3b82f6] font-bold uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                  >
                    Active
                  </span>
                )}
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    backgroundColor:
                      task.priority === 'high'
                        ? '#ef444422'
                        : task.priority === 'medium'
                        ? '#f59e0b22'
                        : '#55555522',
                    color:
                      task.priority === 'high'
                        ? '#ef4444'
                        : task.priority === 'medium'
                        ? '#f59e0b'
                        : '#888888',
                    fontFamily: 'var(--font-space-mono), monospace',
                  }}
                >
                  {task.priority}
                </span>
                <span className="text-xs text-[#555555]">{task.estimated_hours}h</span>
                {task.code_generated && (
                  <button
                    onClick={() => setCodeTask(task)}
                    className="flex items-center gap-1 text-xs text-[#8b5cf6] hover:text-[#a78bfa] transition-colors"
                    title="View AI-generated code"
                  >
                    <Zap size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-[#555555] mt-4 text-center">
          Click <Zap size={10} className="inline text-[#8b5cf6]" /> to preview AI-generated code for each task
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111111] border border-[#8b5cf644] rounded-xl p-6">
        <div>
          <p
            className="text-sm font-bold text-white uppercase tracking-widest mb-1"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            AI writes your code, you ship faster
          </p>
          <p className="text-xs text-[#888888]">
            Each task generates production-ready code tailored to your stack.
          </p>
        </div>
        <Link
          href="/signup"
          className="flex items-center gap-2 bg-white text-black font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          Start Building Free
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  )
}
