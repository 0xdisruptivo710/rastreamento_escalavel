import { Slug } from '../value-objects/Slug'
import { Email } from '../value-objects/Email'

export type TenantStatus = 'pending' | 'provisioning' | 'active' | 'error' | 'inactive'

export interface TenantProps {
  id?: string
  nomeEmpresa: string
  slug: string
  email: string
  userId?: string
  n8nWorkflowLeadId?: string
  n8nWorkflowTagId?: string
  webhookUrlLead?: string
  webhookUrlTag?: string
  status: TenantStatus
  onboardingError?: string
  onboardingCompletedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

export class Tenant {
  private readonly _id?: string
  private readonly _nomeEmpresa: string
  private readonly _slug: Slug
  private readonly _email: Email
  private _userId?: string
  private _n8nWorkflowLeadId?: string
  private _n8nWorkflowTagId?: string
  private _webhookUrlLead?: string
  private _webhookUrlTag?: string
  private _status: TenantStatus
  private _onboardingError?: string
  private _onboardingCompletedAt?: Date
  private readonly _createdAt: Date
  private _updatedAt: Date

  constructor(props: TenantProps) {
    this._id = props.id
    this._nomeEmpresa = props.nomeEmpresa
    this._slug = new Slug(props.slug)
    this._email = new Email(props.email)
    this._userId = props.userId
    this._n8nWorkflowLeadId = props.n8nWorkflowLeadId
    this._n8nWorkflowTagId = props.n8nWorkflowTagId
    this._webhookUrlLead = props.webhookUrlLead
    this._webhookUrlTag = props.webhookUrlTag
    this._status = props.status
    this._onboardingError = props.onboardingError
    this._onboardingCompletedAt = props.onboardingCompletedAt
    this._createdAt = props.createdAt ?? new Date()
    this._updatedAt = props.updatedAt ?? new Date()
  }

  static create(nomeEmpresa: string, slug: Slug, email: Email): Tenant {
    return new Tenant({
      nomeEmpresa,
      slug: slug.value,
      email: email.value,
      status: 'pending',
    })
  }

  get id(): string | undefined { return this._id }
  get nomeEmpresa(): string { return this._nomeEmpresa }
  get slug(): Slug { return this._slug }
  get email(): Email { return this._email }
  get userId(): string | undefined { return this._userId }
  get n8nWorkflowLeadId(): string | undefined { return this._n8nWorkflowLeadId }
  get n8nWorkflowTagId(): string | undefined { return this._n8nWorkflowTagId }
  get webhookUrlLead(): string | undefined { return this._webhookUrlLead }
  get webhookUrlTag(): string | undefined { return this._webhookUrlTag }
  get status(): TenantStatus { return this._status }
  get onboardingError(): string | undefined { return this._onboardingError }
  get onboardingCompletedAt(): Date | undefined { return this._onboardingCompletedAt }
  get createdAt(): Date { return this._createdAt }
  get updatedAt(): Date { return this._updatedAt }

  setUserId(userId: string): void {
    this._userId = userId
    this._updatedAt = new Date()
  }

  setWorkflows(leadId: string, tagId: string, webhookLead: string, webhookTag: string): void {
    this._n8nWorkflowLeadId = leadId
    this._n8nWorkflowTagId = tagId
    this._webhookUrlLead = webhookLead
    this._webhookUrlTag = webhookTag
    this._updatedAt = new Date()
  }

  markActive(): void {
    this._status = 'active'
    this._onboardingCompletedAt = new Date()
    this._onboardingError = undefined
    this._updatedAt = new Date()
  }

  markError(error: string): void {
    this._status = 'error'
    this._onboardingError = error
    this._updatedAt = new Date()
  }

  markProvisioning(): void {
    this._status = 'provisioning'
    this._updatedAt = new Date()
  }

  toJSON(): TenantProps {
    return {
      id: this._id,
      nomeEmpresa: this._nomeEmpresa,
      slug: this._slug.value,
      email: this._email.value,
      userId: this._userId,
      n8nWorkflowLeadId: this._n8nWorkflowLeadId,
      n8nWorkflowTagId: this._n8nWorkflowTagId,
      webhookUrlLead: this._webhookUrlLead,
      webhookUrlTag: this._webhookUrlTag,
      status: this._status,
      onboardingError: this._onboardingError,
      onboardingCompletedAt: this._onboardingCompletedAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    }
  }
}
