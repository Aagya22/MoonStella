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
  avatar:z.string().optional().nullable(),
  location:z.string().optional().nullable(),
  studioName:z.string().optional().nullable(),
  studioSpecialty:z.string().optional().nullable(),
  averageResponseTime:z.string().optional().nullable(),
  onboarded:z.boolean().optional(),
  interests:z.array(z.string()).optional(),
  firstName:z.string().optional(),
  lastName:z.string().optional(),
  email:z.string().email().optional(),
  phoneNumber:z.string().optional(),
  bio:z.string().optional().nullable(),
})

export const changePasswordSchema = z.object({
  oldPassword: z.string({ required_error: 'Old password is required' }),
  newPassword: z
    .string({ required_error: 'New password must be specified' })
    .min(8, 'New password must be at least 8 characters'),
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

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address')
    .toLowerCase(),
})

export const resetPasswordSchema = z.object({
  token: z.string({ required_error: 'Token is required' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string({ required_error: 'Confirm password is required' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type RegisterDto = z.infer<typeof registerSchema>
export type LoginDto = z.infer<typeof loginDto>
export type UpdateProfileDto = z.infer<typeof updateProfileDto>
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>