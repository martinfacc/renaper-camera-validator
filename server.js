import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const { APP_PORT } = process.env

const app = express()

app.use(cors())

app.use(express.static('dist'))

app.listen(APP_PORT, () => {
  console.log(`Server is running on port ${APP_PORT}`)
})
