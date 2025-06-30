# SkillZone - Production Deployment Guide

SkillZone is a freelancing platform specifically designed for Southern Africa, connecting skilled professionals with clients across the region.

## 🚀 Production Features

- **Real-time Authentication** - Secure user authentication with Supabase
- **Multi-country Support** - Support for 15 Southern African countries
- **Token-based Economy** - Integrated token system for platform transactions
- **Escrow Payment System** - Secure payment handling via escrow accounts
- **PWA Ready** - Progressive Web App capabilities for mobile experience
- **Responsive Design** - Modern UI with shadcn/ui components

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase project with the database migrations applied
- Production domain/hosting setup

## 🔧 Environment Configuration

1. Copy the environment example file:
   ```bash
   cp .env.example .env.production
   ```

2. Configure the production environment variables:
   ```env
   # Supabase Configuration (Required)
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Admin Configuration (Required)
   VITE_ADMIN_EMAIL_1=admin1@yourdomain.com
   VITE_ADMIN_EMAIL_2=admin2@yourdomain.com
   VITE_ADMIN_KEY=your_secure_admin_key

   # Application Configuration
   VITE_APP_URL=https://your-production-domain.com
   VITE_APP_NAME=SkillZone
   VITE_APP_DESCRIPTION=Freelancing platform for Southern Africa

   # PWA Configuration (Optional)
   VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
   ```

## 🗄️ Database Setup

1. Apply the Supabase migrations:
   ```bash
   # Run migrations in order
   supabase db push
   ```

2. Verify the following tables exist:
   - profiles, escrow_accounts, support_contacts
   - opportunities, proposals, projects, payments
   - skills, user_skills, reviews, messages
   - notifications, portfolios, token_transactions

3. Ensure Row Level Security (RLS) policies are enabled

## 🏗️ Build and Deploy

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build for production:
   ```bash
   npm run build
   ```

3. Preview the production build locally:
   ```bash
   npm run preview
   ```

4. Deploy the `dist` folder to your hosting provider

## 🔐 Security Checklist

- [x] Environment variables properly configured
- [x] Supabase RLS policies enabled
- [x] Admin authentication secured with secret key
- [x] Debug panels disabled in production
- [x] Console logs minimized
- [x] HTTPS enabled on production domain

## 🌍 Supported Countries

- South Africa, Botswana, Zimbabwe, Namibia
- Zambia, Lesotho, Eswatini, Malawi
- Mozambique, Tanzania, Angola, Madagascar
- Mauritius, Seychelles, Comoros

## 🎯 Key Features

### For Freelancers
- Create professional profiles with skills and portfolios
- Browse and apply to opportunities
- Manage proposals and projects
- Earn tokens and receive payments

### For Clients
- Post opportunities and requirements
- Review freelancer proposals
- Manage active projects
- Secure payment through escrow system

### For Admins
- User and platform management
- Financial oversight and reporting
- Content moderation tools
- System configuration

## 📱 PWA Installation

The application supports Progressive Web App installation:
1. Visit the website on mobile/desktop
2. Browser will prompt for installation
3. Add to home screen for app-like experience

## 🔧 Production Monitoring

Monitor the following in production:
- Supabase database performance
- Authentication success rates
- Payment processing status
- User activity and engagement
- Error rates and performance metrics

## 🆘 Support

For production issues:
- Check Supabase logs for database errors
- Monitor browser console for client-side issues
- Verify environment variables are correctly set
- Ensure all migrations have been applied

## 📄 License

This project is proprietary software developed for Abathwa Incubator PBC.

---

**Built with:** React + TypeScript + Vite + Supabase + Tailwind CSS + shadcn/ui