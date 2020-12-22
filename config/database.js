const mongoose = require('mongoose')
const { MONGO_URI } = require('./config')

const connectDB = async () => {
  const conn = await mongoose.connect(MONGO_URI, {
    useFindAndModify: false,
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  })

  console.log(`DB connected: ${conn.connection.host}`)
}

module.exports = connectDB
