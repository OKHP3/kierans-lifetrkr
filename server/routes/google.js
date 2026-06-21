const express = require('express')
const router = express.Router()

function getOAuth2Client() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return null
  }
  const { google } = require('googleapis')
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/google/callback'
  )
}

// GET /api/google/auth — redirect to Google OAuth
router.get('/auth', (req, res) => {
  const oauth2Client = getOAuth2Client()
  if (!oauth2Client) {
    return res.status(503).json({ error: 'Google Calendar not configured' })
  }
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.readonly'],
    prompt: 'consent',
  })
  res.redirect(url)
})

// GET /api/google/callback — handle OAuth callback
router.get('/callback', async (req, res) => {
  const oauth2Client = getOAuth2Client()
  if (!oauth2Client) {
    return res.status(503).json({ error: 'Google Calendar not configured' })
  }
  try {
    const { code } = req.query
    const { tokens } = await oauth2Client.getToken(code)
    req.session.googleTokens = tokens
    res.redirect('/?calendar=connected')
  } catch (err) {
    console.error('Google OAuth callback error:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/google/status — check if connected
router.get('/status', (req, res) => {
  const configured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  const connected = !!(req.session && req.session.googleTokens)
  res.json({ configured, connected })
})

// GET /api/google/calendar?timeMin=...&timeMax=...
router.get('/calendar', async (req, res) => {
  if (!req.session || !req.session.googleTokens) {
    return res.status(401).json({ error: 'Not authenticated with Google Calendar' })
  }
  const oauth2Client = getOAuth2Client()
  if (!oauth2Client) {
    return res.status(503).json({ error: 'Google Calendar not configured' })
  }
  try {
    const { google } = require('googleapis')
    oauth2Client.setCredentials(req.session.googleTokens)

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    const now = new Date()
    const timeMin = req.query.timeMin || now.toISOString()
    const timeMax = req.query.timeMax || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 50,
    })

    const events = (response.data.items || []).map(e => ({
      id: e.id,
      title: e.summary || '(No title)',
      start: e.start?.dateTime || e.start?.date,
      end: e.end?.dateTime || e.end?.date,
      allDay: !e.start?.dateTime,
      color: e.colorId ? `#${e.colorId}` : '#C4A0E8',
      htmlLink: e.htmlLink,
    }))

    res.json({ events })
  } catch (err) {
    console.error('Google Calendar error:', err)
    if (err.code === 401) {
      req.session.googleTokens = null
      return res.status(401).json({ error: 'Token expired, please re-authenticate' })
    }
    res.status(500).json({ error: err.message })
  }
})

// POST /api/google/disconnect
router.post('/disconnect', (req, res) => {
  if (req.session) req.session.googleTokens = null
  res.json({ success: true })
})

module.exports = router
