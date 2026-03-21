import { ITenantRepository } from '@/domain/interfaces/ITenantRepository'
import { ILeadRepository } from '@/domain/interfaces/ILeadRepository'
import { DashboardStatsDTO } from '../dtos/DashboardStatsDTO'

export class GetDashboardStats {
  constructor(
    private readonly tenantRepository: ITenantRepository,
    private readonly leadRepository: ILeadRepository
  ) {}

  async execute(userId: string): Promise<DashboardStatsDTO> {
    const tenant = await this.tenantRepository.findByUserId(userId)
    if (!tenant) {
      throw new Error('Tenant não encontrado para este usuário')
    }

    const tableName = `Rastreamento_${tenant.slug.value}`

    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const [totalLeads, leadsHoje, leadsSemana, campanhas, statusDistribuicao] =
      await Promise.all([
        this.leadRepository.count(tableName),
        this.leadRepository.countToday(tableName),
        this.leadRepository.countByPeriod(
          tableName,
          startOfWeek.toISOString(),
          now.toISOString()
        ),
        this.leadRepository.countByCampanha(tableName),
        this.leadRepository.countByStatus(tableName),
      ])

    const agendados = statusDistribuicao.find(
      (s) => s.status.toLowerCase().includes('agendado')
    )
    const taxaAgendamento = totalLeads > 0
      ? Math.round(((agendados?.count ?? 0) / totalLeads) * 100)
      : 0

    return {
      totalLeads,
      leadsHoje,
      leadsSemana,
      taxaAgendamento,
      campanhas,
      statusDistribuicao,
    }
  }
}
