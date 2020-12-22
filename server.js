const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const morgan = require('morgan')

const app = express()
const connectDB = require('./config/database')
const errorHandler = require('./middleware/errorHandler')

// Env variables
const { PORT, NODE_ENV } = require('./config/config')

// Routes
const userRoute = require('./routes/auth')

connectDB()

// ---------- Middleware -----------------
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
)

app.use(errorHandler)

if (NODE_ENV === 'development') app.use(morgan('dev'))

// ---------- Mounting routes ------------
app.use('/api/v1/auth', userRoute)

const server = app.listen(PORT, () => {
  console.log(`Server running ${NODE_ENV} mode and listening on port ${PORT}!`)
})
