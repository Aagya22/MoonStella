import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

// Spins up a throwaway in-memory MongoDB for integration tests, so they never
// touch the real Atlas database. Only integration files import this — pure unit
// tests stay DB-free and fast.
let mongo: MongoMemoryServer | null = null

export const connectTestDb = async (): Promise<void> => {
  mongo = await MongoMemoryServer.create()
  await mongoose.connect(mongo.getUri())
}

export const clearTestDb = async (): Promise<void> => {
  const { collections } = mongoose.connection
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({})
  }
}

export const closeTestDb = async (): Promise<void> => {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
  if (mongo) await mongo.stop()
}
