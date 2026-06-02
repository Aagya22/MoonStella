import { connectDB } from './config/db'

const start = async () => {
  await connectDB()
  console.log(' Moon Stella backend running')
}

start()