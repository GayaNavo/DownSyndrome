'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { getAuthInstance } from '@/lib/firebase/config'
import { signIn, signUp, logOut, resetPassword } from '@/lib/firebase/auth'

interface AuthContextType {
  currentUser: User | null
  loading: boolean
  signUp: (email: string, password: string, displayName?: string, phone?: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    try {
      const auth = getAuthInstance()
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user)
        setLoading(false)
      })

      return unsubscribe
    } catch (error) {
      console.error('Error initializing auth:', error)
      setLoading(false)
    }
  }, [])

  const value: AuthContextType = {
    currentUser,
    loading,
    signUp,
    signIn,
    logout: logOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

