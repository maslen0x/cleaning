import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'

dotenv.config()

import connectDB from './core/db'

import usersRouter from './routes/users.route'
import backCallsRouter from './routes/backCalls.route'
import reviewsRouter from './routes/reviews.route'
import mainServiceRouter from './routes/mainService.route'
import additionalServiceRouter from './routes/additionalService.route'
import ordersRouter from './routes/orders.route'
import calcRequestsRouter from './routes/calcRequests.route'
import photoRequestsRouter from './routes/photoRequests.route'

const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI

const app = express()

app.use(cors({
  origin: ['http://localhost:3000', 'https://energo-servis-cleaning.vercel.app'],
  credentials: true
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static('uploads'))

app.use('/api/users', usersRouter)
app.use('/api/back-calls', backCallsRouter)
app.use('/api/reviews', reviewsRouter)
app.use('/api/services/main', mainServiceRouter)
app.use('/api/services/additional', additionalServiceRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/requests/calc', calcRequestsRouter)
app.use('/api/requests/photo', photoRequestsRouter)

const start = async () => {
  try {
    await connectDB(MONGO_URI)
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
  } catch (e) {
    console.log(e)
  }
}

start()