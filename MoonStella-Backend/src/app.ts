import express from 'express'
import cors from 'cors'
import { env } from './config/env'
import { errorHandler } from './middleware/error.middleware'
import authRoutes from './routes/auth.routes'

const app = express()

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.get('/health', (_, res) => {
  res.json({ status: 'ok', project: 'Moon Stella' })
})

// Routes
app.use('/api/auth', authRoutes)

app.use(errorHandler)

export default app