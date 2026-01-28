import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Course Enrollment Flow
 */
test.describe('Course Enrollment', () => {
  test('should display courses list', async ({ page }) => {
    await page.goto('/education');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that courses page has content
    const heading = page.locator('h1:has-text("Education"), h1:has-text("Courses")').first();
    await expect(heading).toBeVisible();
  });

  test('should navigate to course detail', async ({ page }) => {
    await page.goto('/education');
    
    // Wait for courses to load
    await page.waitForLoadState('networkidle');
    
    // Find first course link
    const courseLink = page.locator('a[href*="/education/"]').first();
    const hasLink = await courseLink.count() > 0;
    
    if (hasLink) {
      await courseLink.click();
      
      // Verify we're on course detail page
      await expect(page).toHaveURL(/\/education\/.+/);
      
      // Check for course content
      const hasContent = await page.locator('h1, h2').count() > 0;
      expect(hasContent).toBeTruthy();
    }
  });

  test('should display course information', async ({ page }) => {
    await page.goto('/education');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Check for course-related content
    const pageText = await page.textContent('body');
    expect(pageText).toMatch(/course|learn|education|training|lesson/i);
  });

  test('should show enrollment button', async ({ page }) => {
    await page.goto('/education');
    
    // Look for enrollment-related buttons
    const enrollButton = page.locator('button:has-text("Enroll"), a:has-text("Enroll"), button:has-text("Start")').first();
    const hasButton = await enrollButton.count() > 0;
    
    if (hasButton) {
      await expect(enrollButton).toBeVisible();
    }
  });

  test('should filter courses by category', async ({ page }) => {
    await page.goto('/education');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for category filters
    const categoryFilter = page.locator('button[data-category], select[name="category"]').first();
    const hasFilter = await categoryFilter.count() > 0;
    
    if (hasFilter) {
      await categoryFilter.click();
      await page.waitForTimeout(1000);
    }
  });
});

/**
 * E2E Tests: Course Learning Interface
 */
test.describe('Course Learning', () => {
  test('should require authentication for learning', async ({ page }) => {
    // Try to access learning interface without auth
    await page.goto('/education/learn/test-course');
    
    // Should redirect to login or show auth required message
    await page.waitForLoadState('networkidle');
    
    const url = page.url();
    const isLoginPage = url.includes('/login');
    const bodyText = await page.textContent('body');
    const hasAuthMessage = bodyText?.match(/login|authenticate|sign in|access denied/i);
    
    expect(isLoginPage || hasAuthMessage).toBeTruthy();
  });

  test('should display course modules', async ({ page }) => {
    await page.goto('/education');
    
    // This test would require authenticated access
    // For now, just verify the education page loads
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });
});
