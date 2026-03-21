import { WorkflowPayload } from './IN8NClient'

export interface GeneratedWorkflows {
  leadEntry: WorkflowPayload
  tagUpdate: WorkflowPayload
}

export interface IWorkflowGenerator {
  generate(slug: string, nomeEmpresa: string): GeneratedWorkflows
}
