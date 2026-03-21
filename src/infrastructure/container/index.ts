import { SupabaseTenantRepository } from '../database/repositories/SupabaseTenantRepository'
import { SupabaseLeadRepository } from '../database/repositories/SupabaseLeadRepository'
import { SupabaseConfigRepository } from '../database/repositories/SupabaseConfigRepository'
import { SupabaseDatabaseAdmin } from '../database/SupabaseDatabaseAdmin'
import { SupabaseAuthService } from '../auth/SupabaseAuthService'
import { N8NApiClient } from '../n8n/N8NApiClient'
import { WorkflowGenerator } from '../n8n/WorkflowGenerator'
import { CreateOnboarding } from '@/application/use-cases/CreateOnboarding'
import { ListTenants } from '@/application/use-cases/ListTenants'
import { GetTenantByUserId } from '@/application/use-cases/GetTenantByUserId'
import { GetLeadsByTenant } from '@/application/use-cases/GetLeadsByTenant'
import { GetDashboardStats } from '@/application/use-cases/GetDashboardStats'

export const container = {
  getCreateOnboardingUseCase(): CreateOnboarding {
    return new CreateOnboarding(
      new SupabaseAuthService(),
      new SupabaseTenantRepository(),
      new SupabaseDatabaseAdmin(),
      new N8NApiClient(),
      new WorkflowGenerator()
    )
  },

  getListTenantsUseCase(): ListTenants {
    return new ListTenants(new SupabaseTenantRepository())
  },

  getGetTenantByUserIdUseCase(): GetTenantByUserId {
    return new GetTenantByUserId(new SupabaseTenantRepository())
  },

  getGetLeadsByTenantUseCase(): GetLeadsByTenant {
    return new GetLeadsByTenant(
      new SupabaseTenantRepository(),
      new SupabaseLeadRepository()
    )
  },

  getGetDashboardStatsUseCase(): GetDashboardStats {
    return new GetDashboardStats(
      new SupabaseTenantRepository(),
      new SupabaseLeadRepository()
    )
  },

  getAuthService(): SupabaseAuthService {
    return new SupabaseAuthService()
  },

  getConfigRepository(): SupabaseConfigRepository {
    return new SupabaseConfigRepository()
  },
}
