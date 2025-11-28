import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { connectDatabase } from './src/config/db.js'
import authRoutes from './src/routes/authRoutes.js'
import profileRoutes from './src/routes/profileRoutes.js'
import taskRoutes from './src/routes/taskRoutes.js'
import { errorHandler } from './src/middleware/errorHandler.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
]
const allowAllInDev = process.env.NODE_ENV !== 'production'
const clientOrigins = [
  ...defaultOrigins,
  ...(process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
].filter((origin, index, arr) => origin && arr.indexOf(origin) === index)

app.use(helmet())
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowAllInDev || clientOrigins.includes(origin)) {
        return callback(null, true)
      }
      console.warn(`Blocked CORS origin: ${origin}`)
      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/tasks', taskRoutes)

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.use(errorHandler)

const bootstrap = async () => {
  try {
    await connectDatabase()
    app.listen(port, () => {
      console.log(`API ready on http://localhost:${port}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

bootstrap()
