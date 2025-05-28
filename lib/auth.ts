"use client"

export interface User {
  id: string
  username: string
  email: string
  name: string
}

export interface Credentials {
  username: string
  password: string
}

// Default admin credentials - in a real app, this would be in a secure backend
const DEFAULT_USERS = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    email: "admin@devmanager.com",
    name: "Administrator",
  },
  {
    id: "2",
    username: "developer",
    password: "dev123",
    email: "dev@devmanager.com",
    name: "Developer",
  },
]

const AUTH_STORAGE_KEY = "dev-manager-auth"
const USERS_STORAGE_KEY = "dev-manager-users"

export function initializeUsers(): void {
  if (typeof window === "undefined") return

  const existingUsers = localStorage.getItem(USERS_STORAGE_KEY)
  if (!existingUsers) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS))
  }
}

export function getUsers(): User[] {
  if (typeof window === "undefined") return []

  try {
    const users = localStorage.getItem(USERS_STORAGE_KEY)
    return users ? JSON.parse(users) : DEFAULT_USERS
  } catch (error) {
    console.error("Error reading users:", error)
    return DEFAULT_USERS
  }
}

export function authenticateUser(credentials: Credentials): User | null {
  const users = getUsers()
  const user = users.find((u) => u.username === credentials.username && u.password === credentials.password)

  if (user) {
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  return null
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  try {
    const authData = localStorage.getItem(AUTH_STORAGE_KEY)
    return authData ? JSON.parse(authData) : null
  } catch (error) {
    console.error("Error reading auth data:", error)
    return null
  }
}

export function setCurrentUser(user: User): void {
  if (typeof window === "undefined") return

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
}

export function clearCurrentUser(): void {
  if (typeof window === "undefined") return

  localStorage.removeItem(AUTH_STORAGE_KEY)
}
