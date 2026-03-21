import { OnboardingInputDTO } from '../dtos/OnboardingInputDTO'
import { OnboardingOutputDTO } from '../dtos/OnboardingOutputDTO'
import { Slug } from '@/domain/value-objects/Slug'
import { Email } from '@/domain/value-objects/Email'
import { Tenant } from '@/domain/entities/Tenant'
import { ITenantRepository } from '@/domain/interfaces/ITenantRepository'
import { IAuthService } from '@/domain/interfaces/IAuthService'
import { IDatabaseAdmin } from '@/domain/interfaces/IDatabaseAdmin'
import { IN8NClient } from '@/domain/interfaces/IN8NClient'
import { IWorkflowGenerator } from '@/domain/interfaces/IWorkflowGenerator'
import { TenantAlreadyExistsError } from '@/domain/errors/TenantAlreadyExistsError'
import { OnboardingError } from '@/domain/errors/OnboardingError'

export class CreateOnboarding {
  constructor(
    private readonly authService: IAuthService,
    private readonly tenantRepository: ITenantRepository,
    private readonly databaseAdmin: IDatabaseAdmin,
    private readonly n8nClient: IN8NClient,
    private readonly workflowGenerator: IWorkflowGenerator
  ) {}

  async execute(input: OnboardingInputDTO): Promise<OnboardingOutputDTO> {
    const slug = new Slug(input.slug)
    const email = new Email(input.email)

    const existingTenant = await this.tenantRepository.findBySlug(slug.value)
    if (existingTenant) {
      throw new TenantAlreadyExistsError(slug.value)
    }

    const tenant = Tenant.create(input.nomeEmpresa, slug, email)
    const savedTenant = await this.tenantRepository.create(tenant)
    const tenantId = savedTenant.id!

    await this.tenantRepository.update(tenantId, { status: 'provisioning' })

    let userId: string | undefined
    let workflow1Id: string | undefined
    let workflow2Id: string | undefined

    try {
      // STEP 1: Criar usuário via Supabase Auth
      const user = await this.authService.inviteUser(email.value, {
        nomeEmpresa: input.nomeEmpresa,
        slug: slug.value,
        userRole: 'client',
      })
      userId = user.id
      const tempPassword = (user as unknown as { tempPassword: string }).tempPassword
      await this.tenantRepository.update(tenantId, { userId: user.id })

      // STEP 2: Criar tabela de rastreamento
      await this.databaseAdmin.createTrackingTable(slug.value)

      // STEP 3: Gerar e criar workflows no N8N
      const { leadEntry, tagUpdate } = this.workflowGenerator.generate(slug.value, input.nomeEmpresa)

      const workflow1 = await this.n8nClient.createWorkflow(leadEntry)
      workflow1Id = workflow1.id
      await this.n8nClient.activateWorkflow(workflow1.id)

      const workflow2 = await this.n8nClient.createWorkflow(tagUpdate)
      workflow2Id = workflow2.id
      await this.n8nClient.activateWorkflow(workflow2.id)

      // STEP 4: Atualizar tenant com metadados
      const webhookBase = process.env.N8N_WEBHOOK_BASE_URL!
      const webhookUrlLead = `${webhookBase}/${slug.value}`
      const webhookUrlTag = `${webhookBase}/tracking_${slug.value}`

      await this.tenantRepository.update(tenantId, {
        n8nWorkflowLeadId: workflow1.id,
        n8nWorkflowTagId: workflow2.id,
        webhookUrlLead,
        webhookUrlTag,
        status: 'active',
        onboardingCompletedAt: new Date(),
        onboardingError: null,
      })

      return {
        tenantId,
        userId: user.id,
        slug: slug.value,
        nomeEmpresa: input.nomeEmpresa,
        email: email.value,
        tempPassword,
        webhookUrlLead,
        webhookUrlTag,
        n8nWorkflowLeadId: workflow1.id,
        n8nWorkflowTagId: workflow2.id,
      }
    } catch (error) {
      // ROLLBACK
      console.error('[Onboarding] Erro durante provisionamento, iniciando rollback:', error)

      try {
        if (workflow2Id) await this.n8nClient.deleteWorkflow(workflow2Id).catch(() => {})
        if (workflow1Id) await this.n8nClient.deleteWorkflow(workflow1Id).catch(() => {})
        await this.databaseAdmin.dropTrackingTable(slug.value).catch(() => {})
        if (userId) await this.authService.deleteUser(userId).catch(() => {})
      } catch (rollbackError) {
        console.error('[Onboarding] Erro durante rollback:', rollbackError)
      }

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      await this.tenantRepository.update(tenantId, {
        status: 'error',
        onboardingError: errorMessage,
      })

      throw new OnboardingError(`Falha no onboarding: ${errorMessage}`, { cause: error })
    }
  }
}
