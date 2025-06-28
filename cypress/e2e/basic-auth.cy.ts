describe('Basic Authentication Test', () => {
  beforeEach(() => {
    cy.resetDatabase()
  })

  it('should load the landing page', () => {
    cy.visit('/')
    cy.get('[data-testid="landing-page"]').should('be.visible')
    cy.get('h1').should('contain', 'SkillZone')
  })

  it('should navigate to login page', () => {
    cy.visit('/login')
    cy.get('[data-testid="login-form"]').should('be.visible')
    cy.get('[data-testid="email-input"]').should('be.visible')
    cy.get('[data-testid="password-input"]').should('be.visible')
  })

  it('should navigate to signup page', () => {
    cy.visit('/signup')
    cy.get('[data-testid="signup-form"]').should('be.visible')
    cy.get('[data-testid="first-name-input"]').should('be.visible')
    cy.get('[data-testid="last-name-input"]').should('be.visible')
    cy.get('[data-testid="email-input"]').should('be.visible')
    cy.get('[data-testid="password-input"]').should('be.visible')
  })

  it('should test database connection', () => {
    cy.task('testDatabaseConnection').then((result) => {
      expect(result.success).to.be.true
    })
  })

  it('should create and login test user', () => {
    // Create test user
    cy.createTestUser('client', 'test@example.com').then((userData) => {
      // Login with created user
      cy.login(userData.email, userData.password, 'client')
      cy.url().should('include', '/dashboard')
      cy.get('[data-testid="dashboard"]').should('be.visible')
    })
  })
}) 