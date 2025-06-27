import type { Database } from '@/integrations/supabase/types'

export type CountryCode = Database['public']['Enums']['country_code']

export interface EscrowAccount {
  id: string
  country: CountryCode
  account_name: string
  account_number: string
  account_type: 'mobile_wallet' | 'bank_account' | 'digital_wallet'
  provider?: string // e.g., 'Ecocash', 'Innbucks', 'Standard Bank'
  phone_number?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SupportContact {
  id: string
  country: CountryCode
  phone: string
  email: string
  whatsapp: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CountryConfig {
  code: CountryCode
  name: string
  currency: string
  currency_symbol: string
  phone_code: string
  timezone: string
  escrow_accounts: EscrowAccount[]
  support_contacts: SupportContact[]
  payment_gateways: string[]
  is_active: boolean
}

// Default Zimbabwe configuration
export const ZIMBABWE_CONFIG: CountryConfig = {
  code: 'zimbabwe',
  name: 'Zimbabwe',
  currency: 'USD',
  currency_symbol: '$',
  phone_code: '+263',
  timezone: 'Africa/Harare',
  escrow_accounts: [
    {
      id: '1',
      country: 'zimbabwe',
      account_name: 'Vusa Ncube',
      account_number: '0788420479',
      account_type: 'mobile_wallet',
      provider: 'Ecocash, Omari, Innbucks',
      phone_number: '0788420479',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      country: 'zimbabwe',
      account_name: 'Abathwa Incubator PBC',
      account_number: '013113351190001',
      account_type: 'bank_account',
      provider: 'Innbucks MicroBank',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  support_contacts: [
    {
      id: '1',
      country: 'zimbabwe',
      phone: '+263 78 998 9619',
      email: 'admin@abathwa.com',
      whatsapp: 'wa.me/789989619',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  payment_gateways: ['escrow'],
  is_active: true,
}

export const COUNTRY_CONFIGS: Record<CountryCode, CountryConfig> = {
  zimbabwe: ZIMBABWE_CONFIG,
  south_africa: {
    code: 'south_africa',
    name: 'South Africa',
    currency: 'ZAR',
    currency_symbol: 'R',
    phone_code: '+27',
    timezone: 'Africa/Johannesburg',
    escrow_accounts: [],
    support_contacts: [],
    payment_gateways: ['payfast', 'paystack', 'escrow'],
    is_active: true,
  },
  botswana: {
    code: 'botswana',
    name: 'Botswana',
    currency: 'BWP',
    currency_symbol: 'P',
    phone_code: '+267',
    timezone: 'Africa/Gaborone',
    escrow_accounts: [],
    support_contacts: [],
    payment_gateways: ['paystack', 'escrow'],
    is_active: true,
  },
  namibia: {
    code: 'namibia',
    name: 'Namibia',
    currency: 'NAD',
    currency_symbol: 'N$',
    phone_code: '+264',
    timezone: 'Africa/Windhoek',
    escrow_accounts: [],
    support_contacts: [],
    payment_gateways: ['paystack', 'escrow'],
    is_active: true,
  },
  zambia: {
    code: 'zambia',
    name: 'Zambia',
    currency: 'ZMW',
    currency_symbol: 'K',
    phone_code: '+260',
    timezone: 'Africa/Lusaka',
    escrow_accounts: [],
    support_contacts: [],
    payment_gateways: ['paystack', 'escrow'],
    is_active: true,
  },
  lesotho: {
    code: 'lesotho',
    name: 'Lesotho',
    currency: 'LSL',
    currency_symbol: 'L',
    phone_code: '+266',
    timezone: 'Africa/Maseru',
    escrow_accounts: [],
    support_contacts: [],
    payment_gateways: ['escrow'],
    is_active: true,
  },
  eswatini: {
    code: 'eswatini',
    name: 'Eswatini',
    currency: 'SZL',
    currency_symbol: 'L',
    phone_code: '+268',
    timezone: 'Africa/Mbabane',
    escrow_accounts: [],
    support_contacts: [],
    payment_gateways: ['escrow'],
    is_active: true,
  },
  malawi: {
    code: 'malawi',
    name: 'Malawi',
    currency: 'MWK',
    currency_symbol: 'MK',
    phone_code: '+265',
    timezone: 'Africa/Blantyre',
    escrow_accounts: [],
    support_contacts: [],
    payment_gateways: ['paystack', 'escrow'],
    is_active: true,
  },
  mozambique: {
    code: 'mozambique',
    name: 'Mozambique',
    currency: 'MZN',
    currency_symbol: 'MT',
    phone_code: '+258',
    timezone: 'Africa/Maputo',
    escrow_accounts: [],
    support_contacts: [],
    payment_gateways: ['paystack', 'escrow'],
    is_active: true,
  },
  tanzania: {
    code: 'tanzania',
    name: 'Tanzania',
    currency: 'TZS',
    currency_symbol: 'TSh',
    phone_code: '+255',
    timezone: 'Africa/Dar_es_Salaam',
    escrow_accounts: [],
    support_contacts: [],
    payment_gateways: ['paystack', 'escrow'],
    is_active: true,
  },
  angola: {
    code: 'angola',
    name: 'Angola',
    currency: 'AOA',
    currency_symbol: 'Kz',
    phone_code: '+244',
    timezone: 'Africa/Luanda',
    escrow_accounts: [],
    support_contacts: [],
    payment_gateways: ['paystack', 'escrow'],
    is_active: true,
  },
  madagascar: {
    code: 'madagascar',
    name: 'Madagascar',
    currency: 'MGA',
    currency_symbol: 'Ar',
    phone_code: '+261',
    timezone: 'Indian/Antananarivo',
    escrow_accounts: [],
    support_contacts: [],
    payment_gateways: ['escrow'],
    is_active: true,
  },
  mauritius: {
    code: 'mauritius',
    name: 'Mauritius',
    currency: 'MUR',
    currency_symbol: '₨',
    phone_code: '+230',
    timezone: 'Indian/Mauritius',
    escrow_accounts: [],
    support_contacts: [],
    payment_gateways: ['paystack', 'escrow'],
    is_active: true,
  },
  seychelles: {
    code: 'seychelles',
    name: 'Seychelles',
    currency: 'SCR',
    currency_symbol: '₨',
    phone_code: '+248',
    timezone: 'Indian/Mahe',
    escrow_accounts: [],
    support_contacts: [],
    payment_gateways: ['escrow'],
    is_active: true,
  },
  comoros: {
    code: 'comoros',
    name: 'Comoros',
    currency: 'KMF',
    currency_symbol: 'CF',
    phone_code: '+269',
    timezone: 'Indian/Comoro',
    escrow_accounts: [],
    support_contacts: [],
    payment_gateways: ['escrow'],
    is_active: true,
  },
}

// Token pricing configuration
export const TOKEN_PRICING = {
  basic: {
    tokens: 5,
    price_usd: 5,
    description: 'Basic package - 5 tokens',
  },
  standard: {
    tokens: 15,
    price_usd: 12,
    description: 'Standard package - 15 tokens (20% discount)',
  },
  premium: {
    tokens: 35,
    price_usd: 25,
    description: 'Premium package - 35 tokens (30% discount)',
  },
  enterprise: {
    tokens: 100,
    price_usd: 60,
    description: 'Enterprise package - 100 tokens (40% discount)',
  },
}

// Platform fees
export const PLATFORM_FEES = {
  standard_opportunity: 0.10, // 10% for standard opportunities
  premium_opportunity: 0.08, // 8% for premium opportunities
  token_purchase: 0.05, // 5% processing fee for token purchases
}

// Skill categories for filtering
export const SKILL_CATEGORIES = [
  'Frontend Development',
  'Backend Development',
  'Mobile Development',
  'Design',
  'Marketing',
  'Writing',
  'Data Science',
  'Management',
  'Language',
  'Media',
  'CMS',
] as const

// Opportunity categories
export const OPPORTUNITY_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Digital Marketing',
  'Content Writing',
  'Data Analysis',
  'Project Management',
  'Translation',
  'Video Editing',
  'Photography',
  'SEO',
  'Social Media Management',
  'E-commerce',
  'WordPress',
  'Other',
] as const

// PWA Configuration
export const PWA_CONFIG = {
  name: 'SkillZone',
  short_name: 'SkillZone',
  description: 'Freelancing platform for Southern Africa',
  theme_color: '#0f172a',
  background_color: '#ffffff',
  display: 'standalone',
  orientation: 'portrait',
  scope: '/',
  start_url: '/',
  icons: [
    {
      src: '/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: '/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
    },
  ],
}

// Cache configuration for offline-first
export const CACHE_CONFIG = {
  opportunities: {
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxItems: 100,
  },
  profiles: {
    maxAge: 10 * 60 * 1000, // 10 minutes
    maxItems: 50,
  },
  skills: {
    maxAge: 60 * 60 * 1000, // 1 hour
    maxItems: 200,
  },
  projects: {
    maxAge: 2 * 60 * 1000, // 2 minutes
    maxItems: 50,
  },
} 