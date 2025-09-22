import { test, expect } from '@playwright/test'

// Utility: generate unique email
function uniqueEmail(prefix: string) {
  const ts = Date.now()
  return `${prefix}+${ts}@example.com`
}

test.describe('Auth happy path and bad credentials', () => {
  test('sign up and auto sign in', async ({ page }) => {
    const email = uniqueEmail('e2e')
    const password = 'Password123!'

    await page.goto('/register')
    await page.fill('#name', 'E2E User')
    await page.fill('#email', email)
    await page.fill('#password', password)
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/dashboard/)
    await expect(page.locator('text=Create Event')).toBeVisible()
  })

  test('bad credentials show error', async ({ page }) => {
    await page.goto('/login')
    await page.fill('#email', uniqueEmail('nouser'))
    await page.fill('#password', 'WrongPass123!')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/login|\//)
    await expect(page.locator('text=/Invalid|incorrect|غير صحيحة|هەڵه/i')).toBeVisible()
  })
})
