describe('Real-time Features E2E', () => {
  beforeEach(() => {
    cy.resetDatabase()
    cy.seedDatabase('realtime_test')
  })

  it('should handle real-time chat between users', () => {
    // Login as first user
    cy.login('user1@test.com', 'password123', 'client')
    
    // Create opportunity
    cy.visit('/opportunities/create')
    cy.fillForm({
      title: 'Chat Test Project',
      description: 'Project for testing real-time chat functionality.',
      budget_min: '1000',
      budget_max: '5000',
    })
    cy.get('[data-testid="category-select"]').click()
    cy.get('[data-testid="category-option-Testing"]').click()
    cy.submitForm()
    
    // Get opportunity ID for second user
    cy.url().then((url) => {
      const opportunityId = url.split('/').pop()
      
      // Open new window for second user
      cy.window().then((win) => {
        const newWindow = win.open('/login', '_blank')
        cy.wrap(newWindow).then((win2) => {
          // Login as second user in new window
          cy.window({ log: false }).then((win2) => {
            cy.visit('/login', { window: win2 })
            cy.fillForm({
              email: 'user2@test.com',
              password: 'password123',
            })
            cy.submitForm()
            
            // Navigate to opportunity and submit proposal
            cy.visit(`/opportunities/${opportunityId}`, { window: win2 })
            cy.get('[data-testid="purchase-access-button"]').click()
            cy.get('[data-testid="confirm-purchase-button"]').click()
            cy.get('[data-testid="submit-proposal-button"]').click()
            cy.fillForm({
              proposed_budget: '3000',
              estimated_duration: '15',
              cover_letter: 'I can help with this project!',
            })
            cy.submitForm()
          })
        })
      })
    })
    
    // Accept proposal in first window
    cy.visit('/opportunities')
    cy.get('[data-testid="opportunity-card"]').first().click()
    cy.get('[data-testid="view-proposals-button"]').click()
    cy.get('[data-testid="proposal-card"]').first().within(() => {
      cy.get('[data-testid="accept-proposal-button"]').click()
    })
    
    // Open chat
    cy.get('[data-testid="chat-button"]').click()
    
    // Send message from first user
    cy.get('[data-testid="chat-input"]').type('Hello from User 1!')
    cy.get('[data-testid="send-message-button"]').click()
    
    // Wait for real-time update
    cy.waitForRealtime()
    cy.get('[data-testid="message"]').should('contain', 'Hello from User 1!')
    
    // Send message from second user (in new window)
    cy.window().then((win) => {
      const win2 = win.open('/chat', '_blank')
      cy.wrap(win2).then(() => {
        cy.window({ log: false }).then((win2) => {
          cy.visit('/chat', { window: win2 })
          cy.get('[data-testid="chat-input"]').type('Hello from User 2!')
          cy.get('[data-testid="send-message-button"]').click()
        })
      })
    })
    
    // Verify message appears in first window
    cy.waitForRealtime()
    cy.get('[data-testid="message"]').should('contain', 'Hello from User 2!')
  })

  it('should handle real-time notifications', () => {
    // Login as client
    cy.login('user1@test.com', 'password123', 'client')
    
    // Create opportunity
    cy.visit('/opportunities/create')
    cy.fillForm({
      title: 'Notification Test Project',
      description: 'Project for testing real-time notifications.',
      budget_min: '1000',
      budget_max: '5000',
    })
    cy.get('[data-testid="category-select"]').click()
    cy.get('[data-testid="category-option-Testing"]').click()
    cy.submitForm()
    
    // Get opportunity ID
    cy.url().then((url) => {
      const opportunityId = url.split('/').pop()
      
      // Open new window for freelancer
      cy.window().then((win) => {
        const newWindow = win.open('/login', '_blank')
        cy.wrap(newWindow).then((win2) => {
          // Login as freelancer and submit proposal
          cy.window({ log: false }).then((win2) => {
            cy.visit('/login', { window: win2 })
            cy.fillForm({
              email: 'user2@test.com',
              password: 'password123',
            })
            cy.submitForm()
            
            cy.visit(`/opportunities/${opportunityId}`, { window: win2 })
            cy.get('[data-testid="purchase-access-button"]').click()
            cy.get('[data-testid="confirm-purchase-button"]').click()
            cy.get('[data-testid="submit-proposal-button"]').click()
            cy.fillForm({
              proposed_budget: '3000',
              estimated_duration: '15',
              cover_letter: 'Test proposal for notifications',
            })
            cy.submitForm()
          })
        })
      })
    })
    
    // Check notification appears for client
    cy.waitForRealtime()
    cy.get('[data-testid="notification-badge"]').should('contain', '1')
    cy.get('[data-testid="notification-badge"]').click()
    cy.get('[data-testid="notification-item"]').should('contain', 'New proposal received')
    
    // Accept proposal
    cy.visit('/opportunities')
    cy.get('[data-testid="opportunity-card"]').first().click()
    cy.get('[data-testid="view-proposals-button"]').click()
    cy.get('[data-testid="proposal-card"]').first().within(() => {
      cy.get('[data-testid="accept-proposal-button"]').click()
    })
    
    // Check notification appears for freelancer
    cy.window().then((win) => {
      const win2 = win.open('/dashboard', '_blank')
      cy.wrap(win2).then(() => {
        cy.window({ log: false }).then((win2) => {
          cy.visit('/dashboard', { window: win2 })
          cy.waitForRealtime()
          cy.get('[data-testid="notification-badge"]').should('contain', '1')
          cy.get('[data-testid="notification-badge"]').click()
          cy.get('[data-testid="notification-item"]').should('contain', 'Proposal accepted')
        })
      })
    })
  })

  it('should handle admin real-time updates', () => {
    // Login as admin
    cy.login('admin@test.com', 'password123', 'admin')
    
    // Open admin dashboard
    cy.visit('/admin')
    cy.get('[data-testid="admin-dashboard"]').should('be.visible')
    
    // Simulate token purchase request
    cy.task('createTokenPurchase', {
      user_id: 'test-user-id',
      amount: 100,
      reference: 'TEST-REF-123',
    })
    
    // Check for real-time update in admin dashboard
    cy.waitForRealtime()
    cy.get('[data-testid="pending-purchases-count"]').should('contain', '1')
    cy.get('[data-testid="pending-purchase-item"]').should('contain', 'TEST-REF-123')
    
    // Approve purchase
    cy.get('[data-testid="approve-purchase-button"]').click()
    cy.get('[data-testid="confirm-approve-button"]').click()
    cy.checkToast('Purchase approved successfully')
    
    // Check count updates
    cy.get('[data-testid="pending-purchases-count"]').should('contain', '0')
  })

  it('should handle offline/online transitions', () => {
    cy.login('user1@test.com', 'password123', 'client')
    
    // Go offline
    cy.simulateOffline()
    
    // Try to send a message
    cy.visit('/chat')
    cy.get('[data-testid="chat-input"]').type('Message while offline')
    cy.get('[data-testid="send-message-button"]').click()
    
    // Should show offline indicator
    cy.get('[data-testid="offline-indicator"]').should('be.visible')
    cy.get('[data-testid="message-status"]').should('contain', 'Sending...')
    
    // Go online
    cy.simulateOnline()
    
    // Message should be sent
    cy.waitForRealtime()
    cy.get('[data-testid="message-status"]').should('contain', 'Sent')
    cy.get('[data-testid="offline-indicator"]').should('not.exist')
  })

  it('should handle PWA installation prompt', () => {
    cy.visit('/')
    
    // Check if PWA install prompt is available
    cy.checkPWAInstallPrompt()
    
    // Install PWA
    cy.get('[data-testid="install-pwa-button"]').click()
    cy.get('[data-testid="confirm-install-button"]').click()
    
    // Should show success message
    cy.checkToast('PWA installed successfully')
    
    // Check if app is now in standalone mode
    cy.window().then((win) => {
      expect(win.navigator.standalone).to.be.true
    })
  })
}) 