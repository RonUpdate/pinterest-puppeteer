import express from 'express'
import puppeteer from 'puppeteer'
import { writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import fetch from 'node-fetch'

const app = express()
app.use(express.json())

const PINT_EMAIL = process.env.PINT_EMAIL
const PINT_PASS = process.env.PINT_PASS

app.post('/pin', async (req, res) => {
  const { title, description, imageurl, tg_link } = req.body
  if (!title || !description || !imageurl || !tg_link) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })

    await page.goto('https://www.pinterest.com/login/', { waitUntil: 'networkidle2' })
    await page.type('input[name="id"]', PINT_EMAIL, { delay: 50 })
    await page.type('input[name="password"]', PINT_PASS, { delay: 50 })
    await page.click('button[type="submit"]')
    await page.waitForNavigation({ waitUntil: 'networkidle2' })

    await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'networkidle2' })

    const buffer = await fetch(imageurl).then(r => r.buffer())
    const tempPath = join(tmpdir(), 'image.png')
    writeFileSync(tempPath, buffer)

    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.click('div[data-test-id="media-upload"] input[type="file"]')
    ])
    await fileChooser.accept([tempPath])

    await page.waitForSelector('textarea[placeholder="Добавьте заголовок"]', { timeout: 10000 })
    await page.type('textarea[placeholder="Добавьте заголовок"]', title)
    await page.type('textarea[placeholder="Расскажите о вашем пине"]', `${description}\n\n${tg_link}`)

    await page.waitForSelector('button[aria-label="Опубликовать"]')
    await page.click('button[aria-label="Опубликовать"]')

    await page.waitForTimeout(3000)
    await browser.close()
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to publish pin' })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Pinterest bot listening on port ${PORT}`)
})
