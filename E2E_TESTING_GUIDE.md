# End-to-End Testing Guide for Bot v3.1 Trading Application

## Overview
This guide provides a comprehensive approach to implementing E2E tests for the Bot v3.1 Trading application using modern testing frameworks.

## Framework Comparison

### 1. Cypress (Recommended)
**Pros:**
- Excellent developer experience with time-travel debugging
- Real-time browser preview
- Automatic waiting and retry logic
- Great documentation and community
- Built-in screenshot and video recording

**Cons:**
- Limited cross-browser support (primarily Chrome-based)
- Can be slower for large test suites

### 2. Playwright
**Pros:**
- Multi-browser support (Chrome, Firefox, Safari)
- Faster execution
- Better for CI/CD pipelines
- Can run tests in parallel
- Mobile browser emulation

**Cons:**
- Steeper learning curve
- Less mature ecosystem

## Recommended Setup: Cypress

### Installation

```bash
cd frontend
npm install --save-dev cypress @cypress/react @testing-library/cypress
```

### Configuration

Create `cypress.config.ts`:

```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
  },
});
```

### Folder Structure

```
frontend/
├── cypress/
│   ├── e2e/
│   │   ├── dashboard.cy.ts
│   │   ├── strategies.cy.ts
│   │   ├── backtesting.cy.ts
│   │   └── portfolio.cy.ts
│   ├── fixtures/
│   │   ├── strategies.json
│   │   └── backtest-results.json
│   ├── support/
│   │   ├── commands.ts
│   │   └── e2e.ts
│   └── downloads/
```

## E2E Test Examples

### 1. Dashboard Flow Test

```typescript
// cypress/e2e/dashboard.cy.ts
describe('Dashboard E2E Tests', () => {
  beforeEach(() => {
    // Start with a clean state
    cy.visit('/');
    cy.wait('@getStrategies');
  });

  it('should display dashboard with all key metrics', () => {
    // Check main dashboard elements
    cy.contains('Bot v3.1 Trading').should('be.visible');
    cy.get('[data-testid="total-strategies-card"]').should('be.visible');
    cy.get('[data-testid="active-backtests-card"]').should('be.visible');
    cy.get('[data-testid="portfolio-value-card"]').should('be.visible');
    
    // Verify chart is rendered
    cy.get('[data-testid="performance-chart"]').should('be.visible');
  });

  it('should navigate to strategies page when clicking strategies card', () => {
    cy.get('[data-testid="total-strategies-card"]').click();
    cy.url().should('include', '/strategies');
    cy.contains('Trading Strategies').should('be.visible');
  });

  it('should refresh data when refresh button is clicked', () => {
    cy.intercept('GET', '/api/portfolio/performance', { 
      fixture: 'portfolio-performance.json' 
    }).as('getPerformance');
    
    cy.get('[data-testid="refresh-button"]').click();
    cy.wait('@getPerformance');
    
    // Verify loading state
    cy.get('[data-testid="loading-spinner"]').should('be.visible');
    cy.get('[data-testid="loading-spinner"]').should('not.exist');
  });
});
```

### 2. Strategy Creation Flow

```typescript
// cypress/e2e/strategies.cy.ts
describe('Strategy Management E2E Tests', () => {
  it('should create a new strategy', () => {
    cy.visit('/strategies');
    
    // Click create button
    cy.get('[data-testid="create-strategy-button"]').click();
    
    // Fill in strategy form
    cy.get('[data-testid="strategy-name-input"]').type('MA Crossover Strategy');
    cy.get('[data-testid="strategy-type-select"]').select('Technical');
    cy.get('[data-testid="strategy-description"]').type('Moving average crossover strategy');
    
    // Add parameters
    cy.get('[data-testid="add-parameter-button"]').click();
    cy.get('[data-testid="parameter-name-0"]').type('fast_period');
    cy.get('[data-testid="parameter-value-0"]').type('10');
    
    // Save strategy
    cy.get('[data-testid="save-strategy-button"]').click();
    
    // Verify success
    cy.contains('Strategy created successfully').should('be.visible');
    cy.contains('MA Crossover Strategy').should('be.visible');
  });
});
```

### 3. Backtesting Flow

```typescript
// cypress/e2e/backtesting.cy.ts
describe('Backtesting E2E Tests', () => {
  it('should run a complete backtest', () => {
    cy.visit('/backtesting');
    
    // Select strategy
    cy.get('[data-testid="strategy-select"]').select('MA Crossover Strategy');
    
    // Configure backtest parameters
    cy.get('[data-testid="symbol-select"]').select('AAPL');
    cy.get('[data-testid="start-date"]').type('2023-01-01');
    cy.get('[data-testid="end-date"]').type('2023-12-31');
    cy.get('[data-testid="initial-capital"]').clear().type('100000');
    
    // Run backtest
    cy.get('[data-testid="run-backtest-button"]').click();
    
    // Wait for results
    cy.get('[data-testid="backtest-progress"]', { timeout: 30000 }).should('be.visible');
    cy.get('[data-testid="backtest-results"]', { timeout: 60000 }).should('be.visible');
    
    // Verify results display
    cy.get('[data-testid="total-return"]').should('be.visible');
    cy.get('[data-testid="sharpe-ratio"]').should('be.visible');
    cy.get('[data-testid="max-drawdown"]').should('be.visible');
    cy.get('[data-testid="equity-curve-chart"]').should('be.visible');
  });
});
```

### 4. Custom Commands

```typescript
// cypress/support/commands.ts
declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<void>
      setupAPIInterceptors(): Chainable<void>
      waitForDashboardLoad(): Chainable<void>
    }
  }
}

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/login');
  cy.get('[data-testid="username-input"]').type(username);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('setupAPIInterceptors', () => {
  cy.intercept('GET', '/api/strategies', { fixture: 'strategies.json' }).as('getStrategies');
  cy.intercept('GET', '/api/portfolio/performance', { fixture: 'portfolio.json' }).as('getPortfolio');
  cy.intercept('GET', '/api/backtest/history', { fixture: 'backtest-history.json' }).as('getBacktestHistory');
});

Cypress.Commands.add('waitForDashboardLoad', () => {
  cy.wait(['@getStrategies', '@getPortfolio', '@getBacktestHistory']);
});
```

## Best Practices

### 1. Test Organization
- Group related tests in describe blocks
- Use clear, descriptive test names
- Keep tests independent and atomic
- Clean up test data after each test

### 2. Selectors
- Use data-testid attributes for reliable element selection
- Avoid using CSS classes or implementation details
- Create custom commands for common interactions

### 3. API Mocking
- Use cy.intercept() to mock API responses
- Create fixtures for consistent test data
- Test both success and error scenarios

### 4. Assertions
- Use explicit waits with assertions
- Test user-visible behavior, not implementation
- Verify both positive and negative cases

### 5. CI/CD Integration

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Start backend
        run: |
          cd backend
          npm start &
        env:
          NODE_ENV: test
      
      - name: Run Cypress tests
        uses: cypress-io/github-action@v5
        with:
          working-directory: frontend
          start: npm run dev
          wait-on: 'http://localhost:3000'
          wait-on-timeout: 120
```

## Testing Scenarios

### Critical User Flows to Test

1. **Authentication Flow**
   - Login with valid credentials
   - Login with invalid credentials
   - Logout functionality
   - Session persistence

2. **Strategy Management**
   - Create new strategy
   - Edit existing strategy
   - Delete strategy
   - Validate strategy parameters

3. **Backtesting Workflow**
   - Configure backtest parameters
   - Run backtest
   - View results
   - Compare multiple backtests
   - Export results

4. **Portfolio Monitoring**
   - View portfolio performance
   - Check position details
   - Monitor real-time updates
   - Set alerts

5. **Data Management**
   - Upload market data
   - Validate data format
   - View data statistics
   - Delete old data

## Performance Testing

```typescript
// cypress/e2e/performance.cy.ts
describe('Performance Tests', () => {
  it('should load dashboard within acceptable time', () => {
    cy.visit('/', {
      onBeforeLoad: (win) => {
        win.performance.mark('start');
      },
      onLoad: (win) => {
        win.performance.mark('end');
        win.performance.measure('pageLoad', 'start', 'end');
        const measure = win.performance.getEntriesByName('pageLoad')[0];
        expect(measure.duration).to.be.lessThan(3000); // 3 seconds
      },
    });
  });
});
```

## Accessibility Testing

```typescript
// cypress/e2e/accessibility.cy.ts
describe('Accessibility Tests', () => {
  it('should have no accessibility violations on dashboard', () => {
    cy.visit('/');
    cy.injectAxe();
    cy.checkA11y();
  });
});
```

## Next Steps

1. **Install Cypress**: Run the installation commands
2. **Create Test Structure**: Set up the folder structure
3. **Write First Test**: Start with dashboard.cy.ts
4. **Add to CI/CD**: Integrate with your pipeline
5. **Expand Coverage**: Add more test scenarios
6. **Monitor Results**: Set up test reporting

## Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Testing Library Cypress](https://testing-library.com/docs/cypress-testing-library/intro)
- [Cypress Real World App](https://github.com/cypress-io/cypress-realworld-app) 