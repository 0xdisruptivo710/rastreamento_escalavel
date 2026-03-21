'use client'

import { useEffect, useState, useCallback } from 'react'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { CampaignChart } from '@/components/dashboard/CampaignChart'
import { LeadTable } from '@/components/dashboard/LeadTable'
import { DashboardStatsDTO } from '@/application/dtos/DashboardStatsDTO'

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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStatsDTO | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const fetchLeads = useCallback(async () => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('pageSize', '50')
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })

    try {
      const res = await fetch(`/api/leads?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLeads(data.leads ?? [])
        setTotal(data.total ?? 0)
      }
    } catch (err) {
      console.error('Erro ao buscar leads:', err)
    }
  }, [page, filters])

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard/stats')
        if (res.ok) {
          setStats(await res.json())
        }
      } catch (err) {
        console.error('Erro ao buscar stats:', err)
      }
    }

    Promise.all([fetchStats(), fetchLeads()]).finally(() => setLoading(false))
  }, [fetchLeads])

  useEffect(() => {
    fetchLeads()
  }, [page, filters, fetchLeads])

  if (loading) {
    return <div className="text-[#737373] text-sm">Carregando dashboard...</div>
  }

  return (
    <div className="space-y-6">
      {stats && (
        <>
          <StatsCards
            totalLeads={stats.totalLeads}
            leadsHoje={stats.leadsHoje}
            leadsSemana={stats.leadsSemana}
            taxaAgendamento={stats.taxaAgendamento}
          />
          <CampaignChart campanhas={stats.campanhas} />
        </>
      )}

      <LeadTable
        leads={leads}
        total={total}
        page={page}
        pageSize={50}
        onPageChange={setPage}
        onFilterChange={(newFilters) => {
          setFilters(newFilters)
          setPage(1)
        }}
      />
    </div>
  )
}
