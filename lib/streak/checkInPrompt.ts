export function shouldShowCheckIn(lastShipDate: string | null | undefined): boolean {
  if (!lastShipDate) return true

  const last = new Date(lastShipDate)
  const today = new Date()

  last.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  return last < today
}

export function calculateStreak(
  lastShipDate: string | null | undefined,
  currentStreak: number
): number {
  if (!lastShipDate) return 1

  const last = new Date(lastShipDate)
  const today = new Date()

  last.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  const daysDiff = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))

  if (daysDiff === 0) return currentStreak       // already logged today
  if (daysDiff === 1) return currentStreak + 1   // consecutive day
  return 1                                        // streak broken, restart at 1
}
