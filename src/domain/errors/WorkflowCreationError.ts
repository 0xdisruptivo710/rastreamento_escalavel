export class WorkflowCreationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'WorkflowCreationError'
  }
}
