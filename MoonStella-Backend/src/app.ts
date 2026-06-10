import express from 'express'
import cors from 'cors'
import { env } from './config/env'
import { errorHandler } from './middleware/error.middleware'
import authRoutes from './routes/auth.routes'

const app = express()

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (_, res) => {
  res.json({ status: 'ok', project: 'Moon Stella' })
})

app.use('/api/auth', authRoutes)

app.use(errorHandler)

export default app