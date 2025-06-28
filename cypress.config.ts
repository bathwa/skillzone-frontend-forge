import { defineConfig } from 'cypress'
import { devServer } from '@cypress/vite-dev-server'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8082',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('dev-server:start', (options) => {
        return devServer({
          ...options,
          viteConfig: {
            configFile: 'vite.config.ts',
          },
        })
      })
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
  env: {
    SUPABASE_URL: 'https://bexdvmnrwqlcfxygpnlu.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJleGR2bW5yd3FsY2Z4eWdwbmx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMjc3NzgsImV4cCI6MjA2NjYwMzc3OH0.M-rmoA2KwV9uFhl8a1PYVMqMMDaXEgmq0BqaGqcJ_C4',
  },
}) 