import { z } from 'zod'

export const leadFilterSchema = z.object({
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  campanha: z.string().optional(),
  status: z.string().optional(),
  busca: z.string().max(200).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
})

export type LeadFilterSchemaType = z.infer<typeof leadFilterSchema>
