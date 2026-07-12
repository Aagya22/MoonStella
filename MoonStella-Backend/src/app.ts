import express from 'express'
import cors from 'cors'
import { env } from './config/env'
import { errorHandler } from './middleware/error.middleware'
import authRoutes from './routes/auth.routes'
import uploadRoutes from './routes/upload.routes'
import postRoutes from './routes/post.routes'
import chatRoutes from './routes/chat.routes'
import orderRoutes from './routes/order.routes'
import notificationRoutes from './routes/notification.routes'
import adminRoutes from './routes/admin.routes'

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
app.use('/api/upload', uploadRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/admin', adminRoutes)

app.use(errorHandler)

export default app