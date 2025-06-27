import { CACHE_CONFIG } from '@/lib/constants'

interface CacheItem<T> {
  data: T
  timestamp: number
  key: string
}

interface CacheConfig {
  maxAge: number
  maxItems: number
}

export class CacheService {
  private static instance: CacheService
  private caches: Map<string, Map<string, CacheItem<any>>> = new Map()
  private configs: Map<string, CacheConfig> = new Map()

  private constructor() {
    this.initializeCaches()
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }
    return CacheService.instance
  }

  private initializeCaches(): void {
    Object.entries(CACHE_CONFIG).forEach(([cacheName, config]) => {
      this.caches.set(cacheName, new Map())
      this.configs.set(cacheName, config)
    })
  }

  // Set data in cache
  set<T>(cacheName: string, key: string, data: T): void {
    const cache = this.caches.get(cacheName)
    const config = this.configs.get(cacheName)

    if (!cache || !config) {
      console.warn(`Cache "${cacheName}" not found`)
      return
    }

    // Clean expired items
    this.cleanExpired(cacheName)

    // Remove oldest items if cache is full
    if (cache.size >= config.maxItems) {
      const oldestKey = this.getOldestKey(cache)
      if (oldestKey) {
        cache.delete(oldestKey)
      }
    }

    // Add new item
    cache.set(key, {
      data,
      timestamp: Date.now(),
      key,
    })

    // Persist to localStorage for offline access
    this.persistToStorage(cacheName, key, data)
  }

  // Get data from cache
  get<T>(cacheName: string, key: string): T | null {
    const cache = this.caches.get(cacheName)
    const config = this.configs.get(cacheName)

    if (!cache || !config) {
      return null
    }

    const item = cache.get(key)
    if (!item) {
      // Try to load from localStorage
      const storedData = this.loadFromStorage(cacheName, key)
      if (storedData) {
        this.set(cacheName, key, storedData)
        return storedData
      }
      return null
    }

    // Check if item is expired
    if (Date.now() - item.timestamp > config.maxAge) {
      cache.delete(key)
      this.removeFromStorage(cacheName, key)
      return null
    }

    return item.data
  }

  // Check if data exists in cache and is not expired
  has(cacheName: string, key: string): boolean {
    const cache = this.caches.get(cacheName)
    const config = this.configs.get(cacheName)

    if (!cache || !config) {
      return false
    }

    const item = cache.get(key)
    if (!item) {
      return this.loadFromStorage(cacheName, key) !== null
    }

    return Date.now() - item.timestamp <= config.maxAge
  }

  // Remove item from cache
  delete(cacheName: string, key: string): void {
    const cache = this.caches.get(cacheName)
    if (cache) {
      cache.delete(key)
      this.removeFromStorage(cacheName, key)
    }
  }

  // Clear entire cache
  clear(cacheName: string): void {
    const cache = this.caches.get(cacheName)
    if (cache) {
      cache.clear()
      this.clearStorage(cacheName)
    }
  }

  // Get all keys in cache
  keys(cacheName: string): string[] {
    const cache = this.caches.get(cacheName)
    return cache ? Array.from(cache.keys()) : []
  }

  // Get cache size
  size(cacheName: string): number {
    const cache = this.caches.get(cacheName)
    return cache ? cache.size : 0
  }

  // Clean expired items from cache
  private cleanExpired(cacheName: string): void {
    const cache = this.caches.get(cacheName)
    const config = this.configs.get(cacheName)

    if (!cache || !config) {
      return
    }

    const now = Date.now()
    const expiredKeys: string[] = []

    cache.forEach((item, key) => {
      if (now - item.timestamp > config.maxAge) {
        expiredKeys.push(key)
      }
    })

    expiredKeys.forEach(key => {
      cache.delete(key)
      this.removeFromStorage(cacheName, key)
    })
  }

  // Get oldest key in cache
  private getOldestKey(cache: Map<string, CacheItem<any>>): string | null {
    let oldestKey: string | null = null
    let oldestTime = Infinity

    cache.forEach((item, key) => {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
        oldestKey = key
      }
    })

    return oldestKey
  }

  // Persist data to localStorage
  private persistToStorage(cacheName: string, key: string, data: any): void {
    try {
      const storageKey = `cache_${cacheName}_${key}`
      const storageData = {
        data,
        timestamp: Date.now(),
      }
      localStorage.setItem(storageKey, JSON.stringify(storageData))
    } catch (error) {
      console.warn('Failed to persist to localStorage:', error)
    }
  }

  // Load data from localStorage
  private loadFromStorage(cacheName: string, key: string): any | null {
    try {
      const storageKey = `cache_${cacheName}_${key}`
      const stored = localStorage.getItem(storageKey)
      
      if (!stored) {
        return null
      }

      const storageData = JSON.parse(stored)
      const config = this.configs.get(cacheName)

      // Check if stored data is still valid
      if (config && Date.now() - storageData.timestamp > config.maxAge) {
        localStorage.removeItem(storageKey)
        return null
      }

      return storageData.data
    } catch (error) {
      console.warn('Failed to load from localStorage:', error)
      return null
    }
  }

  // Remove data from localStorage
  private removeFromStorage(cacheName: string, key: string): void {
    try {
      const storageKey = `cache_${cacheName}_${key}`
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error)
    }
  }

  // Clear all storage for a cache
  private clearStorage(cacheName: string): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(`cache_${cacheName}_`)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  }

  // Get cache statistics
  getStats(): Record<string, { size: number; maxItems: number; maxAge: number }> {
    const stats: Record<string, { size: number; maxItems: number; maxAge: number }> = {}
    
    this.caches.forEach((cache, cacheName) => {
      const config = this.configs.get(cacheName)
      if (config) {
        stats[cacheName] = {
          size: cache.size,
          maxItems: config.maxItems,
          maxAge: config.maxAge,
        }
      }
    })

    return stats
  }

  // Preload data for offline access
  async preloadData<T>(
    cacheName: string,
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T | null> {
    try {
      // Check if we already have fresh data
      if (this.has(cacheName, key)) {
        return this.get<T>(cacheName, key)
      }

      // Fetch fresh data
      const data = await fetchFn()
      this.set(cacheName, key, data)
      return data
    } catch (error) {
      console.error('Preload data error:', error)
      // Return cached data if available, even if expired
      return this.get<T>(cacheName, key)
    }
  }

  // Sync cache with server (for offline-first)
  async syncWithServer<T>(
    cacheName: string,
    key: string,
    fetchFn: () => Promise<T>,
    updateFn: (data: T) => Promise<void>
  ): Promise<void> {
    try {
      // Get cached data
      const cachedData = this.get<T>(cacheName, key)
      
      // Fetch fresh data from server
      const freshData = await fetchFn()
      
      // Update cache
      this.set(cacheName, key, freshData)
      
      // If we had cached data and it's different, sync to server
      if (cachedData && JSON.stringify(cachedData) !== JSON.stringify(freshData)) {
        await updateFn(freshData)
      }
    } catch (error) {
      console.error('Sync with server error:', error)
    }
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance() 