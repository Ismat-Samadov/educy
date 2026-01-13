import { test, expect } from '@playwright/test'

test.describe('Role-Based Access Control', () => {
  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated user from admin dashboard', async ({ page }) => {
      await page.goto('/admin')
      
      // Should be redirected to sign in or unauthorized
      await page.waitForURL(/signin|unauthorized/, { timeout: 5000 })
      expect(page.url()).toMatch(/signin|unauthorized/)
    })

    test('should redirect unauthenticated user from instructor dashboard', async ({ page }) => {
      await page.goto('/instructor')
      
      await page.waitForURL(/signin|unauthorized/, { timeout: 5000 })
      expect(page.url()).toMatch(/signin|unauthorized/)
    })

    test('should redirect unauthenticated user from student dashboard', async ({ page }) => {
      await page.goto('/student')
      
      await page.waitForURL(/signin|unauthorized/, { timeout: 5000 })
      expect(page.url()).toMatch(/signin|unauthorized/)
    })

    test('should redirect unauthenticated user from moderator dashboard', async ({ page }) => {
      await page.goto('/moderator')
      
      await page.waitForURL(/signin|unauthorized/, { timeout: 5000 })
      expect(page.url()).toMatch(/signin|unauthorized/)
    })
  })

  test.describe('API Endpoints Protection', () => {
    test('admin API should return 401 for unauthenticated request', async ({ request }) => {
      const response = await request.get('/api/admin/users')
      expect(response.status()).toBe(401)
    })

    test('courses API should require authentication', async ({ request }) => {
      const response = await request.get('/api/courses')
      expect([401, 403]).toContain(response.status())
    })

    test('moderator API should require authentication', async ({ request }) => {
      const response = await request.get('/api/moderator/stats')
      expect([401, 403]).toContain(response.status())
    })
  })
})

test.describe('User Management', () => {
  test('admin user creation page should require authentication', async ({ page }) => {
    await page.goto('/admin/users/create')
    
    await page.waitForURL(/signin|unauthorized/, { timeout: 5000 })
    expect(page.url()).toMatch(/signin|unauthorized/)
  })

  test('admin users page should require authentication', async ({ page }) => {
    await page.goto('/admin/users')
    
    await page.waitForURL(/signin|unauthorized/, { timeout: 5000 })
    expect(page.url()).toMatch(/signin|unauthorized/)
  })
})

test.describe('Course Management', () => {
  test('student courses page should require authentication', async ({ page }) => {
    await page.goto('/student/courses')
    
    await page.waitForURL(/signin|unauthorized/, { timeout: 5000 })
    expect(page.url()).toMatch(/signin|unauthorized/)
  })

  test('instructor courses page should require authentication', async ({ page }) => {
    await page.goto('/instructor/courses')
    
    await page.waitForURL(/signin|unauthorized/, { timeout: 5000 })
    expect(page.url()).toMatch(/signin|unauthorized/)
  })

  test('new course page should require authentication', async ({ page }) => {
    await page.goto('/instructor/courses/new')
    
    await page.waitForURL(/signin|unauthorized/, { timeout: 5000 })
    expect(page.url()).toMatch(/signin|unauthorized/)
  })
})

test.describe('Assignment Management', () => {
  test('student assignments page should require authentication', async ({ page }) => {
    await page.goto('/student/assignments')
    
    await page.waitForURL(/signin|unauthorized/, { timeout: 5000 })
    expect(page.url()).toMatch(/signin|unauthorized/)
  })
})

test.describe('Enrollment Management', () => {
  test('moderator enrollments page should require authentication', async ({ page }) => {
    await page.goto('/moderator/enrollments')
    
    await page.waitForURL(/signin|unauthorized/, { timeout: 5000 })
    expect(page.url()).toMatch(/signin|unauthorized/)
  })
})
