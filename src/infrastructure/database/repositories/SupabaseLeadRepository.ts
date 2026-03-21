import { Lead } from '@/domain/entities/Lead'
import { ILeadRepository, LeadFilter, LeadResult } from '@/domain/interfaces/ILeadRepository'
import { createAdminClient } from '../supabase/admin'

export class SupabaseLeadRepository implements ILeadRepository {
  private getClient() {
    return createAdminClient()
  }

  async findByTenant(tableName: string, filter?: LeadFilter): Promise<LeadResult> {
    const supabase = this.getClient()
    const page = filter?.page ?? 1
    const pageSize = filter?.pageSize ?? 50
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase.from(tableName).select('*', { count: 'exact' })

    if (filter?.campanha) {
      query = query.eq('Campanha', filter.campanha)
    }
    if (filter?.status) {
      query = query.eq('status', filter.status)
    }
    if (filter?.dataInicio) {
      query = query.gte('created_at', filter.dataInicio)
    }
    if (filter?.dataFim) {
      query = query.lte('created_at', filter.dataFim)
    }
    if (filter?.busca) {
      query = query.or(`Nome.ilike.%${filter.busca}%,Número.ilike.%${filter.busca}%`)
    }

    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data, count, error } = await query

    if (error) {
      throw new Error(`Falha ao buscar leads: ${error.message}`)
    }

    const leads = (data ?? []).map((row) => this.mapToEntity(row))
    return { leads, total: count ?? 0 }
  }

  async count(tableName: string): Promise<number> {
    const supabase = this.getClient()
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })

    if (error) {
      throw new Error(`Falha ao contar leads: ${error.message}`)
    }

    return count ?? 0
  }

  async countToday(tableName: string): Promise<number> {
    const supabase = this.getClient()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())

    if (error) {
      throw new Error(`Falha ao contar leads de hoje: ${error.message}`)
    }

    return count ?? 0
  }

  async countByPeriod(tableName: string, startDate: string, endDate: string): Promise<number> {
    const supabase = this.getClient()
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    if (error) {
      throw new Error(`Falha ao contar leads por período: ${error.message}`)
    }

    return count ?? 0
  }

  async countByCampanha(tableName: string): Promise<Array<{ campanha: string; count: number }>> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from(tableName)
      .select('Campanha')

    if (error) {
      throw new Error(`Falha ao agrupar leads por campanha: ${error.message}`)
    }

    const counts = new Map<string, number>()
    for (const row of data ?? []) {
      const campanha = (row as Record<string, string>).Campanha ?? 'Sem campanha'
      counts.set(campanha, (counts.get(campanha) ?? 0) + 1)
    }

    return Array.from(counts.entries())
      .map(([campanha, count]) => ({ campanha, count }))
      .sort((a, b) => b.count - a.count)
  }

  async countByStatus(tableName: string): Promise<Array<{ status: string; count: number }>> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from(tableName)
      .select('status')

    if (error) {
      throw new Error(`Falha ao agrupar leads por status: ${error.message}`)
    }

    const counts = new Map<string, number>()
    for (const row of data ?? []) {
      const status = (row as Record<string, string>).status ?? 'Sem status'
      counts.set(status, (counts.get(status) ?? 0) + 1)
    }

    return Array.from(counts.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToEntity(row: any): Lead {
    return new Lead({
      id: row.id,
      createdAt: new Date(row.created_at),
      nome: row.Nome,
      numero: row['Número'],
      email: row['E-mail'],
      cidade: row.Cidade,
      campanha: row.Campanha,
      conjunto: row.Conjunto,
      anuncio: row['Anúncio'],
      sourceId: row.source_id,
      ctaClid: row.cta_clid,
      thumbnail: row.thumbnail,
      cta: row.cta,
      url: row.url,
      sourceUrl: row.source_url,
      mensagem: row.mensagem,
      status: row.status,
      dataCriacao: row.data_criacao,
      tracking: row.Tracking,
    })
  }
}
