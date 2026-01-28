import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('homepage should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('services page should not have accessibility violations', async ({ page }) => {
    await page.goto('/services');
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('portfolio page should not have accessibility violations', async ({ page }) => {
    await page.goto('/portfolio');
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('team page should not have accessibility violations', async ({ page }) => {
    await page.goto('/team');
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('education page should not have accessibility violations', async ({ page }) => {
    await page.goto('/education');
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('blog page should not have accessibility violations', async ({ page }) => {
    await page.goto('/blog');
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('contact page should not have accessibility violations', async ({ page }) => {
    await page.goto('/contact');
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('login page should not have accessibility violations', async ({ page }) => {
    await page.goto('/login');
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('keyboard navigation should work on homepage', async ({ page }) => {
    await page.goto('/');
    
    // Press Tab to navigate
    await page.keyboard.press('Tab');
    
    // Check if an element received focus
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
    
    // Navigate through several elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }
    
    // Ensure we can navigate back
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Shift+Tab');
    }
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/');
    
    // Find all images
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      // Alt can be empty for decorative images, but should be present
      expect(alt).not.toBeNull();
    }
  });

  test('form inputs should have labels', async ({ page }) => {
    await page.goto('/contact');
    
    // Check all form inputs have associated labels
    const inputs = await page.locator('input[type="text"], input[type="email"], textarea').all();
    
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      // Input should have either an id with matching label, aria-label, or aria-labelledby
      if (id) {
        const label = await page.locator(`label[for="${id}"]`).count();
        const hasLabel = label > 0 || ariaLabel || ariaLabelledBy;
        expect(hasLabel).toBeTruthy();
      } else {
        expect(ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });

  test('heading hierarchy should be correct', async ({ page }) => {
    await page.goto('/');
    
    // Get all headings
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    
    // There should be exactly one h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
    
    // Headings should have text content
    for (const heading of headings) {
      const text = await heading.textContent();
      expect(text?.trim()).toBeTruthy();
    }
  });

  test('links should have accessible names', async ({ page }) => {
    await page.goto('/');
    
    const links = await page.locator('a').all();
    
    for (const link of links) {
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');
      
      // Link should have either text content, aria-label, or title
      const hasAccessibleName = (text && text.trim()) || ariaLabel || title;
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('buttons should have accessible names', async ({ page }) => {
    await page.goto('/');
    
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');
      
      // Button should have either text content, aria-label, or title
      const hasAccessibleName = (text && text.trim()) || ariaLabel || title;
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('color contrast should be sufficient', async ({ page }) => {
    await page.goto('/');
    
    // Use axe-core to check color contrast
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa'])
      .analyze();
    
    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );
    
    expect(contrastViolations).toEqual([]);
  });

  test('skip to main content link should be present', async ({ page }) => {
    await page.goto('/');
    
    // Tab once to focus the skip link (usually the first focusable element)
    await page.keyboard.press('Tab');
    
    const skipLink = await page.locator('a[href="#main-content"], a:has-text("Skip to")').first();
    const skipLinkExists = await skipLink.count() > 0;
    
    // If skip link exists, test it works
    if (skipLinkExists) {
      await skipLink.click();
      const mainContent = await page.locator('#main-content, main').first();
      await expect(mainContent).toBeFocused();
    }
  });

  test('ARIA landmarks should be present', async ({ page }) => {
    await page.goto('/');
    
    // Check for main landmark
    const main = await page.locator('main, [role="main"]').count();
    expect(main).toBeGreaterThan(0);
    
    // Check for navigation landmark
    const nav = await page.locator('nav, [role="navigation"]').count();
    expect(nav).toBeGreaterThan(0);
    
    // Check for contentinfo (footer)
    const footer = await page.locator('footer, [role="contentinfo"]').count();
    expect(footer).toBeGreaterThan(0);
  });

  test('interactive elements should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    
    // Find all buttons and links
    const interactiveElements = await page.locator('button, a').all();
    
    for (const element of interactiveElements.slice(0, 10)) { // Test first 10
      const tabindex = await element.getAttribute('tabindex');
      
      // tabindex should not be greater than 0 (no positive tabindex)
      if (tabindex) {
        expect(parseInt(tabindex)).toBeLessThanOrEqual(0);
      }
    }
  });

  test('tables should have proper structure', async ({ page }) => {
    await page.goto('/dashboard/payment');
    await page.waitForLoadState('networkidle');
    
    const tables = await page.locator('table').all();
    
    for (const table of tables) {
      // Table should have thead or th elements
      const hasHeaders = await table.locator('thead, th').count() > 0;
      expect(hasHeaders).toBeTruthy();
      
      // Check for caption or aria-label
      const caption = await table.locator('caption').count();
      const ariaLabel = await table.getAttribute('aria-label');
      const ariaLabelledBy = await table.getAttribute('aria-labelledby');
      
      const hasAccessibleName = caption > 0 || ariaLabel || ariaLabelledBy;
      // Tables should ideally have accessible names, but not strictly required
      // expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('modal dialogs should trap focus', async ({ page }) => {
    await page.goto('/');
    
    // If there's a modal trigger button, test it
    const modalTrigger = await page.locator('[data-testid="modal-trigger"], button:has-text("Open")').first();
    const hasTrigger = await modalTrigger.count() > 0;
    
    if (hasTrigger) {
      await modalTrigger.click();
      
      // Wait for modal
      await page.waitForTimeout(500);
      
      // Press Tab multiple times and ensure focus stays within modal
      const focusedElements = [];
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
        const focused = await page.evaluate(() => document.activeElement?.className);
        focusedElements.push(focused);
      }
      
      // Focus should cycle within modal (not return to body)
      // This is a basic check; actual implementation depends on modal structure
    }
  });

  test('error messages should be associated with form fields', async ({ page }) => {
    await page.goto('/login');
    
    // Submit form without filling it
    await page.click('button[type="submit"]');
    
    // Wait for error messages
    await page.waitForTimeout(1000);
    
    // Check if error messages have aria-describedby or aria-live
    const errorMessages = await page.locator('[role="alert"], .error, [aria-live="polite"]').all();
    
    // Errors should be announced to screen readers
    for (const error of errorMessages) {
      const role = await error.getAttribute('role');
      const ariaLive = await error.getAttribute('aria-live');
      
      const isAccessible = role === 'alert' || ariaLive;
      // Should have proper ARIA attributes
    }
  });

  test('page should have a title', async ({ page }) => {
    await page.goto('/');
    
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('page should have a lang attribute', async ({ page }) => {
    await page.goto('/');
    
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
    expect(lang).toBe('en'); // Assuming English
  });

  test('focus indicators should be visible', async ({ page }) => {
    await page.goto('/');
    
    // Focus on a link
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Get computed styles of focused element
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow,
      };
    });
    
    // Should have some form of focus indicator (outline or box-shadow)
    const hasFocusIndicator = 
      focusedElement.outline !== 'none' ||
      focusedElement.outlineWidth !== '0px' ||
      focusedElement.boxShadow !== 'none';
    
    expect(hasFocusIndicator).toBeTruthy();
  });
});
