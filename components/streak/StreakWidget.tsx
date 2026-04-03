interface Props {
  currentStreak: number
  longestStreak: number
}

export default function StreakWidget({ currentStreak, longestStreak }: Props) {
  const message =
    currentStreak >= 30 ? '🏆 Legendary. Keep going.'
    : currentStreak >= 14 ? '⭐ Elite consistency.'
    : currentStreak >= 7  ? '💪 Great momentum!'
    : currentStreak >= 3  ? '🔥 Building the habit.'
    : 'Ship something today to start your streak.'

  return (
    <div className="bg-[#111111] border border-[#f59e0b33] rounded-xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl select-none">🔥</span>
          <div>
            <p
              className="text-2xl font-bold text-white"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              {currentStreak}
              <span className="text-sm font-normal text-[#888888] ml-1">
                {currentStreak === 1 ? 'day' : 'days'}
              </span>
            </p>
            <p
              className="text-xs text-[#f59e0b] uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              SHIPPING STREAK
            </p>
          </div>
        </div>

        {longestStreak > 0 && (
          <div className="text-right">
            <p
              className="text-lg font-bold text-[#555555]"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              {longestStreak}
            </p>
            <p
              className="text-xs text-[#444444] uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              BEST
            </p>
          </div>
        )}
      </div>

      {currentStreak > 0 && (
        <p className="text-xs text-[#888888] mt-3 border-t border-[#1a1a1a] pt-3">{message}</p>
      )}
    </div>
  )
}
