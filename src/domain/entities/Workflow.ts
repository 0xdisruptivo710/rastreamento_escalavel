export type WorkflowType = 'lead_entry' | 'tag_update'

export interface WorkflowProps {
  id: string
  name: string
  type: WorkflowType
  active: boolean
}

export class Workflow {
  private readonly _id: string
  private readonly _name: string
  private readonly _type: WorkflowType
  private _active: boolean

  constructor(props: WorkflowProps) {
    this._id = props.id
    this._name = props.name
    this._type = props.type
    this._active = props.active
  }

  get id(): string { return this._id }
  get name(): string { return this._name }
  get type(): WorkflowType { return this._type }
  get active(): boolean { return this._active }

  activate(): void {
    this._active = true
  }

  deactivate(): void {
    this._active = false
  }
}
