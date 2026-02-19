import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function safeLocalStorage(action: 'get', key: string): string | null
function safeLocalStorage(action: 'set', key: string, value: string): void
function safeLocalStorage(action: 'get' | 'set', key: string, value?: string): string | null | void {
  try {
    if (action === 'get') return localStorage.getItem(key)
    if (action === 'set') localStorage.setItem(key, value!)
  } catch {
    // localStorage is unavailable (Safari private mode, blocked by browser policy)
  }
  return null
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = safeLocalStorage('get', 'theme')
    return (saved as Theme) || 'light'
  })

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    safeLocalStorage('set', 'theme', theme)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
