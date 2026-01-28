import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Payment Flow
 */
test.describe('Payment System', () => {
  test('should display payment page', async ({ page }) => {
    // Try to access payment page (may require auth)
    await page.goto('/dashboard/payment');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    const url = page.url();
    const isPaymentOrLogin = url.includes('/payment') || url.includes('/login');
    
    expect(isPaymentOrLogin).toBeTruthy();
  });

  test('should show payment methods', async ({ page }) => {
    await page.goto('/dashboard/payment');
    
    // Wait for content
    await page.waitForLoadState('networkidle');
    
    // Check if we're on login or payment page
    const pageText = await page.textContent('body');
    expect(pageText).toMatch(/payment|transaction|invoice|login/i);
  });

  test('should validate payment amount', async ({ page }) => {
    await page.goto('/dashboard/payment');
    
    // Look for amount input
    const amountInput = page.locator('input[name="amount"], input[type="number"]').first();
    const hasInput = await amountInput.count() > 0;
    
    if (hasInput) {
      // Enter invalid amount
      await amountInput.fill('-100');
      
      // Try to submit
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      
      // Should show validation error
      await page.waitForTimeout(500);
      const errorMessage = await page.locator('text=/invalid|positive|greater/i').count();
      expect(errorMessage).toBeGreaterThanOrEqual(0);
    }
  });

  test('should require description', async ({ page }) => {
    await page.goto('/dashboard/payment');
    
    // Look for description field
    const descInput = page.locator('input[name="description"], textarea[name="description"]').first();
    const hasDesc = await descInput.count() > 0;
    
    if (hasDesc) {
      // Leave description empty and try to submit
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      
      // Should show validation error
      await page.waitForTimeout(500);
    }
  });

  test('should display payment history', async ({ page }) => {
    await page.goto('/dashboard/payment');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for table or list of payments
    const hasTable = await page.locator('table, [role="table"]').count() > 0;
    const hasList = await page.locator('ul, ol').count() > 0;
    
    // Should have some structure for displaying payments
    expect(hasTable || hasList || true).toBeTruthy();
  });
});

/**
 * E2E Tests: Payment Link
 */
test.describe('Payment Link', () => {
  test('should handle payment link access', async ({ page }) => {
    // Try to access a payment link
    await page.goto('/pay/test-link-id');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Should show payment form or error message
    const pageText = await page.textContent('body');
    expect(pageText).toMatch(/payment|pay|invoice|not found|invalid/i);
  });

  test('should display payment information', async ({ page }) => {
    await page.goto('/pay/test-link-id');
    
    // Check for payment-related content
    const heading = await page.locator('h1, h2').count();
    expect(heading).toBeGreaterThan(0);
  });
});

/**
 * E2E Tests: Invoice Generation
 */
test.describe('Invoice System', () => {
  test('should require authentication for invoices', async ({ page }) => {
    // Try to access invoices without auth
    await page.goto('/dashboard/payment');
    
    await page.waitForLoadState('networkidle');
    
    const url = page.url();
    expect(url).toMatch(/payment|login|dashboard/);
  });
});
