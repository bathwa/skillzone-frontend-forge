
import React from 'react'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/stores/themeStore'
import { Sun, Moon } from 'lucide-react'

export const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useThemeStore()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-8 w-8 px-0"
    >
      {isDarkMode ? (
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all" />
      ) : (
        <Moon className="h-4 w-4 rotate-0 scale-100 transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
