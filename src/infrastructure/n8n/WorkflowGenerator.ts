import { IWorkflowGenerator, GeneratedWorkflows } from '@/domain/interfaces/IWorkflowGenerator'
import { getLeadEntryTemplate } from './templates/LeadEntryTemplate'
import { getTagUpdateTemplate } from './templates/TagUpdateTemplate'
import { Slug } from '@/domain/value-objects/Slug'

export class WorkflowGenerator implements IWorkflowGenerator {
  generate(slug: string, nomeEmpresa: string): GeneratedWorkflows {
    const sanitized = Slug.sanitize(slug)
    const tableName = `Rastreamento_${sanitized}`
    const webhookPath = sanitized
    const webhookPathTag = `tracking_${sanitized}`

    const leadEntry = getLeadEntryTemplate({
      slug: sanitized,
      tableName,
      webhookPath,
      nomeEmpresa,
    })

    const tagUpdate = getTagUpdateTemplate({
      slug: sanitized,
      tableName,
      webhookPathTag,
      nomeEmpresa,
    })

    return { leadEntry, tagUpdate }
  }
}
