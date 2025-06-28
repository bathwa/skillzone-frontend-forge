import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/integrations/supabase/types'

// Initialize Supabase client with service role key for admin operations
const supabase = createClient<Database>(
  process.env.SUPABASE_URL || 'https://bexdvmnrwqlcfxygpnlu.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// Test data scenarios
const testScenarios = {
  client_workflow: {
    users: [
      {
        email: 'client@test.com',
        password: 'password123',
        role: 'client' as const,
        first_name: 'John',
        last_name: 'Client',
        country: 'south_africa' as const,
      },
      {
        email: 'freelancer@test.com',
        password: 'password123',
        role: 'freelancer' as const,
        first_name: 'Jane',
        last_name: 'Freelancer',
        country: 'botswana' as const,
      },
    ],
    opportunities: [
      {
        title: 'Website Development for Small Business',
        description: 'Need a professional website for my small business. Looking for modern design with e-commerce functionality.',
        budget_min: 5000,
        budget_max: 15000,
        category: 'Web Development',
        type: 'standard' as const,
        status: 'open' as const,
        client_country: 'south_africa' as const,
        required_skills: ['React', 'Node.js', 'UI/UX Design'],
      },
    ],
  },
  freelancer_workflow: {
    users: [
      {
        email: 'freelancer2@test.com',
        password: 'password123',
        role: 'freelancer' as const,
        first_name: 'Mike',
        last_name: 'Developer',
        country: 'zimbabwe' as const,
      },
      {
        email: 'client2@test.com',
        password: 'password123',
        role: 'client' as const,
        first_name: 'Sarah',
        last_name: 'Business',
        country: 'namibia' as const,
      },
    ],
    opportunities: [
      {
        title: 'Mobile App Development',
        description: 'Looking for an experienced mobile developer to create a fitness tracking app for iOS and Android.',
        budget_min: 8000,
        budget_max: 25000,
        category: 'Mobile Development',
        type: 'premium' as const,
        status: 'open' as const,
        client_country: 'namibia' as const,
        required_skills: ['React Native', 'Firebase', 'UI/UX Design'],
      },
    ],
  },
  admin_workflow: {
    users: [
      {
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin' as const,
        first_name: 'Admin',
        last_name: 'User',
        country: 'south_africa' as const,
      },
    ],
  },
  realtime_test: {
    users: [
      {
        email: 'user1@test.com',
        password: 'password123',
        role: 'client' as const,
        first_name: 'User',
        last_name: 'One',
        country: 'south_africa' as const,
      },
      {
        email: 'user2@test.com',
        password: 'password123',
        role: 'freelancer' as const,
        first_name: 'User',
        last_name: 'Two',
        country: 'botswana' as const,
      },
    ],
    opportunities: [
      {
        title: 'Real-time Chat Test Opportunity',
        description: 'This opportunity is used for testing real-time chat functionality.',
        budget_min: 1000,
        budget_max: 5000,
        category: 'Testing',
        type: 'standard' as const,
        status: 'open' as const,
        client_country: 'south_africa' as const,
        required_skills: ['Testing'],
      },
    ],
  },
}

// Helper function to truncate all tables
async function truncateTables() {
  console.log('Truncating all tables...')
  
  const tables = [
    'token_transactions',
    'notifications',
    'messages',
    'reviews',
    'payments',
    'projects',
    'proposals',
    'opportunities',
    'user_skills',
    'portfolios',
    'profiles',
  ] as const

  for (const table of tables) {
    try {
      await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
      console.log(`✓ Truncated ${table}`)
    } catch (error) {
      console.error(`✗ Failed to truncate ${table}:`, error)
    }
  }
}

// Helper function to create a user and profile
async function createUser(userData: {
  email: string
  password: string
  role: 'client' | 'freelancer' | 'admin'
  first_name: string
  last_name: string
  country: Database['public']['Enums']['country_code']
}) {
  console.log(`Creating user: ${userData.email}`)
  
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: true,
    user_metadata: {
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role,
    },
  })

  if (authError) {
    console.error(`✗ Failed to create auth user ${userData.email}:`, authError)
    return null
  }

  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role,
      country: userData.country,
      tokens: 50, // Give test users some tokens
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

  if (profileError) {
    console.error(`✗ Failed to create profile for ${userData.email}:`, profileError)
    return null
  }

  console.log(`✓ Created user: ${userData.email} (${authData.user.id})`)
  return authData.user
}

// Helper function to create opportunities
async function createOpportunities(opportunities: any[], clientId: string) {
  for (const opp of opportunities) {
    console.log(`Creating opportunity: ${opp.title}`)
    
    const { data, error } = await supabase
      .from('opportunities')
      .insert({
        ...opp,
        client_id: clientId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error(`✗ Failed to create opportunity ${opp.title}:`, error)
    } else {
      console.log(`✓ Created opportunity: ${opp.title} (${data.id})`)
    }
  }
}

// Main seeding function
async function seedDatabase(scenarioName: string) {
  console.log(`\n🌱 Seeding database with scenario: ${scenarioName}`)
  
  const scenario = testScenarios[scenarioName as keyof typeof testScenarios]
  if (!scenario) {
    console.error(`✗ Unknown scenario: ${scenarioName}`)
    return
  }

  // Truncate existing data
  await truncateTables()

  // Create users
  const createdUsers: any[] = []
  for (const userData of scenario.users) {
    const user = await createUser(userData)
    if (user) {
      createdUsers.push({ ...user, ...userData })
    }
  }

  // Create opportunities for clients
  for (const user of createdUsers) {
    if (user.role === 'client' && 'opportunities' in scenario && scenario.opportunities) {
      await createOpportunities(scenario.opportunities, user.id)
    }
  }

  console.log(`\n✅ Database seeded successfully for scenario: ${scenarioName}`)
  console.log('Created users:')
  createdUsers.forEach(user => {
    console.log(`  - ${user.email} (${user.role}) - ID: ${user.id}`)
  })
}

// CLI interface
if (require.main === module) {
  const scenarioName = process.argv[2]
  if (!scenarioName) {
    console.log('Usage: npm run seed <scenario_name>')
    console.log('Available scenarios:', Object.keys(testScenarios).join(', '))
    process.exit(1)
  }

  seedDatabase(scenarioName)
    .then(() => {
      console.log('\n🎉 Seeding completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Seeding failed:', error)
      process.exit(1)
    })
}

export { seedDatabase, truncateTables, testScenarios } 