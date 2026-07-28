import type { Server } from 'socket.io'

let io: Server | null = null

export const setIo = (instance: Server): void => {
  io = instance
}

export const getIo = (): Server | null => io

export const emitToRoom = (room: string, event: string, payload: unknown): void => {
  io?.to(room).emit(event, payload)
}

export const emitToAll = (event: string, payload: unknown): void => {
  io?.emit(event, payload)
}
