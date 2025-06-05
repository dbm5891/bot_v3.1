# Frontend Testing Best Practices Guide

## Overview

This guide outlines best practices for testing the Bot v3.1 frontend application. Following these practices ensures high-quality, maintainable, and accessible code.

## Table of Contents

1. [Test Organization](#test-organization)
2. [Testing Utilities](#testing-utilities)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [Accessibility Testing](#accessibility-testing)
6. [Performance Testing](#performance-testing)
7. [Common Patterns](#common-patterns)
8. [Debugging Tests](#debugging-tests)

## Test Organization

### File Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   └── __tests__/
│   │       └── Button.test.tsx
├── pages/
│   ├── Dashboard.tsx
│   └── __tests__/
│       ├── Dashboard.test.tsx
│       ├── DashboardInteractions.test.tsx
│       └── DashboardAccessibility.test.tsx
└── utils/
    ├── testUtils.tsx    # Test utilities
    └── mockData.ts      # Mock data generators
```

### Naming Conventions

- Test files: `ComponentName.test.tsx`
- Test suites: Use descriptive names that explain what's being tested
- Test cases: Start with "should" or use behavior-driven descriptions

```typescript
describe('Dashboard', () => {
  it('should display loading state when data is being fetched', () => {
    // test implementation
  });

  it('navigates to strategies page when clicking on strategies card', () => {
    // test implementation
  });
});
```

## Testing Utilities

### Custom Render Function

Always use the custom `render` function from `testUtils.tsx`:

```typescript
import { render, screen, waitFor } from '../../utils/testUtils';
import DashboardPage from '../DashboardPage';

test('renders dashboard', () => {
  render(<DashboardPage />);
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
});
```

### Mock Data Generators

Use consistent mock data generators:

```typescript
import { createMockStrategy, createMockBacktestResult } from '../../utils/testUtils';

const mockStrategy = createMockStrategy({
  name: 'Custom Strategy',
  roi: 15.5
});
```

## Unit Testing

### Component Testing

1. **Test Component Behavior, Not Implementation**

```typescript
// ❌ Bad - Testing implementation details
test('should call setState', () => {
  const component = shallow(<Button />);
  component.instance().setState({ clicked: true });
  expect(component.state('clicked')).toBe(true);
});

// ✅ Good - Testing behavior
test('should display success message when clicked', async () => {
  const user = userEvent.setup();
  render(<Button />);
  
  await user.click(screen.getByRole('button'));
  expect(screen.getByText('Success!')).toBeInTheDocument();
});
```

2. **Test User Interactions**

```typescript
import userEvent from '@testing-library/user-event';

test('should update input value when typing', async () => {
  const user = userEvent.setup();
  render(<SearchInput />);
  
  const input = screen.getByRole('textbox');
  await user.type(input, 'test query');
  
  expect(input).toHaveValue('test query');
});
```

3. **Test Async Operations**

```typescript
test('should load data on mount', async () => {
  render(<DataTable />);
  
  // Wait for loading to finish
  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
  
  // Check data is displayed
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
});
```

### Redux Store Testing

1. **Mock the Store Properly**

```typescript
test('should dispatch action on button click', async () => {
  const { store } = render(<StrategyList />, {
    initialState: {
      strategy: {
        strategies: [createMockStrategy()],
        loading: false,
        error: null
      }
    }
  });
  
  const user = userEvent.setup();
  await user.click(screen.getByText('Add Strategy'));
  
  const actions = store.getActions();
  expect(actions).toContainEqual(
    expect.objectContaining({ type: 'strategy/add' })
  );
});
```

## Integration Testing

### Page-Level Testing

Test complete user flows:

```typescript
describe('Strategy Creation Flow', () => {
  test('should create a new strategy', async () => {
    const user = userEvent.setup();
    const { store } = render(<App />);
    
    // Navigate to strategies
    await user.click(screen.getByText('Strategies'));
    
    // Click create button
    await user.click(screen.getByText('Create Strategy'));
    
    // Fill form
    await user.type(screen.getByLabelText('Strategy Name'), 'My Strategy');
    await user.selectOptions(screen.getByLabelText('Type'), 'custom');
    
    // Submit
    await user.click(screen.getByText('Save'));
    
    // Verify navigation
    await waitFor(() => {
      expect(screen.getByText('Strategy created successfully')).toBeInTheDocument();
    });
  });
});
```

## Accessibility Testing

### Automated Testing

```typescript
import { axe } from 'jest-axe';

test('should not have accessibility violations', async () => {
  const { container } = render(<DashboardPage />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Testing Checklist

- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen reader announces content properly
- [ ] Color contrast meets WCAG standards
- [ ] Focus indicators are visible
- [ ] Error messages are associated with form fields
- [ ] Images have appropriate alt text

### ARIA Testing

```typescript
test('should have proper ARIA labels', () => {
  render(<Navigation />);
  
  const nav = screen.getByRole('navigation');
  expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  
  const menuButton = screen.getByRole('button', { name: /menu/i });
  expect(menuButton).toHaveAttribute('aria-expanded', 'false');
});
```

## Performance Testing

### Component Render Performance

```typescript
import { measureRenders } from './testUtils';

test('should not re-render unnecessarily', () => {
  const { rerender, getRenderCount } = measureRenders(<ExpensiveComponent />);
  
  expect(getRenderCount()).toBe(1);
  
  // Trigger a prop that shouldn't cause re-render
  rerender(<ExpensiveComponent irrelevantProp="new" />);
  
  expect(getRenderCount()).toBe(1);
});
```

### Bundle Size Testing

Monitor component bundle sizes:

```typescript
test('should not exceed size limit', async () => {
  const stats = await import('./component-stats.json');
  const componentSize = stats['DashboardPage'].size;
  
  expect(componentSize).toBeLessThan(50 * 1024); // 50KB
});
```

## Common Patterns

### Testing Loading States

```typescript
test('should show loading skeleton', () => {
  render(<DataTable />, {
    initialState: {
      data: {
        loading: true,
        items: []
      }
    }
  });
  
  expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
});
```

### Testing Error States

```typescript
test('should display error message', () => {
  render(<DataTable />, {
    initialState: {
      data: {
        loading: false,
        error: 'Failed to fetch data'
      }
    }
  });
  
  expect(screen.getByRole('alert')).toHaveTextContent('Failed to fetch data');
});
```

### Testing Forms

```typescript
test('should validate form inputs', async () => {
  const user = userEvent.setup();
  render(<StrategyForm />);
  
  // Submit empty form
  await user.click(screen.getByText('Submit'));
  
  // Check validation messages
  expect(screen.getByText('Name is required')).toBeInTheDocument();
  
  // Fix validation
  await user.type(screen.getByLabelText('Name'), 'Test Strategy');
  await user.click(screen.getByText('Submit'));
  
  expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
});
```

## Debugging Tests

### Debugging Tools

1. **Screen Debug**

```typescript
test('debugging example', () => {
  render(<ComplexComponent />);
  
  // Print the DOM
  screen.debug();
  
  // Print specific element
  screen.debug(screen.getByRole('button'));
});
```

2. **Using Testing Playground**

```typescript
// Prints a URL to open in Testing Playground
screen.logTestingPlaygroundURL();
```

3. **Waiting for Elements**

```typescript
// Use findBy for async elements
const element = await screen.findByText('Loaded Data');

// Use waitFor for complex conditions
await waitFor(() => {
  expect(screen.getAllByRole('row')).toHaveLength(10);
});
```

### Common Issues and Solutions

1. **"Unable to find element"**
   - Check if element is rendered conditionally
   - Use appropriate query (getBy vs queryBy vs findBy)
   - Check for timing issues with async rendering

2. **"Not wrapped in act(...)"**
   - Usually indicates an async update after test completes
   - Use `waitFor` or `findBy` queries
   - Ensure all promises are resolved

3. **Flaky Tests**
   - Replace fixed timeouts with `waitFor`
   - Mock timers when testing time-dependent behavior
   - Ensure proper cleanup between tests

## Best Practices Summary

1. **Write tests from the user's perspective**
2. **Keep tests simple and focused**
3. **Use semantic queries** (getByRole, getByLabelText)
4. **Test behavior, not implementation**
5. **Mock external dependencies**
6. **Ensure tests are deterministic**
7. **Write descriptive test names**
8. **Group related tests**
9. **Test accessibility**
10. **Maintain test coverage above 80%**

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test Dashboard.test.tsx

# Run tests matching pattern
npm test -- --grep "should display"
```

## Continuous Integration

Ensure tests run in CI:

```yaml
# .github/workflows/test.yml
name: Frontend Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm test -- --coverage
      - run: npm run lint
``` 