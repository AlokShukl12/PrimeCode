import mongoose from 'mongoose'

export const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/primecode'
  const dbName = process.env.DB_NAME || 'primecode'

  mongoose.set('strictQuery', true)

  await mongoose.connect(uri, {
    dbName,
  })

  console.log(`Connected to MongoDB (${dbName})`)
}
