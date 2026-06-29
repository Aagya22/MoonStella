import { z } from 'zod'

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
  materials: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
})

export type CreatePostDto = z.infer<typeof createPostDto>
