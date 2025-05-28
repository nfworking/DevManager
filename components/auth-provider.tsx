"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type User, getCurrentUser, clearCurrentUser, initializeUsers } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializeUsers()
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const login = (user: User) => {
    setUser(user)
  }

  const logout = () => {
    clearCurrentUser()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}
