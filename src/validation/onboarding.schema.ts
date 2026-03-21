import { z } from 'zod'

export const onboardingSchema = z.object({
  nomeEmpresa: z
    .string()
    .min(2, 'Nome da empresa deve ter pelo menos 2 caracteres')
    .max(100, 'Nome da empresa deve ter no máximo 100 caracteres')
    .trim(),
  slug: z
    .string()
    .min(2, 'Slug deve ter pelo menos 2 caracteres')
    .max(63, 'Slug deve ter no máximo 63 caracteres')
    .regex(/^[a-z0-9_]+$/, 'Slug deve conter apenas letras minúsculas, números e underscore'),
  email: z
    .string()
    .email('E-mail inválido')
    .max(255, 'E-mail deve ter no máximo 255 caracteres')
    .trim()
    .toLowerCase(),
})

export type OnboardingSchemaType = z.infer<typeof onboardingSchema>
