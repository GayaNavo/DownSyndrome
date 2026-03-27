# Playwright E2E Testing Guide

## Setup

### Install Playwright Browsers
```bash
npx playwright install
```

This will install Chromium, Firefox, and WebKit browsers for testing.

## Running Tests

### Basic Commands
```bash
# Run all tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# View HTML report
npm run test:e2e:report
```

### Direct Playwright Commands
```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test e2e/example.spec.ts

# Run by test name pattern
npx playwright test -g "Landing Page"

# Run specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run in debug mode
npx playwright test --debug

# Run with trace
npx playwright test --trace on
```

## Test Files

### `e2e/example.spec.ts`
Basic navigation and authentication tests:
- Landing page tests
- Authentication navigation
- Dashboard access (skipped - requires auth)
- Navigation to About, Features, Contact pages

### `e2e/features.spec.ts`
Feature-specific tests for dashboard functionality:
- AI Detection feature
- Children management
- Progress tracking
- Documents management
- User profile
- Settings page

## Configuration

The `playwright.config.ts` includes:
- **Base URL**: `http://localhost:3000`
- **Auto-start dev server**: Yes (port 3000)
- **Parallel execution**: Enabled
- **Retry on CI**: 2 retries
- **Browsers**: Chromium, Firefox, WebKit
- **Reporter**: HTML

## Writing New Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/some-page');
  });

  test('should do something', async ({ page }) => {
    // Navigate or interact
    await page.click('button[name="Submit"]');
    
    // Assert
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

### Common Patterns

#### Clicking buttons
```typescript
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByText('Click me').click();
```

#### Filling forms
```typescript
await page.getByLabel('Email').fill('user@example.com');
await page.getByPlaceholder('Enter name').fill('John Doe');
```

#### Navigation
```typescript
await page.goto('/dashboard');
await page.click('a[href="/settings"]');
```

#### Assertions
```typescript
await expect(page).toHaveTitle(/Harmony/);
await expect(page).toHaveURL('/dashboard');
await expect(page.getByText('Welcome')).toBeVisible();
await expect(page.getByRole('button')).toBeEnabled();
```

## Debugging Tests

### Using UI Mode
```bash
npm run test:e2e:ui
```
This opens an interactive UI where you can:
- Run individual tests
- See test execution in real-time
- Inspect the DOM
- View console logs

### Debug Mode
```bash
npx playwright test --debug
```
Opens each test in a browser with DevTools automatically open.

### Tracing
When tests fail, traces are automatically collected. View them with:
```bash
npx playwright show-trace
```

## CI/CD Integration

Playwright is configured to work with GitHub Actions. The workflow file is at:
`.github/workflows/playwright.yml`

CI-specific behavior:
- Runs tests in parallel with 1 worker
- Retries failed tests 2 times
- Forbids `test.only()` usage

## Best Practices

1. **Use descriptive test names**
   ```typescript
   test('should load dashboard after successful login', async ({ page }) => {
     // ...
   });
   ```

2. **Group related tests**
   ```typescript
   test.describe('Authentication', () => {
     // Related auth tests
   });
   ```

3. **Use beforeEach for common setup**
   ```typescript
   test.beforeEach(async ({ page }) => {
     await page.goto('/dashboard');
   });
   ```

4. **Prefer user-facing selectors**
   ```typescript
   // Good
   page.getByRole('button', { name: 'Submit' })
   
   // Avoid
   page.locator('.btn-primary')
   ```

5. **Add proper assertions**
   Always verify the expected outcome of your tests.

## Troubleshooting

### Tests timeout
Increase timeout in config or for specific test:
```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ...
});
```

### Element not found
Make sure the page has loaded:
```typescript
await page.waitForLoadState('networkidle');
await expect(page.getByText('Expected')).toBeVisible();
```

### Dev server issues
The config auto-starts the dev server. If issues occur:
1. Start manually: `npm run dev`
2. Comment out `webServer` in config
3. Run tests against running server

## Next Steps

To enhance your test suite:
1. Add authentication helpers for logged-in tests
2. Create test data fixtures
3. Add visual regression testing
4. Implement API mocking for faster tests
5. Add accessibility testing
