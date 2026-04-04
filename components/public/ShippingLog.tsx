interface Ship {
  id: string
  ship_description: string
  ship_date: string
}

export default function ShippingLog({ ships }: { ships: Ship[] }) {
  return (
    <div className="space-y-3">
      {ships.map((ship) => (
        <div key={ship.id} className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">📦</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1">
                {new Date(ship.ship_date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <p className="text-sm text-gray-900 leading-relaxed">{ship.ship_description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
