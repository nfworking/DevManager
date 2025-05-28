"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { LoginForm } from "@/components/login-form"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  // Initialize keyboard shortcuts
  useKeyboardShortcuts()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return <>{children}</>
}
