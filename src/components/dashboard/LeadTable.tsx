'use client'

import { useState } from 'react'

interface Lead {
  id?: number
  createdAt: string
  nome?: string
  numero?: string
  campanha?: string
  conjunto?: string
  anuncio?: string
  status: string
  tracking?: string
}

interface LeadTableProps {
  leads: Lead[]
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onFilterChange: (filters: Record<string, string>) => void
}

export function LeadTable({ leads, total, page, pageSize, onPageChange, onFilterChange }: LeadTableProps) {
  const [busca, setBusca] = useState('')
  const totalPages = Math.ceil(total / pageSize)

  function handleSearch() {
    onFilterChange({ busca })
  }

  return (
    <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[#262626] flex items-center gap-3">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Buscar por nome ou telefone..."
          className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white text-sm placeholder-[#525252] focus:outline-none focus:border-[#3b82f6] transition-colors"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-[#262626] hover:bg-[#333333] text-white text-sm rounded-lg transition-colors"
        >
          Buscar
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#262626]">
              <th className="text-left px-4 py-3 text-xs text-[#737373] font-medium uppercase tracking-wider">Data</th>
              <th className="text-left px-4 py-3 text-xs text-[#737373] font-medium uppercase tracking-wider">Nome</th>
              <th className="text-left px-4 py-3 text-xs text-[#737373] font-medium uppercase tracking-wider">Telefone</th>
              <th className="text-left px-4 py-3 text-xs text-[#737373] font-medium uppercase tracking-wider">Campanha</th>
              <th className="text-left px-4 py-3 text-xs text-[#737373] font-medium uppercase tracking-wider">Conjunto</th>
              <th className="text-left px-4 py-3 text-xs text-[#737373] font-medium uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs text-[#737373] font-medium uppercase tracking-wider">Tracking</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-[#737373]">
                  Nenhum lead encontrado
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-b border-[#262626] last:border-0 hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-4 py-3 text-sm text-[#737373]">
                    {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{lead.nome ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-[#a3a3a3] font-mono">{lead.numero ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-[#a3a3a3]">{lead.campanha ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-[#a3a3a3]">{lead.conjunto ?? '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={lead.status?.toLowerCase().includes('agendado') ? 'text-[#22c55e]' : 'text-[#a3a3a3]'}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {lead.tracking === 'Feito' ? (
                      <span className="text-[#22c55e]">Feito</span>
                    ) : (
                      <span className="text-[#737373]">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-[#262626] flex items-center justify-between">
          <p className="text-xs text-[#737373]">
            {total} leads no total
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1 text-sm text-[#a3a3a3] bg-[#262626] rounded disabled:opacity-30 hover:bg-[#333333] transition-colors"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm text-[#737373]">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1 text-sm text-[#a3a3a3] bg-[#262626] rounded disabled:opacity-30 hover:bg-[#333333] transition-colors"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
