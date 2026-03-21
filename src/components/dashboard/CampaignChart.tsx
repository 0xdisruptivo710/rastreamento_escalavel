'use client'

interface CampaignChartProps {
  campanhas: Array<{ campanha: string; count: number }>
}

export function CampaignChart({ campanhas }: CampaignChartProps) {
  if (campanhas.length === 0) {
    return (
      <div className="bg-[#141414] border border-[#262626] rounded-xl p-4">
        <h3 className="text-sm font-medium text-white mb-3">Leads por Campanha</h3>
        <p className="text-sm text-[#737373]">Nenhum dado disponível</p>
      </div>
    )
  }

  const maxCount = Math.max(...campanhas.map((c) => c.count))

  return (
    <div className="bg-[#141414] border border-[#262626] rounded-xl p-4">
      <h3 className="text-sm font-medium text-white mb-4">Leads por Campanha</h3>
      <div className="space-y-3">
        {campanhas.slice(0, 8).map((item) => (
          <div key={item.campanha}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#a3a3a3] truncate max-w-[70%]">{item.campanha}</span>
              <span className="text-white font-medium">{item.count}</span>
            </div>
            <div className="h-2 bg-[#262626] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3b82f6] rounded-full transition-all duration-500"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
