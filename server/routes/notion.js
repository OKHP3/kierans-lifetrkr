const express = require('express')
const router = express.Router()

let notionClient = null

function getClient() {
  if (!notionClient && process.env.NOTION_API_KEY) {
    const { Client } = require('@notionhq/client')
    notionClient = new Client({ auth: process.env.NOTION_API_KEY })
  }
  return notionClient
}

function notionConfigured() {
  return !!process.env.NOTION_API_KEY
}

// GET /api/notion/routines?day=Mon
router.get('/routines', async (req, res) => {
  if (!notionConfigured()) {
    return res.status(503).json({ error: 'Notion not configured', configured: false })
  }
  try {
    const client = getClient()
    const { day } = req.query
    const filter = day ? {
      property: 'Day_Of_Week',
      select: { equals: day }
    } : undefined

    const response = await client.databases.query({
      database_id: process.env.NOTION_ROUTINE_TEMPLATES_DB_ID,
      filter,
      sorts: [{ property: 'Sort_Order', direction: 'ascending' }]
    })

    const items = response.results.map(page => ({
      id: page.id,
      title: page.properties.Title?.title?.[0]?.plain_text || '',
      day: page.properties.Day_Of_Week?.select?.name || '',
      time: page.properties.Time_Label?.rich_text?.[0]?.plain_text || '',
      order: page.properties.Sort_Order?.number || 0,
      active: page.properties.Active?.checkbox ?? true,
    }))

    res.json({ items })
  } catch (err) {
    console.error('Notion routines error:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/notion/habits
router.get('/habits', async (req, res) => {
  if (!notionConfigured()) {
    return res.status(503).json({ error: 'Notion not configured', configured: false })
  }
  try {
    const client = getClient()
    const response = await client.databases.query({
      database_id: process.env.NOTION_HABITS_DB_ID,
      filter: { property: 'Active', checkbox: { equals: true } }
    })

    const habits = response.results.map(page => ({
      id: page.id,
      name: page.properties.Title?.title?.[0]?.plain_text || '',
      description: page.properties.Description?.rich_text?.[0]?.plain_text || '',
      color: page.properties.Color?.select?.name || '#C4A0E8',
      active: page.properties.Active?.checkbox ?? true,
    }))

    res.json({ habits })
  } catch (err) {
    console.error('Notion habits error:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/notion/completions?habitId=xxx&date=2026-06-21
router.get('/completions', async (req, res) => {
  if (!notionConfigured()) {
    return res.status(503).json({ error: 'Notion not configured', configured: false })
  }
  try {
    const client = getClient()
    const { habitId, date } = req.query

    const filters = []
    if (date) filters.push({ property: 'Date', date: { equals: date } })

    const response = await client.databases.query({
      database_id: process.env.NOTION_HABIT_COMPLETIONS_DB_ID,
      filter: filters.length === 1 ? filters[0] : filters.length > 1 ? { and: filters } : undefined
    })

    const completions = response.results.map(page => ({
      id: page.id,
      habitId: page.properties.Habit?.relation?.[0]?.id || '',
      date: page.properties.Date?.date?.start || '',
      completed: page.properties.Completed?.checkbox ?? false,
    }))

    res.json({ completions })
  } catch (err) {
    console.error('Notion completions error:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/notion/tasks?status=Today
router.get('/tasks', async (req, res) => {
  if (!notionConfigured()) {
    return res.status(503).json({ error: 'Notion not configured', configured: false })
  }
  try {
    const client = getClient()
    const { status } = req.query

    const filter = status ? {
      property: 'Status',
      select: { equals: status }
    } : undefined

    const response = await client.databases.query({
      database_id: process.env.NOTION_TASKS_DB_ID,
      filter,
      sorts: [{ property: 'Created', direction: 'descending' }]
    })

    const tasks = response.results.map(page => ({
      id: page.id,
      title: page.properties.Title?.title?.[0]?.plain_text || '',
      notes: page.properties.Notes?.rich_text?.[0]?.plain_text || '',
      priority: page.properties.Priority?.select?.name || 'Normal',
      dueDate: page.properties.Due_Date?.date?.start || null,
      status: page.properties.Status?.select?.name || 'Backlog',
      source: page.properties.Source?.select?.name || 'Manual',
    }))

    res.json({ tasks })
  } catch (err) {
    console.error('Notion tasks error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
