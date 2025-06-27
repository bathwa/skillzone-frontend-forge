import { useState, useEffect } from 'react'
import { pwaService } from '@/lib/services/pwaService'
import type { PWAState } from '@/lib/services/pwaService'

export const usePWA = () => {
  const [pwaState, setPwaState] = useState<PWAState>(pwaService.getState())
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if PWA is supported
    setIsSupported(pwaService.isSupported())

    // Add event listeners
    const handleStateChange = (state: PWAState) => {
      setPwaState(state)
    }

    pwaService.addEventListener('installable', handleStateChange)
    pwaService.addEventListener('installed', handleStateChange)
    pwaService.addEventListener('online', handleStateChange)
    pwaService.addEventListener('offline', handleStateChange)
    pwaService.addEventListener('update', handleStateChange)

    return () => {
      pwaService.removeEventListener('installable', handleStateChange)
      pwaService.removeEventListener('installed', handleStateChange)
      pwaService.removeEventListener('online', handleStateChange)
      pwaService.removeEventListener('offline', handleStateChange)
      pwaService.removeEventListener('update', handleStateChange)
    }
  }, [])

  const showInstallPrompt = async () => {
    if (!pwaState.isInstallable) return false
    return await pwaService.showInstallPrompt()
  }

  const requestNotificationPermission = async () => {
    return await pwaService.requestNotificationPermission()
  }

  const subscribeToPushNotifications = async () => {
    return await pwaService.subscribeToPushNotifications()
  }

  const unsubscribeFromPushNotifications = async () => {
    return await pwaService.unsubscribeFromPushNotifications()
  }

  const checkForUpdates = async () => {
    return await pwaService.checkForUpdates()
  }

  const skipWaiting = async () => {
    return await pwaService.skipWaiting()
  }

  const registerPeriodicSync = async (tag: string, minInterval: number) => {
    return await pwaService.registerPeriodicSync(tag, minInterval)
  }

  const unregisterPeriodicSync = async (tag: string) => {
    return await pwaService.unregisterPeriodicSync(tag)
  }

  const cacheData = async (key: string, data: any) => {
    return await pwaService.cacheData(key, data)
  }

  return {
    // State
    pwaState,
    isSupported,
    isInstalled: pwaState.isInstalled,
    isInstallable: pwaState.isInstallable,
    isOnline: pwaState.isOnline,
    isStandalone: pwaState.isStandalone,

    // Actions
    showInstallPrompt,
    requestNotificationPermission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    checkForUpdates,
    skipWaiting,
    registerPeriodicSync,
    unregisterPeriodicSync,
    cacheData,
  }
} 