# SkillZone - Freelancing Platform for Southern Africa

A modern, full-stack freelancing platform built for the Southern African market, connecting clients with skilled freelancers across the region.

## 🚀 Features

### For Clients
- **Post Opportunities**: Create detailed project listings with budgets and requirements
- **Review Proposals**: Browse and evaluate freelancer proposals
- **Secure Payments**: Escrow-based payment system for project security
- **Real-time Communication**: Built-in chat system for project collaboration
- **Project Management**: Track project progress and milestones

### For Freelancers
- **Browse Opportunities**: Discover projects matching your skills
- **Submit Proposals**: Create compelling project proposals
- **Portfolio Management**: Showcase your work and skills
- **Token System**: Purchase access to premium opportunities
- **Earnings Tracking**: Monitor your income and project status

### For Admins
- **Platform Management**: Oversee all platform activities
- **User Management**: Monitor and manage user accounts
- **Payment Processing**: Handle token purchases and withdrawals
- **Analytics Dashboard**: View platform metrics and insights

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **React Router** for navigation
- **React Hook Form** with Zod validation
- **Zustand** for state management
- **TanStack Query** for data fetching

### Backend & Database
- **Supabase** for backend services
- **PostgreSQL** database
- **Real-time subscriptions** for live updates
- **Row Level Security** for data protection
- **Authentication** with email/password and admin keys

### Additional Features
- **PWA Support** for mobile app-like experience
- **Offline-first** architecture
- **Multi-country support** for Southern Africa
- **Escrow payment system**
- **Real-time notifications**

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd skillzone-frontend-forge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_ADMIN_EMAIL_1=admin1@example.com
   VITE_ADMIN_EMAIL_2=admin2@example.com
   VITE_ADMIN_KEY=your_admin_key
   ```

4. **Database Setup**
   - Set up your Supabase project
   - Run the migration in `supabase/migrations/`
   - Configure Row Level Security policies

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components
│   └── ui/             # Shadcn/ui components
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client and types
├── lib/                # Utility libraries
│   ├── services/       # API services
│   └── utils.ts        # Helper functions
├── pages/              # Page components
│   ├── admin/          # Admin pages
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard pages
│   └── opportunities/  # Opportunity pages
├── stores/             # Zustand state stores
└── main.tsx           # Application entry point
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run preview` - Preview production build

## 🌍 Multi-Country Support

SkillZone supports multiple Southern African countries with:
- Localized currency and payment methods
- Country-specific escrow accounts
- Regional support contacts
- Localized content and messaging

### Supported Countries
- Zimbabwe (Primary)
- South Africa
- Botswana
- Namibia
- Zambia
- Lesotho
- Eswatini
- Malawi
- Mozambique
- Tanzania
- Angola
- Madagascar
- Mauritius
- Seychelles
- Comoros

## 🔐 Security Features

- **Row Level Security** on all database tables
- **Email verification** for new accounts
- **Admin key authentication** for administrative access
- **Token-based access control** for premium features
- **Escrow payment protection** for project security

## 📱 PWA Features

- **Offline support** for core functionality
- **App-like experience** on mobile devices
- **Push notifications** for real-time updates
- **Install prompt** for easy app installation

## 🚀 Deployment

### Netlify (Recommended)
1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push to main branch

### Vercel
1. Import project to Vercel
2. Configure environment variables
3. Deploy with automatic CI/CD

### Manual Deployment
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: admin@abathwa.com
- WhatsApp: +263 78 998 9619
- Platform: [SkillZone](https://skillzone.abathwa.com)

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] AI-powered project matching
- [ ] Video calling integration
- [ ] Advanced payment gateways
- [ ] Multi-language support
- [ ] Advanced project management tools

---

**Built with ❤️ for Southern Africa**
