import app from './app'
import {Server} from 'socket.io'
import { connectDB } from './config/db'
import {env} from './config/env'
import http from 'http'
import jwt from 'jsonwebtoken'
import { Thread } from './models/thread.model'
import { User } from './models/user.model'

const server = http.createServer(app)

export const io=new Server(server,{
  cors:{
    origin: env.CLIENT_URL,
    credentials:true,
  },
})

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token
  if (!token) {
    return next(new Error('Authentication error: No token provided'))
  }
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; iat: number; type?: string }
    if (decoded.type === 'reset') {
      return next(new Error('Authentication error: Invalid token'))
    }
    // Same checks as the protect middleware
    const user = await User.findById(decoded.id).select('isSuspended passwordChangedAt')
    if (!user || user.isSuspended) {
      return next(new Error('Authentication error: Invalid token'))
    }
    if (user.passwordChangedAt && decoded.iat * 1000 < new Date(user.passwordChangedAt).getTime()) {
      return next(new Error('Authentication error: Invalid token'))
    }
    socket.data.userId = decoded.id
    next()
  } catch (err) {
    return next(new Error('Authentication error: Invalid token'))
  }
})

io.on('connection',(socket) => {
  console.log(`Socket connected: ${socket.id}`)

  // Personal room for user-targeted notifications
  if (socket.data.userId) {
    socket.join(`user:${socket.data.userId}`)
  }

  socket.on('join_thread', async (threadId: string) => {
    try {
      const thread = await Thread.findById(threadId)
      if (thread && thread.participants.some((id: any) => String(id) === String(socket.data.userId))) {
        socket.join(`thread:${threadId}`)
        console.log(`Socket ${socket.id} joined thread:${threadId}`)
      } else {
        socket.emit('error', 'Unauthorized access to thread')
      }
    } catch (err) {
      socket.emit('error', 'Invalid thread ID or server error')
    }
  })

  socket.on('typing', async (threadId: string) => {
    try {
      const thread = await Thread.findById(threadId)
      if (thread && thread.participants.some((id: any) => String(id) === String(socket.data.userId))) {
        socket.to(`thread:${threadId}`).emit('typing', {
          threadId,
          userId: socket.data.userId,
        })
      }
    } catch (err) {
      // Ignore typing errors to prevent crashing
    }
  })

  socket.on('disconnect',()=>{
    console.log(`Socket disconnected:${socket.id}`)
  })
})

const start = async () => {
  await connectDB()
  server.listen(Number(env.PORT),()=>{
    console.log(` Moon Stella running on port ${env.PORT}`)
  })
}

start()