export interface DashboardStatsDTO {
  totalLeads: number
  leadsHoje: number
  leadsSemana: number
  taxaAgendamento: number
  campanhas: Array<{ campanha: string; count: number }>
  statusDistribuicao: Array<{ status: string; count: number }>
}
