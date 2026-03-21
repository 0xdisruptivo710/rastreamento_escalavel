import { Tenant, TenantStatus } from '../entities/Tenant'

export interface TenantUpdateData {
  userId?: string
  n8nWorkflowLeadId?: string
  n8nWorkflowTagId?: string
  webhookUrlLead?: string
  webhookUrlTag?: string
  status?: TenantStatus
  onboardingError?: string | null
  onboardingCompletedAt?: Date
}

export interface ITenantRepository {
  create(tenant: Tenant): Promise<Tenant>
  findBySlug(slug: string): Promise<Tenant | null>
  findByUserId(userId: string): Promise<Tenant | null>
  findById(id: string): Promise<Tenant | null>
  update(id: string, data: TenantUpdateData): Promise<void>
  list(): Promise<Tenant[]>
  delete(id: string): Promise<void>
}
