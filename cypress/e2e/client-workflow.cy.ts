describe('Client Workflow E2E', () => {
  beforeEach(() => {
    // Reset database and seed with client workflow data
    cy.resetDatabase()
    cy.seedDatabase('client_workflow')
  })

  it('should complete full client lifecycle', () => {
    // 1. Signup as new client
    cy.visit('/signup')
    cy.fillForm({
      first_name: 'New',
      last_name: 'Client',
      email: 'newclient@test.com',
      password: 'password123',
      confirm_password: 'password123',
    })
    cy.get('[data-testid="role-select"]').click()
    cy.get('[data-testid="role-option-client"]').click()
    cy.get('[data-testid="country-select"]').click()
    cy.get('[data-testid="country-option-south_africa"]').click()
    cy.submitForm()
    
    // Check for email confirmation message
    cy.checkToast('Please check your email and confirm your account before signing in.')
    
    // 2. Login with existing client
    cy.login('client@test.com', 'password123', 'client')
    cy.url().should('include', '/dashboard')
    cy.get('[data-testid="user-name"]').should('contain', 'John Client')
    
    // 3. Complete profile
    cy.visit('/profile')
    cy.get('[data-testid="bio-input"]').type('Experienced business owner looking for quality development work.')
    cy.get('[data-testid="city-input"]').type('Johannesburg')
    cy.get('[data-testid="website-input"]').type('https://mybusiness.com')
    cy.submitForm()
    cy.checkToast('Profile updated successfully')
    
    // 4. Create opportunity
    cy.visit('/opportunities/create')
    cy.fillForm({
      title: 'E-commerce Website Development',
      description: 'Need a modern e-commerce website with payment integration and inventory management.',
      budget_min: '10000',
      budget_max: '25000',
    })
    cy.get('[data-testid="category-select"]').click()
    cy.get('[data-testid="category-option-Web Development"]').click()
    cy.get('[data-testid="type-select"]').click()
    cy.get('[data-testid="type-option-standard"]').click()
    cy.get('[data-testid="skills-select"]').click()
    cy.get('[data-testid="skill-option-React"]').click()
    cy.get('[data-testid="skill-option-Node.js"]').click()
    cy.submitForm()
    cy.checkToast('Opportunity created successfully')
    
    // 5. View opportunity details
    cy.visit('/opportunities')
    cy.get('[data-testid="opportunity-card"]').first().click()
    cy.get('[data-testid="opportunity-title"]').should('contain', 'E-commerce Website Development')
    cy.get('[data-testid="proposals-count"]').should('contain', '0')
    
    // 6. Wait for proposals (simulate freelancer submitting)
    cy.wait(2000) // In real scenario, freelancer would submit proposal
    
    // 7. View proposals
    cy.get('[data-testid="view-proposals-button"]').click()
    cy.get('[data-testid="proposals-list"]').should('exist')
    
    // 8. Accept proposal (if any exist)
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="proposal-card"]').length > 0) {
        cy.get('[data-testid="proposal-card"]').first().within(() => {
          cy.get('[data-testid="accept-proposal-button"]').click()
        })
        cy.checkToast('Proposal accepted successfully')
      }
    })
    
    // 9. Chat with freelancer
    cy.get('[data-testid="chat-button"]').click()
    cy.get('[data-testid="chat-input"]').type('Hello! I\'m excited to work with you on this project.')
    cy.get('[data-testid="send-message-button"]').click()
    cy.get('[data-testid="message"]').should('contain', 'Hello! I\'m excited to work with you on this project.')
    
    // 10. Mark opportunity complete
    cy.visit('/opportunities')
    cy.get('[data-testid="opportunity-card"]').first().click()
    cy.get('[data-testid="mark-complete-button"]').click()
    cy.get('[data-testid="confirm-complete-button"]').click()
    cy.checkToast('Opportunity marked as complete')
    
    // 11. Rate freelancer
    cy.get('[data-testid="rate-freelancer-button"]').click()
    cy.get('[data-testid="rating-5"]').click()
    cy.get('[data-testid="review-text"]').type('Excellent work! Very professional and delivered on time.')
    cy.submitForm()
    cy.checkToast('Review submitted successfully')
    
    // 12. Logout and verify session persistence
    cy.logout()
    cy.url().should('include', '/login')
    
    // 13. Login again
    cy.login('client@test.com', 'password123', 'client')
    cy.url().should('include', '/dashboard')
    cy.get('[data-testid="user-name"]').should('contain', 'John Client')
  })

  it('should handle insufficient tokens gracefully', () => {
    cy.login('client@test.com', 'password123', 'client')
    
    // Simulate low token balance
    cy.task('updateUserTokens', { email: 'client@test.com', tokens: 1 })
    
    // Try to create premium opportunity
    cy.visit('/opportunities/create')
    cy.fillForm({
      title: 'Premium Project',
      description: 'High-budget project requiring premium listing.',
      budget_min: '50000',
      budget_max: '100000',
    })
    cy.get('[data-testid="type-select"]').click()
    cy.get('[data-testid="type-option-premium"]').click()
    cy.submitForm()
    
    // Should show insufficient tokens error
    cy.checkToast('Insufficient tokens', 'error')
    cy.get('[data-testid="buy-tokens-button"]').should('be.visible')
  })

  it('should handle form validation errors', () => {
    cy.visit('/signup')
    
    // Submit empty form
    cy.submitForm()
    
    // Check for validation errors
    cy.get('[data-testid="email-error"]').should('contain', 'Email is required')
    cy.get('[data-testid="password-error"]').should('contain', 'Password is required')
    cy.get('[data-testid="first-name-error"]').should('contain', 'First name is required')
    cy.get('[data-testid="last-name-error"]').should('contain', 'Last name is required')
    
    // Test invalid email
    cy.get('[data-testid="email-input"]').type('invalid-email')
    cy.get('[data-testid="email-error"]').should('contain', 'Invalid email format')
    
    // Test password mismatch
    cy.get('[data-testid="password-input"]').type('password123')
    cy.get('[data-testid="confirm-password-input"]').type('different-password')
    cy.get('[data-testid="confirm-password-error"]').should('contain', 'Passwords do not match')
  })

  it('should handle network failures gracefully', () => {
    cy.visit('/login')
    cy.simulateNetworkFailure()
    
    cy.fillForm({
      email: 'client@test.com',
      password: 'password123',
    })
    cy.submitForm()
    
    // Should show network error
    cy.checkToast('Network error', 'error')
    
    // Restore network and try again
    cy.restoreNetwork()
    cy.submitForm()
    cy.url().should('include', '/dashboard')
  })
}) 