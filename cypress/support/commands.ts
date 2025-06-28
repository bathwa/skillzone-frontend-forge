import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client for test operations
const supabase = createClient(
  Cypress.env('SUPABASE_URL'),
  Cypress.env('SUPABASE_ANON_KEY')
)

// Custom command to login a user
Cypress.Commands.add('login', (email: string, password: string, role?: 'client' | 'freelancer' | 'admin') => {
  cy.visit('/login')
  
  // Handle admin login
  if (role === 'admin') {
    cy.get('[data-testid="admin-email-input"]').type(email)
    cy.get('[data-testid="admin-key-input"]').type(Cypress.env('ADMIN_KEY') || 'admin123')
    cy.get('[data-testid="admin-login-button"]').click()
  } else {
    // Regular user login
    cy.get('[data-testid="email-input"]').type(email)
    cy.get('[data-testid="password-input"]').type(password)
    cy.get('[data-testid="login-button"]').click()
  }
  
  // Wait for login to complete
  cy.url().should('include', '/dashboard')
  cy.waitForSupabase()
})

// Custom command to seed database with test data
Cypress.Commands.add('seedDatabase', (scenarioName: string) => {
  cy.task('seedDatabase', scenarioName)
})

// Custom command to visit authenticated route
Cypress.Commands.add('visitAuthenticated', (route: string) => {
  cy.visit(route)
  cy.url().should('not.include', '/login')
})

// Custom command to reset database
Cypress.Commands.add('resetDatabase', () => {
  cy.task('resetDatabase')
})

// Custom command to create test user
Cypress.Commands.add('createTestUser', (role: 'client' | 'freelancer' | 'admin', email?: string) => {
  const testEmail = email || `test-${Date.now()}@example.com`
  const password = 'password123'
  
  return cy.task('createTestUser', { email: testEmail, password, role })
    .then((userData: any) => {
      return userData
    })
})

// Custom command to wait for Supabase operations
Cypress.Commands.add('waitForSupabase', () => {
  // Wait for any pending network requests to complete
  cy.wait(1000)
})

// Custom command to check if user is logged in
Cypress.Commands.add('isLoggedIn', () => {
  cy.window().then((win) => {
    const authStore = win.localStorage.getItem('auth-store')
    return authStore ? JSON.parse(authStore).user : null
  })
})

// Custom command to logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click()
  cy.get('[data-testid="logout-button"]').click()
  cy.url().should('include', '/login')
})

// Custom command to wait for loading states
Cypress.Commands.add('waitForLoading', () => {
  cy.get('[data-testid="loading-spinner"]').should('not.exist')
  cy.get('[data-testid="loading-skeleton"]').should('not.exist')
})

// Custom command to handle file uploads
Cypress.Commands.add('uploadFile', (selector: string, filePath: string) => {
  cy.get(selector).selectFile(filePath)
})

// Custom command to check toast messages
Cypress.Commands.add('checkToast', (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
  cy.get('[data-testid="toast"]').should('contain.text', message)
  if (type !== 'success') {
    cy.get('[data-testid="toast"]').should('have.class', `toast-${type}`)
  }
})

// Custom command to fill form fields
Cypress.Commands.add('fillForm', (formData: Record<string, string>) => {
  Object.entries(formData).forEach(([field, value]) => {
    cy.get(`[data-testid="${field}-input"]`).clear().type(value)
  })
})

// Custom command to submit form
Cypress.Commands.add('submitForm', () => {
  cy.get('[data-testid="submit-button"]').click()
})

// Custom command to check database state
Cypress.Commands.add('checkDatabase', (table: string, conditions: Record<string, any>) => {
  return cy.task('checkDatabase', { table, conditions })
})

// Custom command to simulate network failure
Cypress.Commands.add('simulateNetworkFailure', () => {
  cy.intercept('**/*', { forceNetworkError: true })
})

// Custom command to restore network
Cypress.Commands.add('restoreNetwork', () => {
  cy.intercept('**/*', {})
})

// Custom command to wait for real-time updates
Cypress.Commands.add('waitForRealtime', () => {
  cy.wait(2000) // Wait for real-time subscriptions to update
})

// Custom command to check PWA installation prompt
Cypress.Commands.add('checkPWAInstallPrompt', () => {
  cy.window().then((win) => {
    const beforeInstallPrompt = win.beforeinstallprompt
    expect(beforeInstallPrompt).to.not.be.undefined
  })
})

// Custom command to simulate offline mode
Cypress.Commands.add('simulateOffline', () => {
  cy.window().then((win) => {
    cy.stub(win.navigator, 'onLine').value(false)
  })
})

// Custom command to simulate online mode
Cypress.Commands.add('simulateOnline', () => {
  cy.window().then((win) => {
    cy.stub(win.navigator, 'onLine').value(true)
  })
}) 