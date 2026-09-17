import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

let connectionPromise = null

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return true
  }

  if (connectionPromise) {
    return connectionPromise
  }

  connectionPromise = (async () => {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sale'

    // Try primary URI
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 6000
      })
      console.log(`[MongoDB Atlas] Connected successfully to 'sale' database at host: ${conn.connection.host}`)
      return true
    } catch (primaryErr) {
      console.warn(`[MongoDB Warning] Primary connection attempt failed: ${primaryErr.message}`)

      // Windows SRV resolution fallback: if SRV fails, try direct replica hosts
      if (uri.includes('cluster0.oe0inne.mongodb.net')) {
        try {
          const directUri = uri
            .replace('mongodb+srv://', 'mongodb://')
            .replace('cluster0.oe0inne.mongodb.net', 'ac-b095rvn-shard-00-00.oe0inne.mongodb.net:27017,ac-b095rvn-shard-00-01.oe0inne.mongodb.net:27017,ac-b095rvn-shard-00-02.oe0inne.mongodb.net:27017')
          const finalDirect = directUri.includes('ssl=true') ? directUri : `${directUri}${directUri.includes('?') ? '&' : '?'}ssl=true&authSource=admin`
          
          console.log('[MongoDB Info] Attempting direct replica set connection fallback...')
          const conn2 = await mongoose.connect(finalDirect, {
            serverSelectionTimeoutMS: 8000
          })
          console.log(`[MongoDB Atlas] Connected via direct replica set at host: ${conn2.connection.host}`)
          return true
        } catch (directErr) {
          console.warn(`[MongoDB Warning] Direct replica fallback failed: ${directErr.message}`)
        }
      }

      return false
    }
  })()

  const result = await connectionPromise
  if (!result) {
    connectionPromise = null // reset so retry is possible
  }
  return result
}
