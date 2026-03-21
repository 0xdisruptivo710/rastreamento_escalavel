import { ITenantRepository } from '@/domain/interfaces/ITenantRepository'
import { TenantProps } from '@/domain/entities/Tenant'

export class ListTenants {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async execute(): Promise<TenantProps[]> {
    const tenants = await this.tenantRepository.list()
    return tenants.map((t) => t.toJSON())
  }
}
