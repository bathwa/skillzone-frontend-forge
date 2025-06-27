
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDarkMode: boolean
  toggleTheme: () => void
  setTheme: (isDark: boolean) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleTheme: () => 
        set((state) => {
          const newIsDark = !state.isDarkMode
          // Apply theme to document
          if (newIsDark) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          return { isDarkMode: newIsDark }
        }),
      setTheme: (isDark: boolean) => 
        set(() => {
          // Apply theme to document
          if (isDark) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          return { isDarkMode: isDark }
        }),
    }),
    {
      name: 'skillzone-theme',
      onRehydrateStorage: () => (state) => {
        if (state?.isDarkMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
    }
  )
)
