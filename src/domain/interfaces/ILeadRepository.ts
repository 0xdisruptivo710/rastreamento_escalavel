import { Lead } from '../entities/Lead'

export interface LeadFilter {
  dataInicio?: string
  dataFim?: string
  campanha?: string
  status?: string
  busca?: string
  page?: number
  pageSize?: number
}

export interface LeadResult {
  leads: Lead[]
  total: number
}

export interface ILeadRepository {
  findByTenant(tableName: string, filter?: LeadFilter): Promise<LeadResult>
  count(tableName: string): Promise<number>
  countToday(tableName: string): Promise<number>
  countByPeriod(tableName: string, startDate: string, endDate: string): Promise<number>
  countByCampanha(tableName: string): Promise<Array<{ campanha: string; count: number }>>
  countByStatus(tableName: string): Promise<Array<{ status: string; count: number }>>
}
