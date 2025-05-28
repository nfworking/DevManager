"use client"

export interface VirtualMachine {
  id: string
  name: string
  provider: string
  hardware: string
  tags: string[]
  os: string
  storageSize: string
  networkAdapter: string
  createdAt: string
}

export interface PhysicalDevice {
  id: string
  name: string
  manufacturer: string
  model: string
  hardware: string
  tags: string[]
  os: string
  storageSize: string
  networkAdapter: string
  createdAt: string
}

export interface Account {
  id: string
  name: string
  username: string
  email: string
  password: string
  website: string
  notes: string
  tags: string[]
  createdAt: string
}

export interface TechStack {
  id: string
  name: string
  icon: string
  reason: string
  os: string
  installationSize: string
  tags: string[]
  createdAt: string
}

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface ISO {
  id: string
  name: string
  size: string
  location: string
  date: string
  tags: string[]
  createdAt: string
}

export interface DevManagerData {
  virtualMachines: VirtualMachine[]
  physicalDevices: PhysicalDevice[]
  accounts: Account[]
  techStack: TechStack[]
  notes: Note[]
  isos: ISO[]
}

const STORAGE_KEY = "dev-manager-data"

export function getStorageData(): DevManagerData {
  if (typeof window === "undefined") {
    return {
      virtualMachines: [],
      physicalDevices: [],
      accounts: [],
      techStack: [],
      notes: [],
      isos: [],
    }
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      // Ensure isos array exists for backward compatibility
      if (!parsed.isos) {
        parsed.isos = []
      }
      return parsed
    }
  } catch (error) {
    console.error("Error reading from localStorage:", error)
  }

  return {
    virtualMachines: [],
    physicalDevices: [],
    accounts: [],
    techStack: [],
    notes: [],
    isos: [],
  }
}

export function saveStorageData(data: DevManagerData): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error("Error saving to localStorage:", error)
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function exportData(): string {
  const data = getStorageData()
  return JSON.stringify(data, null, 2)
}

export function importData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData) as DevManagerData

    // Validate the structure
    if (
      !data ||
      !Array.isArray(data.virtualMachines) ||
      !Array.isArray(data.physicalDevices) ||
      !Array.isArray(data.accounts) ||
      !Array.isArray(data.techStack) ||
      !Array.isArray(data.notes)
    ) {
      throw new Error("Invalid data structure")
    }

    // Ensure isos array exists for backward compatibility
    if (!data.isos) {
      data.isos = []
    }

    saveStorageData(data)
    return true
  } catch (error) {
    console.error("Error importing data:", error)
    return false
  }
}

export function downloadDataAsFile(): void {
  const data = exportData()
  const blob = new Blob([data], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = `dev-manager-backup-${new Date().toISOString().split("T")[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
