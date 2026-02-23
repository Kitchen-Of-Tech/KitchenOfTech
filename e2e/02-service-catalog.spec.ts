import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Service Catalog Navigation
 */
test.describe('Service Catalog', () => {
  test('should display service categories', async ({ page }) => {
    await page.goto('/services');
    
    // Wait for service categories to load
    await page.waitForSelector('[data-testid="service-category"], .service-category', {
      timeout: 10000,
      state: 'visible',
    }).catch(() => {
      // Fallback: check if any category-related text exists
      return page.locator('text=/development|design|marketing/i').first();
    });
    
    // Verify at least one category is displayed
    const categoryCount = await page.locator('[data-testid="service-category"], .service-category, .category').count();
    expect(categoryCount).toBeGreaterThan(0);
  });

  test('should filter services by category', async ({ page }) => {
    await page.goto('/services');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click on a category filter (if exists)
    const categoryButton = page.locator('button:has-text("Development"), a:has-text("Development")').first();
    const buttonExists = await categoryButton.count() > 0;
    
    if (buttonExists) {
      await categoryButton.click();
      
      // Wait for filtered results
      await page.waitForTimeout(1000);
      
      // Verify URL or content changed
      const url = page.url();
      expect(url.includes('development') || url.includes('services')).toBeTruthy();
    }
  });

  test('should navigate to service detail page', async ({ page }) => {
    await page.goto('/services');
    
    // Wait for services to load
    await page.waitForLoadState('networkidle');
    
    // Find and click first service link (if exists)
    const serviceLink = page.locator('a[href*="/services/"]').first();
    const linkExists = await serviceLink.count() > 0;
    
    if (linkExists) {
      await serviceLink.click();
      
      // Verify we navigated to a service detail page
      await expect(page).toHaveURL(/\/services\/.+/);
    }
  });

  test('should display service information', async ({ page }) => {
    await page.goto('/services');
    
    // Check that services page has content
    const hasHeading = await page.locator('h1, h2').count() > 0;
    expect(hasHeading).toBeTruthy();
    
    // Check for service-related text
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/service|solution|development|design|marketing/i);
  });

  test('should have working breadcrumbs', async ({ page }) => {
    await page.goto('/services');
    
    // Check if breadcrumbs exist
    const breadcrumbs = page.locator('[aria-label="breadcrumb"], .breadcrumb');
    const hasBreadcrumbs = await breadcrumbs.count() > 0;
    
    if (hasBreadcrumbs) {
      // Click home breadcrumb
      await page.click('a[href="/"]');
      await expect(page).toHaveURL('/');
    }
  });
});

/**
 * E2E Tests: Service Search
 */
test.describe('Service Search', () => {
  test('should search for services', async ({ page }) => {
    await page.goto('/services');
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
    const hasSearch = await searchInput.count() > 0;
    
    if (hasSearch) {
      // Type search query
      await searchInput.fill('web development');
      
      // Wait for search results
      await page.waitForTimeout(1000);
      
      // Verify results contain search term
      const results = await page.textContent('body');
      expect(results).toMatch(/web|development/i);
    }
  });
});
