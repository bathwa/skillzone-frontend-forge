export interface PWAInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface PWAState {
  isInstalled: boolean
  isInstallable: boolean
  isOnline: boolean
  isStandalone: boolean
  deferredPrompt: PWAInstallPromptEvent | null
}

export class PWAService {
  private static instance: PWAService
  private state: PWAState = {
    isInstalled: false,
    isInstallable: false,
    isOnline: navigator.onLine,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    deferredPrompt: null,
  }
  private listeners: Map<string, Set<(state: PWAState) => void>> = new Map()

  private constructor() {
    this.initialize()
  }

  static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService()
    }
    return PWAService.instance
  }

  private initialize(): void {
    this.registerServiceWorker()
    this.setupEventListeners()
    this.checkInstallationStatus()
  }

  // Register service worker
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })

        console.log('Service Worker registered:', registration)

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.notifyListeners('update', this.state)
              }
            })
          }
        })

        // Handle service worker controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('Service Worker controller changed')
          this.notifyListeners('controllerchange', this.state)
        })
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }
  }

  // Setup event listeners
  private setupEventListeners(): void {
    // Install prompt event
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault()
      this.state.deferredPrompt = event as PWAInstallPromptEvent
      this.state.isInstallable = true
      this.notifyListeners('installable', this.state)
    })

    // App installed event
    window.addEventListener('appinstalled', () => {
      this.state.isInstalled = true
      this.state.isInstallable = false
      this.state.deferredPrompt = null
      this.notifyListeners('installed', this.state)
    })

    // Online/offline events
    window.addEventListener('online', () => {
      this.state.isOnline = true
      this.notifyListeners('online', this.state)
    })

    window.addEventListener('offline', () => {
      this.state.isOnline = false
      this.notifyListeners('offline', this.state)
    })

    // Display mode change
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (event) => {
      this.state.isStandalone = event.matches
      this.notifyListeners('displaymode', this.state)
    })
  }

  // Check installation status
  private checkInstallationStatus(): void {
    // Check if app is installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.state.isInstalled = true
    }

    // Check if app is installable
    if (this.state.deferredPrompt) {
      this.state.isInstallable = true
    }
  }

  // Show install prompt
  async showInstallPrompt(): Promise<boolean> {
    if (!this.state.deferredPrompt) {
      return false
    }

    try {
      this.state.deferredPrompt.prompt()
      const { outcome } = await this.state.deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        this.state.isInstalled = true
        this.state.isInstallable = false
        this.state.deferredPrompt = null
        this.notifyListeners('installed', this.state)
        return true
      } else {
        this.state.deferredPrompt = null
        this.state.isInstallable = false
        this.notifyListeners('installable', this.state)
        return false
      }
    } catch (error) {
      console.error('Install prompt failed:', error)
      return false
    }
  }

  // Add event listener
  addEventListener(event: string, callback: (state: PWAState) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  // Remove event listener
  removeEventListener(event: string, callback: (state: PWAState) => void): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(callback)
    }
  }

  // Notify listeners
  private notifyListeners(event: string, state: PWAState): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(state)
        } catch (error) {
          console.error('PWA event listener error:', error)
        }
      })
    }
  }

  // Get current state
  getState(): PWAState {
    return { ...this.state }
  }

  // Check if PWA is supported
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied'
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission()
    }

    return Notification.permission
  }

  // Subscribe to push notifications
  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    try {
      const permission = await this.requestNotificationPermission()
      if (permission !== 'granted') {
        return null
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.VITE_VAPID_PUBLIC_KEY || ''),
      })

      return subscription
    } catch (error) {
      console.error('Push subscription failed:', error)
      return null
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPushNotifications(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        await subscription.unsubscribe()
        return true
      }
      
      return false
    } catch (error) {
      console.error('Push unsubscription failed:', error)
      return false
    }
  }

  // Convert VAPID key to Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Send message to service worker
  async sendMessageToSW(message: any): Promise<void> {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message)
    }
  }

  // Cache data in service worker
  async cacheData(key: string, data: any): Promise<void> {
    await this.sendMessageToSW({
      type: 'CACHE_DATA',
      key,
      data,
    })
  }

  // Check for service worker updates
  async checkForUpdates(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.update()
      }
    }
  }

  // Skip waiting for service worker update
  async skipWaiting(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
    }
  }

  // Register periodic background sync
  async registerPeriodicSync(tag: string, minInterval: number): Promise<boolean> {
    if ('periodicSync' in navigator.serviceWorker) {
      try {
        const status = await navigator.permissions.query({
          name: 'periodic-background-sync' as any,
        })

        if (status.state === 'granted') {
          await (navigator.serviceWorker.ready as any).then((registration: any) => {
            return registration.periodicSync.register(tag, {
              minInterval,
            })
          })
          return true
        }
      } catch (error) {
        console.error('Periodic sync registration failed:', error)
      }
    }
    return false
  }

  // Unregister periodic background sync
  async unregisterPeriodicSync(tag: string): Promise<boolean> {
    if ('periodicSync' in navigator.serviceWorker) {
      try {
        const registration = await navigator.serviceWorker.ready
        await (registration as any).periodicSync.unregister(tag)
        return true
      } catch (error) {
        console.error('Periodic sync unregistration failed:', error)
      }
    }
    return false
  }
}

// Export singleton instance
export const pwaService = PWAService.getInstance() 