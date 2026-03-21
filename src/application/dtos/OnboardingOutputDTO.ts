export interface OnboardingOutputDTO {
  tenantId: string
  userId: string
  slug: string
  nomeEmpresa: string
  email: string
  tempPassword: string
  webhookUrlLead: string
  webhookUrlTag: string
  n8nWorkflowLeadId: string
  n8nWorkflowTagId: string
}
