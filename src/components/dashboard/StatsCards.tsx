'use client'

interface StatsCardsProps {
  totalLeads: number
  leadsHoje: number
  leadsSemana: number
  taxaAgendamento: number
}

export function StatsCards({ totalLeads, leadsHoje, leadsSemana, taxaAgendamento }: StatsCardsProps) {
  const cards = [
    { label: 'Total de Leads', value: totalLeads.toLocaleString('pt-BR'), color: 'text-white' },
    { label: 'Leads Hoje', value: leadsHoje.toLocaleString('pt-BR'), color: 'text-[#3b82f6]' },
    { label: 'Leads na Semana', value: leadsSemana.toLocaleString('pt-BR'), color: 'text-[#06b6d4]' },
    { label: 'Taxa de Agendamento', value: `${taxaAgendamento}%`, color: 'text-[#22c55e]' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-[#141414] border border-[#262626] rounded-xl p-4"
        >
          <p className="text-xs text-[#737373] uppercase tracking-wider">{card.label}</p>
          <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  )
}
