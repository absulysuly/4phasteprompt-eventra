import { test, expect } from '@playwright/test'

function uniqueId(prefix = 'e2e') {
  return `${prefix}-${Date.now()}`
}

test.describe('Create event, view public page, language switch persistence', () => {
  test('create via UI, view public page, switch language', async ({ page, request }) => {
    // Sign up first
    const email = `${uniqueId()}@example.com`
    const password = 'Password123!'

    await page.goto('/register')
    await page.fill('#name', 'E2E User')
    await page.fill('#email', email)
    await page.fill('#password', password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/)

    // Go to create event page
    await page.goto('/events/create')
    const title = `E2E Event ${uniqueId('title')}`
    await page.fill('input[placeholder*="event name" i], input[placeholder*="اسم" i]', title)
    // date: datetime-local expects local format; set to a reasonable future value
    const future = new Date(Date.now() + 7 * 24 * 3600 * 1000)
    const yyyy = future.getFullYear()
    const mm = String(future.getMonth() + 1).padStart(2, '0')
    const dd = String(future.getDate()).padStart(2, '0')
    const hh = '19'
    const mi = '00'
    const dt = `${yyyy}-${mm}-${dd}T${hh}:${mi}`
    await page.fill('input[type="datetime-local"]', dt)
    await page.fill('textarea[placeholder]', 'E2E test event description')
    await page.fill('input[placeholder*="location" i], input[placeholder*="العنوان" i], input[placeholder*="شوێن" i]', 'Erbil, Iraq')

    await page.click('button[type="submit"]')
    // Redirects back to dashboard on success
    await expect(page).toHaveURL(/dashboard/)

    // Discover the created event's publicId via API (public listing)
    const res = await request.get('/api/events?type=public&lang=en', { headers: { 'cache-control': 'no-cache' } })
    expect(res.ok()).toBeTruthy()
    const list = await res.json()
    const found = Array.isArray(list) ? list.find((e: any) => e.title === title) : null
    expect(found).toBeTruthy()

    // Visit public event page (non-locale route with lang param)
    await page.goto(`/event/${found.publicId}?lang=en`)
    await expect(page.locator('h1')).toContainText(title)

    // Open language switcher and pick Arabic; then ensure Arabic text appears
    await page.click('[data-testid="language-switcher"]')
    await page.click('[data-testid="lang-ar-option"]')

    // Look for Arabic "Event Details" translation
    await expect(page.locator('text=تفاصيل الفعالية')).toBeVisible()

    // Refresh the page and ensure the language persists (cookie / context)
    await page.reload()
    await expect(page.locator('text=تفاصيل الفعالية')).toBeVisible()
  })
})
