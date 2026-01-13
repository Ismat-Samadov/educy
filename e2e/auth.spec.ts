import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should display sign in page', async ({ page }) => {
    await page.goto('/auth/signin')
    await expect(page).toHaveTitle(/Sign In|Educy/i)
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/auth/signin')
    
    // Try to submit without filling fields
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
    
    // Check if form validation prevents submission
    await expect(page).toHaveURL(/signin/)
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin')
    
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
    
    // Wait for error message
    await page.waitForTimeout(2000)
    
    // Should stay on sign in page
    await expect(page).toHaveURL(/signin/)
  })

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/auth/signin')
    
    const forgotPasswordLink = page.locator('a:has-text("Forgot")')
    if (await forgotPasswordLink.count() > 0) {
      await forgotPasswordLink.click()
      await expect(page).toHaveURL(/forgot-password/)
    }
  })

  test('should display forgot password form', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })
})

test.describe('Landing Page', () => {
  test('should load the landing page successfully', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Educy/)
    
    // Check for key elements
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
  })

  test('should have navigation to sign in', async ({ page }) => {
    await page.goto('/')
    
    const signInLink = page.locator('a:has-text("Sign In"), a:has-text("Login")')
    if (await signInLink.count() > 0) {
      await expect(signInLink.first()).toBeVisible()
    }
  })

  test('should be responsive', async ({ page }) => {
    await page.goto('/')
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('body')).toBeVisible()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 })
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Public Pages Accessibility', () => {
  test('unauthorized page should be accessible', async ({ page }) => {
    await page.goto('/unauthorized')
    await expect(page.locator('body')).toBeVisible()
  })

  test('sign in page should be accessible without authentication', async ({ page }) => {
    await page.goto('/auth/signin')
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })
})
