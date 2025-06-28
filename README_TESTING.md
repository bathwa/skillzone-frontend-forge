# SkillZone Testing Guide

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase project with service role key

### Installation
```bash
# Install dependencies
npm install

# Install Cypress
npm install cypress

# Install test utilities
npm install --save-dev tsx
```

### Environment Setup
Create `.env.test` file:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_KEY=admin123
```

## Running Tests

### Basic Tests
```bash
# Run basic authentication tests
npm run test:basic

# Open Cypress Test Runner
npm run test:open
```

### E2E Test Suites
```bash
# Run all E2E tests
npm run test:e2e

# Run specific test suites
npm run test:client      # Client workflow tests
npm run test:freelancer  # Freelancer workflow tests
npm run test:realtime    # Real-time features tests
```

### Database Seeding
```bash
# Seed all test scenarios
npm run seed

# Seed specific scenarios
npm run seed:client      # Client workflow data
npm run seed:freelancer  # Freelancer workflow data
npm run seed:admin       # Admin workflow data
npm run seed:realtime    # Real-time test data
```

## Test Structure

### Test Files
- `cypress/e2e/basic-auth.cy.ts` - Basic authentication and navigation
- `cypress/e2e/client-workflow.cy.ts` - Full client lifecycle
- `cypress/e2e/freelancer-workflow.cy.ts` - Full freelancer lifecycle
- `cypress/e2e/realtime-features.cy.ts` - Real-time features testing

### Custom Commands
```typescript
// Authentication
cy.login(email, password, role)
cy.logout()
cy.isLoggedIn()

// Database operations
cy.seedDatabase(scenarioName)
cy.resetDatabase()
cy.checkDatabase(table, conditions)

// Form interactions
cy.fillForm(formData)
cy.submitForm()
cy.uploadFile(selector, filePath)

// Network simulation
cy.simulateNetworkFailure()
cy.restoreNetwork()
cy.waitForRealtime()

// PWA testing
cy.checkPWAInstallPrompt()
cy.simulateOffline()
cy.simulateOnline()
```

## Test Scenarios

### Client Workflow
1. **Signup** - Register as new client
2. **Profile Completion** - Update profile details
3. **Create Opportunity** - Post standard opportunity
4. **View Proposals** - Browse submitted proposals
5. **Accept Proposal** - Accept freelancer proposal
6. **Chat** - Exchange messages with freelancer
7. **Mark Complete** - Change opportunity status
8. **Rate Freelancer** - Submit project rating
9. **Session Persistence** - Logout and login

### Freelancer Workflow
1. **Signup** - Register as new freelancer
2. **Profile Completion** - Update profile, add skills
3. **Browse Opportunities** - Filter and search
4. **Purchase Access** - Buy opportunity access
5. **Submit Proposal** - Create proposal
6. **View My Proposals** - Check proposal status
7. **Upgrade Subscription** - Change subscription tier
8. **Session Management** - Logout and login

### Real-time Features
1. **Real-time Chat** - Message exchange between users
2. **Real-time Notifications** - Instant notification updates
3. **Admin Dashboard** - Real-time admin updates
4. **Offline/Online** - Network transition handling
5. **PWA Features** - Installation and offline mode

## Debugging

### Common Issues

#### Test Failures
```bash
# Run specific test with debug output
npx cypress run --spec "cypress/e2e/client-workflow.cy.ts" --headed

# Check database state
npm run seed:client
npx cypress open
```

#### Database Issues
```bash
# Reset database
npm run seed

# Check connection
npx cypress run --spec "cypress/e2e/basic-auth.cy.ts"
```

#### Network Issues
- Check Supabase connection
- Verify environment variables
- Check RLS policies

### Debugging Tools
- **Cypress Test Runner**: Interactive debugging
- **Browser Dev Tools**: Network and console inspection
- **Supabase Dashboard**: Database and auth logs
- **Screenshots/Videos**: Automatic on failure

## CI/CD Integration

### GitHub Actions
The project includes a GitHub Actions workflow (`.github/workflows/test.yml`) that:
1. Runs linting and type checking
2. Builds the application
3. Runs basic tests
4. Seeds test data
5. Runs E2E tests
6. Uploads test artifacts

### Environment Secrets
Set these secrets in your GitHub repository:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Best Practices

### Test Organization
- **Feature-based**: Organize by user workflow
- **Isolation**: Each test is independent
- **Cleanup**: Reset database between tests
- **Realistic Data**: Use realistic test scenarios

### Writing Tests
```typescript
describe('Feature Test', () => {
  beforeEach(() => {
    cy.resetDatabase()
    cy.seedDatabase('scenario_name')
  })

  it('should complete workflow', () => {
    // Test steps
    cy.visit('/page')
    cy.fillForm(data)
    cy.submitForm()
    cy.checkToast('Success message')
  })
})
```

### Assertions
```typescript
// UI State
cy.get('[data-testid="element"]').should('be.visible')
cy.get('[data-testid="element"]').should('contain', 'text')

// Database State
cy.checkDatabase('table', { condition: 'value' })
  .then((result) => {
    expect(result.property).to.equal('expected')
  })

// Toast Messages
cy.checkToast('Success message', 'success')
cy.checkToast('Error message', 'error')
```

## Performance

### Optimization
- **Parallel Execution**: Run test suites in parallel
- **Minimal Data**: Use only necessary test data
- **Efficient Selectors**: Use `data-testid` attributes
- **Network Optimization**: Mock non-critical requests

### Monitoring
- **Execution Time**: Track test suite duration
- **Pass Rate**: Monitor test success rate
- **Flakiness**: Identify intermittent failures
- **Resource Usage**: Monitor memory and CPU

## Troubleshooting

### Build Issues
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force

# Check Node.js version
node --version
```

### Cypress Issues
```bash
# Clear Cypress cache
npx cypress cache clear

# Reinstall Cypress
npm install cypress --save-dev

# Check Cypress version
npx cypress --version
```

### Database Issues
```bash
# Check Supabase connection
curl -X GET "https://your-project.supabase.co/rest/v1/" \
  -H "apikey: your_anon_key"

# Verify service role key
npm run seed:client
```

## Support

### Documentation
- [Cypress Documentation](https://docs.cypress.io/)
- [Supabase Documentation](https://supabase.com/docs)
- [Testing Strategy](./TESTING_STRATEGY.md)
- [Build Reliability](./BUILD_RELIABILITY.md)

### Issues
- Check [GitHub Issues](https://github.com/bathwa/skillzone-frontend-forge/issues)
- Review test logs and screenshots
- Verify environment setup

### Team
- **Testing Lead**: [Contact Info]
- **DevOps**: [Contact Info]
- **Backend**: [Contact Info] 