import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()

app.use('*', logger())
app.use('/api/*', cors({ origin: '*' }))

// ─── Telegram helper ────────────────────────────────────────────────────────
async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.warn('[telegram] env vars not set — skipping send')
    return false
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[telegram] send failed:', err)
    return false
  }
  return true
}

// ─── Contact form endpoint ──────────────────────────────────────────────────
app.post('/api/contact', async (c) => {
  let body
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400)
  }

  const { name, phone, website, service } = body

  if (!name?.trim() || !phone?.trim()) {
    return c.json({ error: 'Name and phone are required' }, 400)
  }

  const msg = [
    '🔔 <b>New Lead — vaayulabs.com</b>',
    '━━━━━━━━━━━━━━━━━━━━',
    `👤 <b>Name:</b> ${name}`,
    `📞 <b>Phone:</b> ${phone}`,
    `🌐 <b>Website:</b> ${website || '—'}`,
    `🎯 <b>Service needed:</b> ${service || '—'}`,
    '━━━━━━━━━━━━━━━━━━━━',
    '⚡ Reply within 24 hrs to convert!',
  ].join('\n')

  const sent = await sendTelegram(msg)

  if (!sent && process.env.TELEGRAM_BOT_TOKEN) {
    return c.json({ error: 'Could not send notification' }, 500)
  }

  return c.json({ success: true })
})

// ─── Serve static files ─────────────────────────────────────────────────────
app.use('/*', serveStatic({ root: './' }))

// ─── Start ──────────────────────────────────────────────────────────────────
const port = Number(process.env.PORT) || 3000
serve({ fetch: app.fetch, port }, () => {
  console.log(`\n  vaayulabs dev server → http://localhost:${port}\n`)
})
