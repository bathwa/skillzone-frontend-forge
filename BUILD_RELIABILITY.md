# SkillZone Build Reliability & Debugging Guide

## Overview
This document provides a structured approach to maintaining build reliability and quickly resolving build failures in the SkillZone application.

## I. Immediate Reaction & Triage (Developer's First Line)

### 1. Read the Error Message (Fully!)
**This is the single most important step.** Error messages provide:
- Line numbers and file paths
- Clear descriptions of the problem
- Stack traces for runtime errors

#### Common Error Types:
- **Syntax Errors**: Missing semicolons, unmatched brackets, typos
- **Type Errors (TypeScript)**: Mismatched types, `any` usage in strict mode
- **Linter Errors**: Code style violations, unused variables
- **Test Failures**: Specific test file, assertion failure line
- **Dependency Issues**: Missing packages, version conflicts
- **Build Tool Errors (Vite/Rollup)**: Configuration issues, module resolution

### 2. Check Local Environment
```bash
# Check git status
git status
git diff

# Reinstall dependencies
npm install
# or
yarn install

# Clean cache
npm cache clean --force
# or
yarn cache clean

# For Vite: Clean and reinstall
rm -rf node_modules .vite build dist && npm install

# Restart dev server
npm run dev
```

### 3. Isolate the Change
If failure occurred after recent code change:
```bash
# Temporarily revert to known good state
git stash
# or
git checkout <previous-commit>

# Binary search for breaking change
# Comment out sections of code or revert commits one by one
```

## II. Deeper Debugging & Root Cause Analysis

### Frontend (UI/Logic) Failures

#### Browser Developer Tools
1. **Console Tab**:
   - JavaScript errors
   - Network request failures (4xx, 5xx)
   - Console logs from `console.log` statements

2. **Network Tab**:
   - Inspect every network request to Supabase
   - Check status codes, request/response payloads
   - Verify RLS policies aren't blocking requests
   - Check Edge Functions for errors

3. **Elements Tab**:
   - Inspect DOM structure
   - Verify components render as expected
   - Check styles are applied correctly

4. **Performance/Memory**:
   - Check for memory leaks
   - Identify performance bottlenecks

#### Debugging Tools
```bash
# React DevTools
# Install browser extension for React component inspection

# Zustand DevTools
# Inspect global state changes

# React Query DevTools
# Monitor data fetching, cache state, query status
```

#### Breakpoints & Step-through
```typescript
// Set breakpoints in VS Code or browser dev tools
// Step through React component lifecycle
// Debug state updates and API calls
```

### Backend (Supabase/PostgreSQL/Edge Functions) Failures

#### Supabase Dashboard Logs
1. **Auth Logs**: Authentication issues, RLS errors related to `auth.uid()`
2. **Database Logs**: RLS policy failures, SQL errors, trigger errors
3. **Edge Function Logs**: Console output, unhandled exceptions, timeouts

#### Manual Testing
```sql
-- Test RLS policies manually
SET role='authenticated';
SET jwt.claims.sub='<user-id>';
SELECT * FROM profiles WHERE id = '<user-id>';
```

#### Edge Function Local Development
```bash
# Run Edge Functions locally
supabase functions serve

# Test with mock environment variables
# Debug without redeploying
```

#### Network Request Testing
```bash
# Use Postman/Insomnia to test Edge Function endpoints
# Test with sample payloads and JWTs
# Isolate issues from frontend
```

### Build Tool / CI/CD Failures

#### CI/CD Pipeline Logs
- Review logs line by line
- Look for environment mismatches
- Check resource limits

#### Environment Consistency
```bash
# Check Node.js/npm versions
node --version
npm --version

# Ensure consistency between local and CI
# Handle OS-specific commands
# Verify missing dependencies
```

#### Configuration Files
- `vite.config.ts`
- `tailwind.config.js`
- `.env` files
- `.gitlab-ci.yml` or `.github/workflows/*.yml`

## III. Prevention & Continuous Improvement

### Code Quality Practices
```bash
# Small, frequent commits
git commit -m "feat: add user profile validation"

# Robust code reviews
# Peer review helps catch errors early

# Comprehensive testing
npm run test
npm run test:e2e

# Linters and formatters
npm run lint
npm run format

# Type checking
npm run type-check
```

### CI/CD Integration
```yaml
# Example GitHub Actions workflow
name: Build and Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run test:e2e
```

### Monitoring & Alerts
- **Application Performance Monitoring (APM)**: New Relic, DataDog
- **Error Tracking**: Sentry, LogRocket
- **Build Status Badges**: Display in README
- **Notifications**: Slack, email, GitHub comments

## IV. Common Build Issues & Solutions

### TypeScript Errors
```typescript
// Error: Property 'x' does not exist on type 'y'
// Solution: Check interface definitions, add missing properties

// Error: Type 'string' is not assignable to type 'number'
// Solution: Add proper type casting or validation

// Error: 'any' type is not allowed
// Solution: Define proper types, use 'unknown' instead
```

### Dependency Issues
```bash
# Version conflicts
npm ls <package-name>
npm update <package-name>

# Missing peer dependencies
npm install <peer-dependency>

# Native build tools (Windows)
npm install --global windows-build-tools
```

### Vite Build Issues
```typescript
// vite.config.ts troubleshooting
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['some-package'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Environment Variables
```bash
# Check .env files
cat .env.local
cat .env.production

# Verify environment variable access
console.log(import.meta.env.VITE_SUPABASE_URL)
```

## V. Emergency Procedures

### Critical Build Failure
1. **Immediate**: Revert to last working commit
2. **Investigation**: Create issue with error details
3. **Fix**: Implement solution in feature branch
4. **Test**: Verify fix locally and in staging
5. **Deploy**: Merge to main after thorough testing

### Production Issues
1. **Rollback**: Deploy previous working version
2. **Investigation**: Analyze logs and metrics
3. **Hotfix**: Implement critical fix
4. **Monitoring**: Watch for resolution
5. **Post-mortem**: Document lessons learned

## VI. Debugging Checklist

### Before Committing
- [ ] All tests pass locally
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Build succeeds
- [ ] E2E tests pass
- [ ] Code review completed

### When Build Fails
- [ ] Read error message completely
- [ ] Check git status and recent changes
- [ ] Verify local environment
- [ ] Isolate the breaking change
- [ ] Check browser dev tools
- [ ] Review Supabase logs
- [ ] Test manually if needed
- [ ] Document the issue and solution

### After Fixing
- [ ] Test the fix thoroughly
- [ ] Update documentation if needed
- [ ] Share solution with team
- [ ] Consider prevention measures

## VII. Resources

### Documentation
- [Vite Configuration](https://vitejs.dev/config/)
- [Cypress Testing](https://docs.cypress.io/)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tools
- [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools)
- [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools)
- [Postman](https://www.postman.com/)
- [VS Code Extensions](https://marketplace.visualstudio.com/)

### Support
- [GitHub Issues](https://github.com/bathwa/skillzone-frontend-forge/issues)
- [Team Chat Channel](#)
- [Emergency Contact](#) 