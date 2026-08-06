import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sale'
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    })
    console.log(`[MongoDB Atlas] Connected successfully to 'sale' database at host: ${conn.connection.host}`)
    return true
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to Atlas URI: ${error.message}`)
    console.warn(`[MongoDB Info] Application running with resilient state & local persistence.`)
    return false
  }
}
