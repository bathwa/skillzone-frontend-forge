// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login a user
       * @example cy.login('user@example.com', 'password', 'client')
       */
      login(email: string, password: string, role?: 'client' | 'freelancer' | 'admin'): Chainable<void>
      
      /**
       * Custom command to seed database with test data
       * @example cy.seedDatabase('client_workflow')
       */
      seedDatabase(scenarioName: string): Chainable<void>
      
      /**
       * Custom command to visit a route ensuring user is authenticated
       * @example cy.visitAuthenticated('/dashboard')
       */
      visitAuthenticated(route: string): Chainable<void>
      
      /**
       * Custom command to clear database and reset to clean state
       * @example cy.resetDatabase()
       */
      resetDatabase(): Chainable<void>
      
      /**
       * Custom command to create a test user
       * @example cy.createTestUser('client', 'test@example.com')
       */
      createTestUser(role: 'client' | 'freelancer' | 'admin', email?: string): Chainable<{ email: string, password: string, id: string }>
      
      /**
       * Custom command to wait for Supabase operations
       * @example cy.waitForSupabase()
       */
      waitForSupabase(): Chainable<void>
      
      /**
       * Custom command to check if user is logged in
       * @example cy.isLoggedIn()
       */
      isLoggedIn(): Chainable<any>
      
      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>
      
      /**
       * Custom command to wait for loading states
       * @example cy.waitForLoading()
       */
      waitForLoading(): Chainable<void>
      
      /**
       * Custom command to handle file uploads
       * @example cy.uploadFile('[data-testid="file-input"]', 'path/to/file.pdf')
       */
      uploadFile(selector: string, filePath: string): Chainable<void>
      
      /**
       * Custom command to check toast messages
       * @example cy.checkToast('Success message', 'success')
       */
      checkToast(message: string, type?: 'success' | 'error' | 'warning'): Chainable<void>
      
      /**
       * Custom command to fill form fields
       * @example cy.fillForm({ email: 'test@example.com', password: 'password123' })
       */
      fillForm(formData: Record<string, string>): Chainable<void>
      
      /**
       * Custom command to submit form
       * @example cy.submitForm()
       */
      submitForm(): Chainable<void>
      
      /**
       * Custom command to check database state
       * @example cy.checkDatabase('profiles', { email: 'test@example.com' })
       */
      checkDatabase(table: string, conditions: Record<string, any>): Chainable<any>
      
      /**
       * Custom command to simulate network failure
       * @example cy.simulateNetworkFailure()
       */
      simulateNetworkFailure(): Chainable<void>
      
      /**
       * Custom command to restore network
       * @example cy.restoreNetwork()
       */
      restoreNetwork(): Chainable<void>
      
      /**
       * Custom command to wait for real-time updates
       * @example cy.waitForRealtime()
       */
      waitForRealtime(): Chainable<void>
      
      /**
       * Custom command to check PWA installation prompt
       * @example cy.checkPWAInstallPrompt()
       */
      checkPWAInstallPrompt(): Chainable<void>
      
      /**
       * Custom command to simulate offline mode
       * @example cy.simulateOffline()
       */
      simulateOffline(): Chainable<void>
      
      /**
       * Custom command to simulate online mode
       * @example cy.simulateOnline()
       */
      simulateOnline(): Chainable<void>
    }
  }
} 