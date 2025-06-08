# Cypress E2E Testing Quick Start

## Installation

First, install Cypress and its dependencies:

```bash
cd frontend
npm install --save-dev cypress @testing-library/cypress cypress-axe start-server-and-test
```

## Initial Setup

1. **Open Cypress for the first time:**
   ```bash
   npx cypress open
   ```
   This will create the Cypress folder structure and example tests.

2. **Choose E2E Testing** when prompted.

3. **Select your browser** (Chrome recommended).

4. **Create your first test** by clicking "Create new spec".

## Running Tests

### Interactive Mode (with UI)
```bash
npm run cypress:open
# or
npm run test:e2e:watch
```

### Headless Mode (CI/CD)
```bash
npm run test:e2e
# or
npm run cypress:run
```

### With Dev Server
```bash
npm run cypress:ci
```
This will start the dev server and run tests automatically.

## Adding data-testid Attributes

To make your tests more reliable, add `data-testid` attributes to key elements:

```tsx
// Example in DashboardPage.tsx
<Card data-testid="total-strategies-card">
  <CardContent>
    <Typography>Total Strategies</Typography>
    <Typography data-testid="strategies-count">{strategies.length}</Typography>
  </CardContent>
</Card>
```

## Writing Your First Test

1. Create a new test file: `cypress/e2e/my-first-test.cy.ts`

2. Write a simple test:
```typescript
describe('My First Test', () => {
  it('visits the dashboard', () => {
    cy.visit('/');
    cy.contains('Bot v3.1 Trading').should('be.visible');
  });
});
```

3. Run the test:
```bash
npm run cypress:open
```

## Common Testing Patterns

### API Mocking
```typescript
cy.intercept('GET', '/api/strategies', { fixture: 'strategies.json' }).as('getStrategies');
cy.wait('@getStrategies');
```

### Element Selection
```typescript
// By text
cy.contains('Submit').click();

// By data-testid
cy.get('[data-testid="submit-button"]').click();

// By role
cy.get('button[type="submit"]').click();
```

### Assertions
```typescript
// Visibility
cy.get('.element').should('be.visible');

// Text content
cy.get('.element').should('have.text', 'Expected Text');

// URL
cy.url().should('include', '/dashboard');
```

## Next Steps

1. Add `data-testid` attributes to your components
2. Create fixtures for mock data in `cypress/fixtures/`
3. Write tests for critical user flows
4. Add tests to your CI/CD pipeline
5. Monitor test results and fix flaky tests

## Troubleshooting

### TypeScript Errors
If you see TypeScript errors, create a `cypress/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["es5", "dom"],
    "types": ["cypress", "node"]
  },
  "include": ["**/*.ts"]
}
```

### Slow Tests
- Use `cy.intercept()` to mock API calls
- Avoid unnecessary waits
- Use `data-testid` for faster element selection

### Flaky Tests
- Always wait for elements to be visible/enabled
- Use explicit waits with assertions
- Mock external dependencies 