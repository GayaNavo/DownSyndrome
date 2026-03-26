# Front-End Testing Setup Guide

## Overview
Your Next.js application now has comprehensive front-end testing capabilities using **React Testing Library** and **Jest**.

## What's Been Set Up

### 1. Dependencies Installed
- `@testing-library/react` - React DOM testing utilities
- `@testing-library/jest-dom` - Custom Jest matchers for DOM testing
- `@testing-library/user-event` - User interaction simulation
- `jsdom` - Browser-like environment for Node.js
- `jest-environment-jsdom` - Jest environment for jsdom
- `identity-obj-proxy` - CSS modules mocking

### 2. Configuration Files

#### Jest Configuration (`jest.config.js`)
Updated to support:
- React/JSX testing with `jsdom` environment
- CSS modules handling
- Next.js router mocking
- TypeScript support

#### Test Setup File (`__tests__/setup.ts`)
Mocks browser APIs:
- `window.matchMedia`
- `Element.prototype.scrollIntoView`
- `IntersectionObserver`

### 3. Mock Utilities

#### Firebase Mocks (`__tests__/__mocks__/firebaseMocks.ts`)
- Mocks Firebase authentication
- Mocks Firestore database operations

#### Router Mock (`__tests__/__mocks__/nextRouterMock.ts`)
- Creates mock Next.js router
- Simulates navigation functions

#### Auth Provider Wrapper (`__tests__/utils/Providers.tsx`)
- Wraps components with AuthContext
- Provides consistent provider setup

### 4. Sample Component Tests

#### AppHeader.test.tsx ✅ (All tests passing)
Tests for:
- Header rendering with logo
- Navigation links (logged in vs logged out)
- Sign in/out functionality
- User welcome message

#### LoginPage.test.tsx ⚠️ (Some tests need adjustment)
Tests for:
- Login form rendering
- Email/password authentication
- Google sign-in integration
- Password visibility toggle
- Loading states

#### AddChildForm.test.tsx ⚠️ (Some tests need adjustment)
Tests for:
- Child information form
- Creating new child documents
- Updating existing child data
- Form validation

## Running Tests

### Available Scripts

```bash
# Run all tests
npm run test

# Run only component/front-end tests
npm run test:frontend

# Run only specific component tests
npm run test:components

# Watch mode (auto-reload on changes)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Generate HTML coverage report
npm run test:html
```

### Run Specific Test Files

```bash
# Run only AppHeader tests
npm run test:frontend -- AppHeader.test.tsx

# Run only LoginPage tests
npm run test:frontend -- LoginPage.test.tsx

# Run only AddChildForm tests
npm run test:frontend -- AddChildForm.test.tsx
```

## Test Results Summary

✅ **AppHeader** - 12 tests passing
⚠️ **LoginPage** - Some tests need text matcher adjustments
⚠️ **AddChildForm** - Some tests need text matcher adjustments

## Writing New Tests

### Basic Component Test Structure

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';
import { useAuth } from '@/contexts/AuthContext';

// Mock contexts
jest.mock('@/contexts/AuthContext');

describe('MyComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: { uid: 'test-user', email: 'test@example.com' },
      loading: false,
    });
  });

  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    render(<MyComponent />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    await waitFor(() => {
      expect(mockFunction).toHaveBeenCalled();
    });
  });
});
```

### Common Testing Patterns

#### 1. Testing with Authentication
```typescript
(useAuth as jest.Mock).mockReturnValue({
  currentUser: null, // or user object
  loading: false,
});
```

#### 2. Testing Async Operations
```typescript
await waitFor(() => {
  expect(mockApiCall).toHaveBeenCalled();
});
```

#### 3. Testing Form Submission
```typescript
fireEvent.change(input, { target: { value: 'test' } });
fireEvent.click(submitButton);
```

#### 4. Testing Navigation
```typescript
const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({
  push: mockPush,
});
```

## Best Practices

1. **Use semantic queries** - Prefer `getByRole`, `getByLabelText` over `getByText`
2. **Test user behavior** - Focus on how users interact with components
3. **Mock external dependencies** - Firebase, API calls, contexts
4. **Keep tests isolated** - Clear mocks between tests
5. **Use async/await** - For asynchronous operations
6. **Test edge cases** - Empty states, errors, loading states

## Troubleshooting

### "React is not defined" Error
Fixed by updating Jest config to use `jsx: 'react-jsx'`

### Multiple Elements Found
Use more specific queries:
```typescript
// Instead of getByText
screen.getByRole('button', { name: /^sign in$/i })
```

### Firebase/Analytics Warnings
These are expected in test environment and can be ignored

## Next Steps

1. **Fix remaining test failures** - Adjust text matchers in LoginPage and AddChildForm tests
2. **Add more component tests** - Cover remaining components (DashboardPage, RegistrationPage, etc.)
3. **Add integration tests** - Test complete user flows
4. **Set up CI/CD** - Run tests automatically on commits
5. **Increase coverage** - Aim for >80% code coverage

## Additional Resources

- [React Testing Library Docs](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)
- [Testing Library Queries](https://testing-library.com/docs/dom-testing-library/api-queries/)
- [Common Matchers](https://testing-library.com/docs/ecosystem-jest-dom/)
