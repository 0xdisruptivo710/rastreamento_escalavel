import { ITenantRepository } from '@/domain/interfaces/ITenantRepository'
import { TenantProps } from '@/domain/entities/Tenant'

export class GetTenantByUserId {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async execute(userId: string): Promise<TenantProps | null> {
    const tenant = await this.tenantRepository.findByUserId(userId)
    return tenant ? tenant.toJSON() : null
  }
}
