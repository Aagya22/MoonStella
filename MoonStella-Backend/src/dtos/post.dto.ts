import { z } from 'zod'
import { normalizeMaterial } from '../constants/materials'

export const createPostDto = z.object({
  description: z
    .string({ required_error: 'Description is required' })
    .min(1, 'Description cannot be empty')
    .trim(),

  category: z.string({
    required_error: 'Category is required',
  }),

  budget: z.number().optional().nullable(),
  price: z.string().optional().nullable(),

  // Canonical spelling, so one material can't split into two tags
  materials: z
    .array(z.string())
    .default([])
    .transform((list, ctx) => {
      const normalized: string[] = []
      for (const raw of list) {
        const match = normalizeMaterial(raw)
        if (!match) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `"${raw}" is not a recognised material`,
          })
          return z.NEVER
        }
        if (!normalized.includes(match)) normalized.push(match)
      }
      return normalized
    }),

  images: z.array(z.string()).default([]),
})

export type CreatePostDto = z.infer<typeof createPostDto>
