import { test, expect } from '@playwright/test';

test.describe('AI Detection Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to AI detection page
    await page.goto('/dashboard/ai-detection');
  });

  test('should load AI detection page', async ({ page }) => {
    await expect(page).toHaveURL(/\/ai-detection/);
    // Look for the main heading
    await expect(page.getByRole('heading', { name: 'Smart Analysis Module' })).toBeVisible();
  });

  test('should have upload button or area', async ({ page }) => {
    // Check for file upload interface - either the label or text describing upload
    const uploadText = page.getByText(/upload|drag.*drop|click.*upload/i);
    await expect(uploadText.first()).toBeVisible();
  });
});

test.describe('Children Management', () => {
  test('should load children page', async ({ page }) => {
    await page.goto('/dashboard/children');
    await expect(page).toHaveURL(/\/children/);
  });

  test('should display add child form', async ({ page }) => {
    await page.goto('/dashboard/children');
    
    const addButton = page.getByRole('button', { name: /add|new|create/i });
    await expect(addButton).toBeVisible();
  });
});

test.describe('Progress Tracking', () => {
  test('should load progress page', async ({ page }) => {
    await page.goto('/dashboard/progress');
    await expect(page).toHaveURL(/\/progress/);
  });

  test('should display progress content', async ({ page }) => {
    await page.goto('/dashboard/progress');
    // Look for any progress-related content - charts, tables, or text
    const progressContent = page.getByText(/progress|development|milestone|chart|graph/i);
    await expect(progressContent.first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Documents Management', () => {
  test('should load documents page', async ({ page }) => {
    await page.goto('/dashboard/documents');
    await expect(page).toHaveURL(/\/documents/);
  });

  test('should have document management interface', async ({ page }) => {
    await page.goto('/dashboard/documents');
    
    // Look for documents-related content - could be upload button, file list, or heading
    const docsContent = page.getByText(/document|file|record|upload/i)
      .or(page.locator('input[type="file"]'));
    await expect(docsContent.first()).toBeVisible();
  });
});

test.describe('User Profile', () => {
  test('should load profile page', async ({ page }) => {
    await page.goto('/dashboard/profile');
    await expect(page).toHaveURL(/\/profile/);
  });

  test('should display user information', async ({ page }) => {
    await page.goto('/dashboard/profile');
    
    // Look for profile-related elements
    const profileSection = page.getByText(/profile|user|account/i);
    await expect(profileSection.first()).toBeVisible();
  });
});

test.describe('Settings Page', () => {
  test('should load settings page', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await expect(page).toHaveURL(/\/settings/);
  });

  test('should have settings content', async ({ page }) => {
    await page.goto('/dashboard/settings');
    
    // Look for settings-related elements - forms, inputs, or settings text
    const settingsContent = page.getByText(/setting|preference|profile|account|option/i)
      .or(page.locator('input, select, button[type="submit"]'));
    await expect(settingsContent.first()).toBeVisible();
  });
});
