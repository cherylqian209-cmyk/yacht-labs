const phases = [
  { id: 'think', name: 'Think', icon: '🧠' },
  { id: 'build', name: 'Build', icon: '🔨' },
  { id: 'ship',  name: 'Ship',  icon: '🚀' },
  { id: 'listen', name: 'Listen', icon: '👂' },
  { id: 'repeat', name: 'Repeat', icon: '🔄' },
]

export default function PhaseTimeline({ project }: { project: { phase: string } }) {
  const currentPhaseIndex = phases.findIndex((p) => p.id === project.phase)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-start justify-between overflow-x-auto pb-1">
        {phases.map((phase, index) => {
          const isComplete = index < currentPhaseIndex
          const isCurrent = index === currentPhaseIndex
          const isPending = index > currentPhaseIndex

          return (
            <div key={phase.id} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 transition-all ${
                    isComplete
                      ? 'bg-green-100 ring-2 ring-green-500'
                      : isCurrent
                      ? 'bg-purple-100 ring-2 ring-purple-500 scale-110'
                      : 'bg-gray-100'
                  }`}
                >
                  {phase.icon}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isCurrent ? 'text-purple-600' : isComplete ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {phase.name}
                </span>
                {isComplete && <span className="text-[10px] text-green-600 mt-0.5">✓ Done</span>}
                {isCurrent && <span className="text-[10px] text-purple-600 mt-0.5">Active</span>}
                {isPending && <span className="text-[10px] text-gray-400 mt-0.5">Upcoming</span>}
              </div>

              {index < phases.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    index < currentPhaseIndex ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
