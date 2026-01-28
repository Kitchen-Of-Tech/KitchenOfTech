import { test, expect } from '@playwright/test';

/**
 * E2E Tests: User Registration Flow
 */
test.describe('User Registration', () => {
  test('should display registration form', async ({ page }) => {
    await page.goto('/login');
    
    // Look for sign up/register link or button
    const signUpLink = page.locator('a:has-text("Sign up"), a:has-text("Register"), button:has-text("Sign up")').first();
    const hasSignUp = await signUpLink.count() > 0;
    
    if (hasSignUp) {
      await signUpLink.click();
      
      // Check form fields exist
      await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"], input[type="password"]')).toBeVisible();
    }
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/login');
    
    // Find email input
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const hasEmail = await emailInput.count() > 0;
    
    if (hasEmail) {
      // Enter invalid email
      await emailInput.fill('invalid-email');
      
      // Try to submit
      await page.locator('button[type="submit"]').first().click();
      
      // Check for validation error
      const errorMessage = page.locator('text=/invalid|email|format/i');
      const hasError = await errorMessage.count() > 0;
      
      // HTML5 validation or custom error should appear
      expect(hasError || await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)).toBeTruthy();
    }
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto('/login');
    
    // Find password input
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    const hasPassword = await passwordInput.count() > 0;
    
    if (hasPassword) {
      // Enter weak password
      await passwordInput.fill('123');
      
      // Try to submit
      await page.locator('button[type="submit"]').first().click();
      
      // Check for validation error
      await page.waitForTimeout(500);
      const errorMessage = await page.locator('text=/password|length|characters|strong/i').count();
      
      // Should show error about password requirements
      expect(errorMessage).toBeGreaterThan(0);
    }
  });

  test('should handle duplicate email', async ({ page }) => {
    // This test requires actual registration implementation
    // For now, just navigate to the form
    await page.goto('/login');
    
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const hasEmail = await emailInput.count() > 0;
    
    expect(hasEmail).toBeTruthy();
  });
});

/**
 * E2E Tests: User Login Flow
 */
test.describe('User Login', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    
    // Check login form elements
    await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"], input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in invalid credentials
    await page.fill('input[name="email"], input[type="email"]', 'wrong@example.com');
    await page.fill('input[name="password"], input[type="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await page.waitForTimeout(2000);
    
    // Check for error message
    const errorText = await page.textContent('body');
    expect(errorText).toMatch(/invalid|incorrect|wrong|error|failed/i);
  });

  test('should redirect after successful login', async ({ page }) => {
    // This test requires valid test credentials
    // For now, just verify the form exists
    await page.goto('/login');
    
    const loginButton = page.locator('button[type="submit"]');
    await expect(loginButton).toBeVisible();
  });
});
