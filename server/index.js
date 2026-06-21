require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const session = require('express-session')

const app = express()
const PORT = process.env.SERVER_PORT || 3001

app.use(cors({
  origin: true,
  credentials: true,
}))

app.use(express.json())

app.use(session({
  secret: process.env.SESSION_SECRET || 'lifetrkr-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }
}))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: "Kieran's LifeTrkr API" })
})

// Notion routes (Phase 2)
const notionRouter = require('./routes/notion')
app.use('/api/notion', notionRouter)

// Google Calendar routes (Phase 1.5)
const googleRouter = require('./routes/google')
app.use('/api/google', googleRouter)

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist')
  app.use(express.static(distPath))
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, 'localhost', () => {
  console.log(`LifeTrkr API server running on http://localhost:${PORT}`)
})

module.exports = app
