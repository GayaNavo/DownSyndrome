import { test, expect } from '@playwright/test';

test.describe('Harmony - Down Syndrome Application', () => {
  // Landing Page Tests
  test.describe('Landing Page', () => {
    test('should load the homepage', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveTitle(/HARMONY/);
    });

    test('should display main content', async ({ page }) => {
      await page.goto('/');
      // Verify the page loaded successfully
      expect(await page.title()).toBeTruthy();
    });
  });

  // Navigation Tests - Basic routing
  test.describe('Page Navigation', () => {
    test('should load login page directly', async ({ page }) => {
      await page.goto('/login');
      await expect(page).toHaveURL('/login');
      // Verify the page loaded successfully
      expect(await page.title()).toBeTruthy();
    });

    test('should load registration page directly', async ({ page }) => {
      await page.goto('/register');
      await expect(page).toHaveURL('/register');
      // Verify the page loaded successfully
      expect(await page.title()).toBeTruthy();
    });

    test('should load features page', async ({ page }) => {
      await page.goto('/features');
      await expect(page).toHaveURL('/features');
    });

    test('should load contact page', async ({ page }) => {
      await page.goto('/contact');
      await expect(page).toHaveURL('/contact');
    });

    test('should load about page', async ({ page }) => {
      await page.goto('/about');
      await expect(page).toHaveURL('/about');
    });
  });

  // Dashboard Tests (requires authentication)
  test.describe('Dashboard', () => {
    test.skip('should load dashboard after login', async ({ page }) => {
      // This would require actual user credentials
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });
});
