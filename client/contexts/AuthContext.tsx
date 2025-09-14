"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  username: string
  provider: string
  confirmed: boolean
  blocked: boolean
  createdAt: string
  updatedAt: string
  role: {
    id: string
    name: string
    description: string
    type: string
  }
  // Add any other user fields as needed
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user && !!token

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('jwt')
        console.log('AuthContext: storedToken in localStorage:', storedToken)
        if (storedToken) {
          await login(storedToken)
        } else {
          setIsLoading(false)
          console.log('AuthContext: No token found, setIsLoading(false) called')
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        localStorage.removeItem('jwt')
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const fetchUserProfile = async (authToken: string): Promise<User> => {
    console.log("Fetching user profile with token:", authToken?.substring(0, 20) + "...");
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch user profile:", response.status, errorText);
        throw new Error(`Failed to fetch user profile: ${response.status}`)
      }
      const userData = await response.json();
      console.log("/api/auth/me response:", userData);
      if (!userData || userData.error) {
        console.error("/api/auth/me returned error or empty:", userData);
        return null as any;
      }
      return userData;
    } catch (err) {
      console.error("Exception in fetchUserProfile:", err);
      return null as any;
    }
  }

  const login = async (authToken: string) => {
    setIsLoading(true)
    try {
      const userData = await fetchUserProfile(authToken)
      console.log("login: userData from fetchUserProfile", userData)
      setToken(authToken)
      setUser(userData)
      localStorage.setItem('jwt', authToken)
    } catch (error) {
      console.error('Login failed:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
      console.log("login: setIsLoading(false) called")
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('jwt')
    
    // Clear any server-side cookies
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    
    router.push('/auth/sign-in')
  }


  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
