import app from './app'
import {Server} from 'socket.io'
import { connectDB } from './config/db'
import {env} from './config/env'
import http from 'http'
import { threadId } from 'worker_threads'

const server = http.createServer(app)

export const io=new Server(server,{
  cors:{
    origin: env.CLIENT_URL,
    credentials:true,
  },
})

io.on('connection',(socket) => {
  console.log(`Socket connected: ${socket.id}`)

  socket.on('join_thread', (threadId:string) => {
    socket.join(`thread:${threadId}`)
  })
  socket.on('typing', (threadId: string) => {
    socket.to(`thread:${threadId}`).emit('typing', {
      threadId,
      userId: socket.data.userId,
    })  
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