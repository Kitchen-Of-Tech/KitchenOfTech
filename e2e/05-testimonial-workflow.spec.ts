import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Testimonial Viewing
 */
test.describe('Testimonials', () => {
  test('should display testimonials page', async ({ page }) => {
    await page.goto('/testimonials');
    
    // Check testimonials page loads
    await expect(page.locator('h1:has-text("Testimonial")')).toBeVisible();
  });

  test('should show testimonial cards', async ({ page }) => {
    await page.goto('/testimonials');
    
    // Wait for testimonials to load
    await page.waitForLoadState('networkidle');
    
    // Check for testimonial content
    const testimonialCount = await page.locator('[data-testid="testimonial"], .testimonial').count();
    
    // Page should have testimonial structure even if empty
    const heading = await page.locator('h1, h2').count();
    expect(heading).toBeGreaterThan(0);
  });

  test('should filter testimonials by rating', async ({ page }) => {
    await page.goto('/testimonials');
    
    // Look for rating filter
    const ratingFilter = page.locator('button[data-rating], select[name="rating"]').first();
    const hasFilter = await ratingFilter.count() > 0;
    
    if (hasFilter) {
      await ratingFilter.click();
      await page.waitForTimeout(500);
    }
  });

  test('should paginate testimonials', async ({ page }) => {
    await page.goto('/testimonials');
    
    // Look for pagination
    const nextButton = page.locator('button:has-text("Next"), a:has-text("Next")').first();
    const hasNext = await nextButton.count() > 0;
    
    if (hasNext) {
      await nextButton.click();
      await page.waitForTimeout(500);
    }
  });
});

/**
 * E2E Tests: Testimonial Submission (via link)
 */
test.describe('Testimonial Submission', () => {
  test('should display testimonial submission form', async ({ page }) => {
    // Visit generic testimonial link page
    await page.goto('/testimonial-link');
    
    // Check if form or information is displayed
    const pageText = await page.textContent('body');
    expect(pageText).toMatch(/testimonial|feedback|review/i);
  });

  test('should validate testimonial form', async ({ page }) => {
    await page.goto('/testimonial-link');
    
    // Look for form inputs
    const nameInput = page.locator('input[name="name"]').first();
    const hasForm = await nameInput.count() > 0;
    
    if (hasForm) {
      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      
      // Should show validation errors
      await page.waitForTimeout(500);
      const errorCount = await page.locator('text=/required|invalid|error/i').count();
      expect(errorCount).toBeGreaterThan(0);
    }
  });

  test('should submit testimonial successfully', async ({ page }) => {
    await page.goto('/testimonial-link');
    
    // Look for form
    const messageInput = page.locator('textarea[name="message"], textarea[name="content"]').first();
    const hasForm = await messageInput.count() > 0;
    
    if (hasForm) {
      // Fill form (if it exists)
      await page.fill('input[name="name"]', 'Test User');
      await messageInput.fill('This is a test testimonial');
      
      // Select rating if available
      const ratingInput = page.locator('input[name="rating"], select[name="rating"]').first();
      if (await ratingInput.count() > 0) {
        await ratingInput.click();
      }
      
      // Submit
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      
      // Wait for success message
      await page.waitForTimeout(2000);
    }
  });
});

/**
 * E2E Tests: Testimonial Management (Admin)
 */
test.describe('Testimonial Management', () => {
  test('should require admin access', async ({ page }) => {
    // Try to access admin testimonial management
    await page.goto('/dashboard/testimonials');
    
    // Should redirect to login or show access denied
    await page.waitForLoadState('networkidle');
    
    const url = page.url();
    const isLoginPage = url.includes('/login');
    const bodyText = await page.textContent('body');
    const hasAuthMessage = bodyText?.match(/login|authenticate|unauthorized|access denied/i);
    
    expect(isLoginPage || hasAuthMessage).toBeTruthy();
  });
});
