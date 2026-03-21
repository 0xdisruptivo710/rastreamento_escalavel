import { ITenantRepository } from '@/domain/interfaces/ITenantRepository'
import { ILeadRepository, LeadFilter, LeadResult } from '@/domain/interfaces/ILeadRepository'

export class GetLeadsByTenant {
  constructor(
    private readonly tenantRepository: ITenantRepository,
    private readonly leadRepository: ILeadRepository
  ) {}

  async execute(userId: string, filter?: LeadFilter): Promise<LeadResult> {
    const tenant = await this.tenantRepository.findByUserId(userId)
    if (!tenant) {
      throw new Error('Tenant não encontrado para este usuário')
    }

    const tableName = `Rastreamento_${tenant.slug.value}`
    return this.leadRepository.findByTenant(tableName, filter)
  }
}
