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
      const savedUser = localStorage.getItem('auth_user')
      const savedToken = localStorage.getItem('auth_token')
      const remember = localStorage.getItem('auth_remember')

      if (savedUser && savedToken && remember === 'true') {
        try {
          const parsedUser = JSON.parse(savedUser)
          setUser(parsedUser)
        } catch (e) {
          console.error('Failed to parse saved user:', e)
          // Clear invalid data
          localStorage.removeItem('auth_user')
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_remember')
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
      localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword))
      localStorage.setItem('auth_token', `mock-token-${mockUser.id}`)
      localStorage.setItem('auth_remember', 'true')
    }

    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_remember')
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
