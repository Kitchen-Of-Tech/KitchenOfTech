import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

/**
 * Authentication setup for E2E tests
 * This runs before tests and saves authenticated state
 */
setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');
  
  // Fill in login credentials (use test account)
  await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
  await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'TestPassword123!');
  
  // Click login button
  await page.click('button[type="submit"]');
  
  // Wait for navigation to complete
  await page.waitForURL('/dashboard', { timeout: 10000 });
  
  // Verify we're logged in
  await expect(page.getByText('Dashboard')).toBeVisible();
  
  // Save authentication state
  await page.context().storageState({ path: authFile });
});
