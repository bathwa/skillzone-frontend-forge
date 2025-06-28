describe('Freelancer Workflow E2E', () => {
  beforeEach(() => {
    cy.resetDatabase()
    cy.seedDatabase('freelancer_workflow')
  })

  it('should complete full freelancer lifecycle', () => {
    // 1. Signup as new freelancer
    cy.visit('/signup')
    cy.fillForm({
      first_name: 'New',
      last_name: 'Freelancer',
      email: 'newfreelancer@test.com',
      password: 'password123',
      confirm_password: 'password123',
    })
    cy.get('[data-testid="role-select"]').click()
    cy.get('[data-testid="role-option-freelancer"]').click()
    cy.get('[data-testid="country-select"]').click()
    cy.get('[data-testid="country-option-zimbabwe"]').click()
    cy.submitForm()
    
    cy.checkToast('Please check your email and confirm your account before signing in.')
    
    // 2. Login with existing freelancer
    cy.login('freelancer2@test.com', 'password123', 'freelancer')
    cy.url().should('include', '/dashboard')
    cy.get('[data-testid="user-name"]').should('contain', 'Mike Developer')
    
    // 3. Complete profile
    cy.visit('/profile')
    cy.get('[data-testid="bio-input"]').type('Experienced mobile developer with 5+ years in React Native and iOS development.')
    cy.get('[data-testid="city-input"]').type('Harare')
    cy.get('[data-testid="website-input"]').type('https://mikedeveloper.com')
    cy.get('[data-testid="hourly-rate-input"]').type('50')
    cy.submitForm()
    cy.checkToast('Profile updated successfully')
    
    // 4. Add skills
    cy.get('[data-testid="add-skill-button"]').click()
    cy.get('[data-testid="skill-select"]').click()
    cy.get('[data-testid="skill-option-React Native"]').click()
    cy.get('[data-testid="skill-level-select"]').click()
    cy.get('[data-testid="skill-level-option-expert"]').click()
    cy.submitForm()
    cy.checkToast('Skill added successfully')
    
    // 5. Browse opportunities
    cy.visit('/opportunities')
    cy.get('[data-testid="opportunity-card"]').should('have.length.at.least', 1)
    cy.get('[data-testid="opportunity-card"]').first().click()
    
    // 6. Purchase opportunity access
    cy.get('[data-testid="purchase-access-button"]').click()
    cy.get('[data-testid="confirm-purchase-button"]').click()
    cy.checkToast('Access purchased successfully')
    
    // 7. Submit proposal
    cy.get('[data-testid="submit-proposal-button"]').click()
    cy.fillForm({
      proposed_budget: '15000',
      estimated_duration: '30',
      cover_letter: 'I have extensive experience in mobile app development and would love to work on this fitness tracking app. I can deliver a high-quality product within your timeline.',
    })
    cy.submitForm()
    cy.checkToast('Proposal submitted successfully')
    
    // 8. View my proposals
    cy.visit('/proposals')
    cy.get('[data-testid="proposal-card"]').should('contain', 'Mobile App Development')
    cy.get('[data-testid="proposal-status"]').should('contain', 'pending')
    
    // 9. Upgrade subscription
    cy.visit('/subscription')
    cy.get('[data-testid="upgrade-to-pro-button"]').click()
    cy.get('[data-testid="confirm-upgrade-button"]').click()
    cy.checkToast('Subscription upgraded successfully')
    
    // 10. Check token balance after purchases
    cy.visit('/tokens')
    cy.get('[data-testid="token-balance"]').should('contain', '35') // 50 - 10 (access) - 5 (upgrade)
    
    // 11. Logout and login again
    cy.logout()
    cy.login('freelancer2@test.com', 'password123', 'freelancer')
    cy.url().should('include', '/dashboard')
  })

  it('should handle opportunity filtering and search', () => {
    cy.login('freelancer2@test.com', 'password123', 'freelancer')
    
    // Test category filter
    cy.visit('/opportunities')
    cy.get('[data-testid="category-filter"]').click()
    cy.get('[data-testid="category-option-Mobile Development"]').click()
    cy.get('[data-testid="opportunity-card"]').should('contain', 'Mobile App Development')
    
    // Test budget filter
    cy.get('[data-testid="budget-filter"]').click()
    cy.get('[data-testid="budget-range-10k-25k"]').click()
    cy.get('[data-testid="opportunity-card"]').should('exist')
    
    // Test search
    cy.get('[data-testid="search-input"]').type('fitness')
    cy.get('[data-testid="search-button"]').click()
    cy.get('[data-testid="opportunity-card"]').should('contain', 'fitness')
    
    // Clear filters
    cy.get('[data-testid="clear-filters-button"]').click()
    cy.get('[data-testid="opportunity-card"]').should('have.length.at.least', 1)
  })

  it('should prevent duplicate proposals', () => {
    cy.login('freelancer2@test.com', 'password123', 'freelancer')
    
    // Purchase access to opportunity
    cy.visit('/opportunities')
    cy.get('[data-testid="opportunity-card"]').first().click()
    cy.get('[data-testid="purchase-access-button"]').click()
    cy.get('[data-testid="confirm-purchase-button"]').click()
    
    // Submit first proposal
    cy.get('[data-testid="submit-proposal-button"]').click()
    cy.fillForm({
      proposed_budget: '15000',
      estimated_duration: '30',
      cover_letter: 'First proposal',
    })
    cy.submitForm()
    cy.checkToast('Proposal submitted successfully')
    
    // Try to submit second proposal
    cy.get('[data-testid="submit-proposal-button"]').click()
    cy.checkToast('You have already submitted a proposal for this opportunity', 'error')
  })

  it('should handle insufficient tokens for opportunity access', () => {
    // Reduce token balance
    cy.task('updateUserTokens', { email: 'freelancer2@test.com', tokens: 5 })
    
    cy.login('freelancer2@test.com', 'password123', 'freelancer')
    
    // Try to purchase premium opportunity access
    cy.visit('/opportunities')
    cy.get('[data-testid="opportunity-card"]').first().click()
    cy.get('[data-testid="purchase-access-button"]').click()
    
    // Should show insufficient tokens error
    cy.checkToast('Insufficient tokens', 'error')
    cy.get('[data-testid="buy-tokens-button"]').should('be.visible')
  })

  it('should handle proposal withdrawal', () => {
    cy.login('freelancer2@test.com', 'password123', 'freelancer')
    
    // Purchase access and submit proposal
    cy.visit('/opportunities')
    cy.get('[data-testid="opportunity-card"]').first().click()
    cy.get('[data-testid="purchase-access-button"]').click()
    cy.get('[data-testid="confirm-purchase-button"]').click()
    
    cy.get('[data-testid="submit-proposal-button"]').click()
    cy.fillForm({
      proposed_budget: '15000',
      estimated_duration: '30',
      cover_letter: 'Test proposal',
    })
    cy.submitForm()
    
    // Withdraw proposal
    cy.visit('/proposals')
    cy.get('[data-testid="proposal-card"]').first().within(() => {
      cy.get('[data-testid="withdraw-proposal-button"]').click()
    })
    cy.get('[data-testid="confirm-withdraw-button"]').click()
    cy.checkToast('Proposal withdrawn successfully')
    
    // Check status changed
    cy.get('[data-testid="proposal-status"]').should('contain', 'withdrawn')
  })
}) 