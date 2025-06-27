import { COUNTRY_CONFIGS, type CountryCode, type CountryConfig } from '@/lib/constants'
import { useAuthStore } from '@/stores/authStore'

export class CountryService {
  private static instance: CountryService
  private currentCountry: CountryCode | null = null

  private constructor() {}

  static getInstance(): CountryService {
    if (!CountryService.instance) {
      CountryService.instance = new CountryService()
    }
    return CountryService.instance
  }

  // Get user's country from auth store or detect from browser
  getUserCountry(): CountryCode {
    const { user } = useAuthStore.getState()
    
    if (user?.country) {
      return user.country
    }

    // Fallback to browser detection or default
    return this.detectCountryFromBrowser() || 'zimbabwe'
  }

  // Detect country from browser locale/timezone
  private detectCountryFromBrowser(): CountryCode | null {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const locale = navigator.language || navigator.languages[0]

      // Map timezones to countries
      const timezoneMap: Record<string, CountryCode> = {
        'Africa/Harare': 'zimbabwe',
        'Africa/Johannesburg': 'south_africa',
        'Africa/Gaborone': 'botswana',
        'Africa/Windhoek': 'namibia',
        'Africa/Lusaka': 'zambia',
        'Africa/Maseru': 'lesotho',
        'Africa/Mbabane': 'eswatini',
        'Africa/Blantyre': 'malawi',
        'Africa/Maputo': 'mozambique',
        'Africa/Dar_es_Salaam': 'tanzania',
        'Africa/Luanda': 'angola',
        'Indian/Antananarivo': 'madagascar',
        'Indian/Mauritius': 'mauritius',
        'Indian/Mahe': 'seychelles',
        'Indian/Comoro': 'comoros',
      }

      if (timezone && timezoneMap[timezone]) {
        return timezoneMap[timezone]
      }

      // Try to detect from locale
      const countryFromLocale = locale.split('-')[1]?.toLowerCase()
      if (countryFromLocale) {
        const countryMap: Record<string, CountryCode> = {
          'zw': 'zimbabwe',
          'za': 'south_africa',
          'bw': 'botswana',
          'na': 'namibia',
          'zm': 'zambia',
          'ls': 'lesotho',
          'sz': 'eswatini',
          'mw': 'malawi',
          'mz': 'mozambique',
          'tz': 'tanzania',
          'ao': 'angola',
          'mg': 'madagascar',
          'mu': 'mauritius',
          'sc': 'seychelles',
          'km': 'comoros',
        }
        
        if (countryMap[countryFromLocale]) {
          return countryMap[countryFromLocale]
        }
      }
    } catch (error) {
      console.warn('Failed to detect country from browser:', error)
    }

    return null
  }

  // Get country configuration
  getCountryConfig(country?: CountryCode): CountryConfig {
    const targetCountry = country || this.getUserCountry()
    return COUNTRY_CONFIGS[targetCountry] || COUNTRY_CONFIGS.zimbabwe
  }

  // Get all active countries
  getActiveCountries(): CountryConfig[] {
    return Object.values(COUNTRY_CONFIGS).filter(config => config.is_active)
  }

  // Check if user can access content from a specific country
  canAccessCountryContent(targetCountry: CountryCode): boolean {
    const userCountry = this.getUserCountry()
    return userCountry === targetCountry
  }

  // Filter opportunities by country
  filterByCountry<T extends { client_country?: CountryCode }>(items: T[]): T[] {
    const userCountry = this.getUserCountry()
    return items.filter(item => item.client_country === userCountry)
  }

  // Get escrow accounts for a country
  getEscrowAccounts(country?: CountryCode): CountryConfig['escrow_accounts'] {
    const config = this.getCountryConfig(country)
    return config.escrow_accounts.filter(account => account.is_active)
  }

  // Get support contacts for a country
  getSupportContacts(country?: CountryCode): CountryConfig['support_contacts'] {
    const config = this.getCountryConfig(country)
    return config.support_contacts.filter(contact => contact.is_active)
  }

  // Get available payment gateways for a country
  getPaymentGateways(country?: CountryCode): string[] {
    const config = this.getCountryConfig(country)
    return config.payment_gateways
  }

  // Format currency for a country
  formatCurrency(amount: number, country?: CountryCode): string {
    const config = this.getCountryConfig(country)
    return `${config.currency_symbol}${amount.toFixed(2)}`
  }

  // Convert currency (placeholder for future implementation)
  convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
    // TODO: Implement currency conversion using exchange rate API
    // For now, return the same amount
    return amount
  }

  // Set current country (for testing or manual override)
  setCurrentCountry(country: CountryCode): void {
    this.currentCountry = country
  }

  // Get current country
  getCurrentCountry(): CountryCode {
    return this.currentCountry || this.getUserCountry()
  }
}

// Export singleton instance
export const countryService = CountryService.getInstance() 