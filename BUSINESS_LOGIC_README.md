# SkillZone Business Logic System

This document outlines the comprehensive business logic system implemented for the SkillZone freelancing platform, designed with offline-first capabilities, PWA support, and country-based access control.

## 🏗️ Architecture Overview

The business logic system is built with the following principles:
- **Modular Design**: Each service is self-contained and follows singleton pattern
- **Offline-First**: All data operations work offline with sync when online
- **PWA Ready**: Full Progressive Web App support with service worker
- **Country-Based Access**: Regional restrictions and localized content
- **Escrow Payments**: Manual payment system with admin management

## 📁 Core Services

### 1. Constants (`src/lib/constants.ts`)
Central configuration for the entire application:

```typescript
// Country configurations with escrow accounts and support contacts
export const COUNTRY_CONFIGS = {
  zimbabwe: {
    name: 'Zimbabwe',
    currency_symbol: '$',
    escrow_accounts: [...],
    support_contacts: [...],
    payment_gateways: [...]
  }
}

// Token pricing tiers
export const TOKEN_PRICING = {
  starter: { tokens: 10, price_usd: 5, description: 'Perfect for beginners' },
  professional: { tokens: 50, price_usd: 20, description: 'For active freelancers' },
  // ...
}
```

### 2. Country Service (`src/lib/services/countryService.ts`)
Handles country detection, filtering, and regional configurations:

```typescript
// Detect user's country
const userCountry = countryService.getUserCountry()

// Get country-specific escrow accounts
const escrowAccounts = countryService.getEscrowAccounts()

// Filter data by country
const filteredOpportunities = countryService.filterByCountry(opportunities)
```

### 3. Token Service (`src/lib/services/tokenService.ts`)
Manages token purchases, transactions, and escrow payments:

```typescript
// Create token purchase request
const result = await tokenService.createTokenPurchase({
  packageType: 'professional',
  paymentMethod: 'escrow'
})

// Get user's token balance
const balance = await tokenService.getUserTokenBalance(userId)

// Credit/debit tokens
await tokenService.creditTokens(userId, 50, 'Purchase', transactionId)
```

### 4. Opportunity Service (`src/lib/services/opportunityService.ts`)
Handles opportunities and proposals with country-based filtering:

```typescript
// Get opportunities filtered by country
const opportunities = await opportunityService.getOpportunities({
  status: 'open',
  category: 'web-development'
})

// Create proposal with token cost check
const result = await opportunityService.createProposal({
  opportunity_id: '123',
  cover_letter: 'I can help with this project...',
  proposed_budget: 500
})
```

### 5. Cache Service (`src/lib/services/cacheService.ts`)
Provides offline-first caching with localStorage persistence:

```typescript
// Cache data with expiration
cacheService.set('opportunities', 'key', data, 3600000) // 1 hour

// Get cached data
const cachedData = cacheService.get('opportunities', 'key')

// Sync cache when online
await cacheService.syncPendingOperations()
```

### 6. PWA Service (`src/lib/services/pwaService.ts`)
Manages Progressive Web App functionality:

```typescript
// Register service worker
await pwaService.register()

// Show install prompt
await pwaService.showInstallPrompt()

// Subscribe to push notifications
await pwaService.subscribeToPushNotifications()
```

## 🎣 React Hooks

### Enhanced Opportunities Hook (`src/hooks/useOpportunities.ts`)
```typescript
// Get opportunities with caching and country filtering
const { data: opportunities, isLoading } = useOpportunities({
  status: 'open',
  category: 'web-development'
})

// Create opportunity
const createOpportunity = useCreateOpportunity()
await createOpportunity.mutateAsync({
  title: 'Website Development',
  description: 'Need a modern website...',
  category: 'web-development',
  budget_min: 500,
  budget_max: 2000,
  type: 'standard'
})
```

### Token Management Hook (`src/hooks/useTokens.ts`)
```typescript
// Get token balance
const { data: balance } = useTokenBalance()

// Create token purchase
const createPurchase = useCreateTokenPurchase()
await createPurchase.mutateAsync({
  packageType: 'professional',
  paymentMethod: 'escrow'
})

// Get token transactions
const { data: transactions } = useTokenTransactions()
```

### PWA Hook (`src/hooks/usePWA.ts`)
```typescript
const {
  isInstalled,
  isInstallable,
  isOnline,
  showInstallPrompt,
  subscribeToPushNotifications
} = usePWA()

// Show install prompt when available
if (isInstallable) {
  await showInstallPrompt()
}
```

## 🖥️ UI Components

### Admin Dashboard (`src/pages/admin/AdminDashboard.tsx`)
Comprehensive admin interface for managing:
- Escrow accounts per country
- Support contacts
- Platform statistics
- User management

### Token Purchase (`src/pages/tokens/TokenPurchase.tsx`)
Complete token purchase flow with:
- Package selection
- Escrow payment instructions
- Support contact integration
- Payment verification

## 🔧 Configuration

### PWA Configuration (`public/manifest.json`)
```json
{
  "name": "SkillZone",
  "short_name": "SkillZone",
  "description": "Freelancing platform for Southern Africa",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [...]
}
```

### Service Worker (`public/sw.js`)
Implements:
- Offline caching strategies
- Background sync
- Push notifications
- Cache-first approach for static assets

## 🚀 Usage Examples

### 1. Creating an Opportunity with Country Filtering
```typescript
import { useCreateOpportunity } from '@/hooks/useOpportunities'
import { countryService } from '@/lib/services/countryService'

const CreateOpportunity = () => {
  const createOpportunity = useCreateOpportunity()
  const userCountry = countryService.getUserCountry()

  const handleSubmit = async (data) => {
    await createOpportunity.mutateAsync({
      ...data,
      country: userCountry // Automatically set user's country
    })
  }
}
```

### 2. Token Purchase with Escrow
```typescript
import { useCreateTokenPurchase } from '@/hooks/useTokens'
import { tokenService } from '@/lib/services/tokenService'

const TokenPurchase = () => {
  const createPurchase = useCreateTokenPurchase()

  const handlePurchase = async (packageType) => {
    const result = await createPurchase.mutateAsync({
      packageType,
      paymentMethod: 'escrow'
    })

    if (result.success) {
      // Show escrow payment instructions
      setEscrowDetails(result.escrowDetails)
    }
  }
}
```

### 3. Offline-First Data Loading
```typescript
import { useOpportunities } from '@/hooks/useOpportunities'
import { cacheService } from '@/lib/services/cacheService'

const OpportunitiesList = () => {
  const { data: opportunities, isLoading } = useOpportunities()

  // Data is automatically cached and available offline
  // Cache is synced when online
}
```

## 🔒 Security & Access Control

### Country-Based Restrictions
- All data is filtered by user's country
- Escrow accounts are country-specific
- Support contacts are localized
- Payment gateways are regional

### Token-Based Access
- Opportunities require tokens to submit proposals
- Premium features require token purchases
- Admin can credit/debit tokens
- All transactions are logged

### Row-Level Security (RLS)
- Database policies enforce access control
- Users can only access their own data
- Country-based filtering at database level

## 📱 PWA Features

### Offline Functionality
- All data cached locally
- Operations queued when offline
- Automatic sync when online
- Offline-first UI indicators

### Install Experience
- Install prompt for eligible users
- Standalone app experience
- App-like navigation
- Splash screen and icons

### Push Notifications
- Proposal notifications
- Payment confirmations
- System updates
- Custom notifications

## 🔄 Data Flow

1. **User Action** → React Hook → Service Layer
2. **Service Layer** → Cache Check → API Call (if needed)
3. **API Response** → Cache Update → UI Update
4. **Offline Queue** → Background Sync → Server Update

## 🛠️ Development

### Adding New Services
1. Create service file in `src/lib/services/`
2. Implement singleton pattern
3. Add TypeScript interfaces
4. Create corresponding React hooks
5. Update constants if needed

### Testing
```bash
# Run tests
npm test

# Test PWA functionality
npm run build
npm run preview
```

### Deployment
```bash
# Build for production
npm run build

# Deploy to hosting platform
# Ensure service worker is served correctly
```

## 📊 Monitoring & Analytics

### Cache Performance
- Monitor cache hit rates
- Track offline usage
- Measure sync success rates

### User Engagement
- PWA install rates
- Offline usage patterns
- Token purchase conversion

### Platform Health
- API response times
- Error rates by country
- Payment success rates

## 🔮 Future Enhancements

### Payment Gateways
- PayFast integration for South Africa
- PayStack integration for Nigeria
- Mobile money integration
- Cryptocurrency support

### Advanced PWA Features
- Background sync for proposals
- Offline proposal drafting
- Push notification scheduling
- Advanced caching strategies

### Analytics & Insights
- Real-time dashboard
- User behavior analytics
- Revenue tracking
- Performance monitoring

## 📞 Support

For questions or issues with the business logic system:
- Check the service documentation
- Review the TypeScript interfaces
- Test with the provided examples
- Contact the development team

---

This business logic system provides a solid foundation for the SkillZone platform with modern web technologies, offline capabilities, and scalable architecture. 