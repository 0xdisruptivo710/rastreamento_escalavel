export interface WorkflowPayload {
  name: string
  nodes: unknown[]
  connections: Record<string, unknown>
  active?: boolean
  settings?: Record<string, unknown>
}

export interface WorkflowResult {
  id: string
  name: string
  active: boolean
}

export interface IN8NClient {
  createWorkflow(payload: WorkflowPayload): Promise<WorkflowResult>
  activateWorkflow(workflowId: string): Promise<void>
  deactivateWorkflow(workflowId: string): Promise<void>
  deleteWorkflow(workflowId: string): Promise<void>
}
