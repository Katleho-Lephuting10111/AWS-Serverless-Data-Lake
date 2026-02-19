import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'admin'
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function safeLS(action: 'get', key: string): string | null
function safeLS(action: 'set', key: string, value: string): void
function safeLS(action: 'remove', key: string): void
function safeLS(action: 'get' | 'set' | 'remove', key: string, value?: string): string | null | void {
  try {
    if (action === 'get') return localStorage.getItem(key)
    if (action === 'set') localStorage.setItem(key, value!)
    if (action === 'remove') localStorage.removeItem(key)
  } catch {
    // localStorage unavailable (Safari private mode, browser policy)
  }
  return null
}

// Mock users for demo authentication
const MOCK_USERS = [
  {
    id: '1',
    email: 'student@digihealth.com',
    password: 'student123',
    name: 'John Student',
    role: 'student' as const
  },
  {
    id: '2',
    email: 'admin@digihealth.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin' as const
  },
  {
    id: '3',
    email: 'demo@digihealth.com',
    password: 'demo123',
    name: 'Demo User',
    role: 'student' as const
  }
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isAuthenticated = user !== null

  // Check for saved authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const savedUser = safeLS('get', 'auth_user')
      const savedToken = safeLS('get', 'auth_token')
      const remember = safeLS('get', 'auth_remember')

      if (savedUser && savedToken && remember === 'true') {
        try {
          const parsedUser = JSON.parse(savedUser)
          setUser(parsedUser)
        } catch (e) {
          console.error('Failed to parse saved user:', e)
          // Clear invalid data
          safeLS('remove', 'auth_user')
          safeLS('remove', 'auth_token')
          safeLS('remove', 'auth_remember')
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string, rememberMe: boolean): Promise<void> => {
    setIsLoading(true)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const mockUser = MOCK_USERS.find(
      u => u.email === email && u.password === password
    )

    if (!mockUser) {
      setIsLoading(false)
      throw new Error('Invalid credentials')
    }

    // Don't store password in state or localStorage
    const userWithoutPassword: User = {
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      role: mockUser.role
    }

    setUser(userWithoutPassword)

    // Persist if remember me is checked
    if (rememberMe) {
      safeLS('set', 'auth_user', JSON.stringify(userWithoutPassword))
      safeLS('set', 'auth_token', `mock-token-${mockUser.id}`)
      safeLS('set', 'auth_remember', 'true')
    }

    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    safeLS('remove', 'auth_user')
    safeLS('remove', 'auth_token')
    safeLS('remove', 'auth_remember')
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
