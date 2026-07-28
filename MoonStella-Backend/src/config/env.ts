import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  CLOUDINARY_CLOUD: z.string().min(1),
  CLOUDINARY_KEY: z.string().min(1),
  CLOUDINARY_SECRET: z.string().min(1),
  EMAIL_USER: z.string().default(''),
  EMAIL_PASS: z.string().default(''),
})


const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error(' Missing environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data