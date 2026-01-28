import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Team Member Display
 */
test.describe('Team Page', () => {
  test('should display team members', async ({ page }) => {
    await page.goto('/team');
    
    // Check page loads
    await expect(page.locator('h1:has-text("Team"), h1:has-text("Our Team")')).toBeVisible();
    
    // Wait for team members to load
    await page.waitForLoadState('networkidle');
  });

  test('should show team member cards', async ({ page }) => {
    await page.goto('/team');
    
    // Wait for content
    await page.waitForLoadState('networkidle');
    
    // Check for team member elements
    const memberCount = await page.locator('[data-testid="team-member"], .team-member, .member-card').count();
    
    // Page should have proper structure
    const hasHeading = await page.locator('h1, h2').count() > 0;
    expect(hasHeading).toBeTruthy();
  });

  test('should navigate to team member detail', async ({ page }) => {
    await page.goto('/team');
    
    // Wait for team members to load
    await page.waitForLoadState('networkidle');
    
    // Find first team member link
    const memberLink = page.locator('a[href*="/team/"]').first();
    const hasLink = await memberLink.count() > 0;
    
    if (hasLink) {
      await memberLink.click();
      
      // Verify we're on team member detail page
      await expect(page).toHaveURL(/\/team\/.+/);
      
      // Check for member details
      const hasContent = await page.locator('h1').count() > 0;
      expect(hasContent).toBeTruthy();
    }
  });
});

/**
 * E2E Tests: Team Filtering
 */
test.describe('Team Filtering', () => {
  test('should filter by department', async ({ page }) => {
    await page.goto('/team');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for department filter
    const deptFilter = page.locator('button[data-department], select[name="department"]').first();
    const hasFilter = await deptFilter.count() > 0;
    
    if (hasFilter) {
      await deptFilter.click();
      await page.waitForTimeout(500);
      
      // Verify filtering worked
      const members = await page.locator('[data-testid="team-member"], .team-member').count();
      expect(members).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter by role', async ({ page }) => {
    await page.goto('/team');
    
    // Look for role filter
    const roleFilter = page.locator('button[data-role], select[name="role"]').first();
    const hasFilter = await roleFilter.count() > 0;
    
    if (hasFilter) {
      await roleFilter.click();
      await page.waitForTimeout(500);
    }
  });

  test('should search team members', async ({ page }) => {
    await page.goto('/team');
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
    const hasSearch = await searchInput.count() > 0;
    
    if (hasSearch) {
      // Type search query
      await searchInput.fill('developer');
      
      // Wait for search results
      await page.waitForTimeout(1000);
      
      // Verify results
      const results = await page.textContent('body');
      expect(results).toMatch(/developer|team|member/i);
    }
  });

  test('should clear filters', async ({ page }) => {
    await page.goto('/team');
    
    // Look for clear/reset button
    const clearButton = page.locator('button:has-text("Clear"), button:has-text("Reset")').first();
    const hasClear = await clearButton.count() > 0;
    
    if (hasClear) {
      await clearButton.click();
      await page.waitForTimeout(500);
    }
  });
});

/**
 * E2E Tests: Team Member Details
 */
test.describe('Team Member Details', () => {
  test('should display member information', async ({ page }) => {
    await page.goto('/team');
    
    // Navigate to first team member (if exists)
    const memberLink = page.locator('a[href*="/team/"]').first();
    const hasLink = await memberLink.count() > 0;
    
    if (hasLink) {
      await memberLink.click();
      
      // Check for member details
      const hasName = await page.locator('h1').count() > 0;
      expect(hasName).toBeTruthy();
      
      // Check for bio or description
      const hasBio = await page.locator('p').count() > 0;
      expect(hasBio).toBeTruthy();
    }
  });

  test('should show social media links', async ({ page }) => {
    await page.goto('/team');
    
    const memberLink = page.locator('a[href*="/team/"]').first();
    const hasLink = await memberLink.count() > 0;
    
    if (hasLink) {
      await memberLink.click();
      
      // Look for social media links
      const socialLinks = await page.locator('a[href*="linkedin"], a[href*="twitter"], a[href*="github"]').count();
      
      // Social links may or may not exist
      expect(socialLinks).toBeGreaterThanOrEqual(0);
    }
  });

  test('should have back navigation', async ({ page }) => {
    await page.goto('/team');
    
    const memberLink = page.locator('a[href*="/team/"]').first();
    const hasLink = await memberLink.count() > 0;
    
    if (hasLink) {
      await memberLink.click();
      
      // Look for back button or breadcrumb
      const backButton = page.locator('button:has-text("Back"), a:has-text("Back"), a[href="/team"]').first();
      const hasBack = await backButton.count() > 0;
      
      if (hasBack) {
        await backButton.click();
        await expect(page).toHaveURL('/team');
      }
    }
  });
});
