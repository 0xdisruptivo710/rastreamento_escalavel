import { Tenant, TenantProps } from '@/domain/entities/Tenant'
import { ITenantRepository, TenantUpdateData } from '@/domain/interfaces/ITenantRepository'
import { createAdminClient } from '../supabase/admin'

export class SupabaseTenantRepository implements ITenantRepository {
  private getClient() {
    return createAdminClient()
  }

  async create(tenant: Tenant): Promise<Tenant> {
    const supabase = this.getClient()
    const json = tenant.toJSON()

    const { data, error } = await supabase
      .from('tenants')
      .insert({
        nome_empresa: json.nomeEmpresa,
        slug: json.slug,
        email: json.email,
        status: json.status,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Falha ao criar tenant: ${error.message}`)
    }

    return this.mapToEntity(data)
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      throw new Error(`Falha ao buscar tenant por slug: ${error.message}`)
    }

    return data ? this.mapToEntity(data) : null
  }

  async findByUserId(userId: string): Promise<Tenant | null> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      throw new Error(`Falha ao buscar tenant por user_id: ${error.message}`)
    }

    return data ? this.mapToEntity(data) : null
  }

  async findById(id: string): Promise<Tenant | null> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new Error(`Falha ao buscar tenant por id: ${error.message}`)
    }

    return data ? this.mapToEntity(data) : null
  }

  async update(id: string, updateData: TenantUpdateData): Promise<void> {
    const supabase = this.getClient()

    const dbData: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (updateData.userId !== undefined) dbData.user_id = updateData.userId
    if (updateData.n8nWorkflowLeadId !== undefined) dbData.n8n_workflow_lead_id = updateData.n8nWorkflowLeadId
    if (updateData.n8nWorkflowTagId !== undefined) dbData.n8n_workflow_tag_id = updateData.n8nWorkflowTagId
    if (updateData.webhookUrlLead !== undefined) dbData.webhook_url_lead = updateData.webhookUrlLead
    if (updateData.webhookUrlTag !== undefined) dbData.webhook_url_tag = updateData.webhookUrlTag
    if (updateData.status !== undefined) dbData.status = updateData.status
    if (updateData.onboardingError !== undefined) dbData.onboarding_error = updateData.onboardingError
    if (updateData.onboardingCompletedAt !== undefined) dbData.onboarding_completed_at = updateData.onboardingCompletedAt.toISOString()

    const { error } = await supabase
      .from('tenants')
      .update(dbData)
      .eq('id', id)

    if (error) {
      throw new Error(`Falha ao atualizar tenant: ${error.message}`)
    }
  }

  async list(): Promise<Tenant[]> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Falha ao listar tenants: ${error.message}`)
    }

    return (data ?? []).map((row) => this.mapToEntity(row))
  }

  async delete(id: string): Promise<void> {
    const supabase = this.getClient()
    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Falha ao deletar tenant: ${error.message}`)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToEntity(row: any): Tenant {
    const props: TenantProps = {
      id: row.id,
      nomeEmpresa: row.nome_empresa,
      slug: row.slug,
      email: row.email,
      userId: row.user_id,
      n8nWorkflowLeadId: row.n8n_workflow_lead_id,
      n8nWorkflowTagId: row.n8n_workflow_tag_id,
      webhookUrlLead: row.webhook_url_lead,
      webhookUrlTag: row.webhook_url_tag,
      status: row.status,
      onboardingError: row.onboarding_error,
      onboardingCompletedAt: row.onboarding_completed_at ? new Date(row.onboarding_completed_at) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
    return new Tenant(props)
  }
}
