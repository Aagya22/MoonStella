import { z } from 'zod'

export const registerDto = z.object({
  firstName: z
    .string({ required_error: 'First name is required' })
    .min(1, 'First name cannot be empty')
    .trim(),

  lastName: z
    .string({ required_error: 'Last name is required' })
    .min(1, 'Last name cannot be empty')
    .trim(),

  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address')
    .toLowerCase(),

  phoneNumber: z
    .string({ required_error: 'Phone number is required' })
    .min(7, 'Phone number is too short'),

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters'),

  confirmPassword: z
    .string({ required_error: 'Please confirm your password' }),

  role: z.enum(['buyer', 'seller'], {
    required_error: 'Role is required',
    invalid_type_error: 'Role must be buyer or seller',
  }),
})

// Cross-field validation — passwords must match
// This runs after the field-level checks above
export const registerSchema = registerDto.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
)

export const loginDto = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address')
    .toLowerCase(),

  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
})
export const updateProfileDto=z.object({
  avatar:z.string().optional(),
  location:z.string().optional(),
  studioName:z.string().optional(),
  studioSpecialty:z.string().optional(),
  averageResponseTime:z.string().optional(),
  onboarded:z.boolean().optional(),
  interests:z.array(z.string()).optional(),
})

export const checkUniqueSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address')
    .toLowerCase(),
  phoneNumber: z
    .string({ required_error: 'Phone number is required' })
    .min(7, 'Phone number is too short'),
})

export type RegisterDto = z.infer<typeof registerSchema>
export type LoginDto = z.infer<typeof loginDto>
export type UpdateProfileDto=z.infer<typeof updateProfileDto>