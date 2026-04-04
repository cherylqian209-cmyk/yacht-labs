import { Clock, Zap, Check } from 'lucide-react'

interface Task {
  id: string
  title: string
  description?: string
  ai_generated?: boolean
  actual_hours?: number
  completed_at?: string
}

export default function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-200 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <Check size={11} className="text-green-600" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-1">
                <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 flex-shrink-0">
                  {task.ai_generated && (
                    <span className="flex items-center gap-1 text-purple-600">
                      <Zap size={11} /> AI
                    </span>
                  )}
                  {task.actual_hours != null && (
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {task.actual_hours}h
                    </span>
                  )}
                </div>
              </div>

              {task.description && (
                <p className="text-xs text-gray-500 leading-relaxed">{task.description}</p>
              )}

              {task.completed_at && (
                <p className="text-xs text-gray-400 mt-1.5">
                  Completed{' '}
                  {new Date(task.completed_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
