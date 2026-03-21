import { IN8NClient, WorkflowPayload, WorkflowResult } from '@/domain/interfaces/IN8NClient'
import { WorkflowCreationError } from '@/domain/errors/WorkflowCreationError'

export class N8NApiClient implements IN8NClient {
  private readonly apiUrl: string
  private readonly apiKey: string

  constructor() {
    this.apiUrl = process.env.N8N_API_URL!
    this.apiKey = process.env.N8N_API_KEY!
  }

  async createWorkflow(payload: WorkflowPayload): Promise<WorkflowResult> {
    const { active: _active, ...body } = payload
    const response = await fetch(`${this.apiUrl}/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': this.apiKey,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new WorkflowCreationError(
        `N8N createWorkflow failed: ${response.status} - ${errorText}`
      )
    }

    const data = await response.json()
    return { id: data.id, name: data.name, active: data.active }
  }

  async activateWorkflow(workflowId: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/workflows/${workflowId}/activate`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': this.apiKey,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new WorkflowCreationError(
        `N8N activateWorkflow failed: ${response.status} - ${errorText}`
      )
    }
  }

  async deactivateWorkflow(workflowId: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/workflows/${workflowId}/deactivate`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': this.apiKey,
      },
    })

    if (!response.ok) {
      throw new WorkflowCreationError(
        `N8N deactivateWorkflow failed: ${response.status}`
      )
    }
  }

  async deleteWorkflow(workflowId: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/workflows/${workflowId}`, {
      method: 'DELETE',
      headers: {
        'X-N8N-API-KEY': this.apiKey,
      },
    })

    if (!response.ok) {
      console.error(`N8N deleteWorkflow failed: ${response.status}`)
    }
  }
}
