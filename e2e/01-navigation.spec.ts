import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Navigation & Basic Page Rendering
 */
test.describe('Navigation', () => {
  test('should navigate to homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check that page loads and contains expected content
    await expect(page).toHaveTitle(/Kitchen of Tech/i);
    await expect(page.getByRole('heading', { name: /kitchen of tech/i, level: 1 })).toBeVisible();
  });

  test('should navigate to services page', async ({ page }) => {
    await page.goto('/services');
    
    // Check services page loads
    await expect(page.getByRole('heading', { name: /services/i })).toBeVisible();
    
    // Check that service categories are displayed
    await expect(page.getByText(/development|design|marketing/i)).toBeVisible();
  });

  test('should navigate to portfolio page', async ({ page }) => {
    await page.goto('/portfolio');
    
    // Check portfolio page loads
    await expect(page.getByRole('heading', { name: /portfolio/i })).toBeVisible();
  });

  test('should navigate to team page', async ({ page }) => {
    await page.goto('/team');
    
    // Check team page loads
    await expect(page.getByRole('heading', { name: /team|our team/i })).toBeVisible();
  });

  test('should navigate to education page', async ({ page }) => {
    await page.goto('/education');
    
    // Check education page loads
    await expect(page.getByRole('heading', { name: /education|courses/i })).toBeVisible();
  });

  test('should navigate to blog page', async ({ page }) => {
    await page.goto('/blog');
    
    // Check blog page loads
    await expect(page.getByRole('heading', { name: /blog/i })).toBeVisible();
  });

  test('should have working header navigation', async ({ page }) => {
    await page.goto('/');
    
    // Click on Services link in header
    await page.click('a[href="/services"]');
    await expect(page).toHaveURL('/services');
    
    // Click on Portfolio link
    await page.click('a[href="/portfolio"]');
    await expect(page).toHaveURL('/portfolio');
    
    // Click on Team link
    await page.click('a[href="/team"]');
    await expect(page).toHaveURL('/team');
  });

  test('should have working footer links', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check footer is visible
    await expect(page.locator('footer')).toBeVisible();
  });
});

/**
 * E2E Tests: Responsive Design
 */
test.describe('Responsive Design', () => {
  test('should be mobile-responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Check that mobile menu button exists
    await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();
  });

  test('should be tablet-responsive', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/');
    
    // Check page renders correctly
    await expect(page).toHaveTitle(/Kitchen of Tech/i);
  });
});
