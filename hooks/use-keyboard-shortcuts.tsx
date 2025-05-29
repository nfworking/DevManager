"use client"

import { useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

export interface KeyboardShortcut {
  key: string
  description: string
  action: () => void
  category: string
}

export function useKeyboardShortcuts() {
  const router = useRouter()

  const shortcuts: KeyboardShortcut[] = [
    // Navigation
    {
      key: "g h",
      description: "Go to Dashboard",
      action: () => router.push("/"),
      category: "Navigation",
    },
    {
      key: "g y",
      description: "Go to System Info",
      action: () => router.push("/system-info"),
      category: "Navigation",
    },
    {
      key: "g s",
      description: "Go to VM Status Monitor",
      action: () => router.push("/vm-status"),
      category: "Navigation",
    },
    {
      key: "g v",
      description: "Go to Virtual Machines",
      action: () => router.push("/virtual-machines"),
      category: "Navigation",
    },
    {
      key: "g p",
      description: "Go to Physical Devices",
      action: () => router.push("/physical-devices"),
      category: "Navigation",
    },
    {
      key: "g i",
      description: "Go to ISO Files",
      action: () => router.push("/isos"),
      category: "Navigation",
    },
    {
      key: "g a",
      description: "Go to Accounts",
      action: () => router.push("/accounts"),
      category: "Navigation",
    },
    {
      key: "g t",
      description: "Go to Tech Stack",
      action: () => router.push("/tech-stack"),
      category: "Navigation",
    },
    {
      key: "g n",
      description: "Go to Notes",
      action: () => router.push("/notes"),
      category: "Navigation",
    },
    // Search
    {
      key: "cmd k",
      description: "Open Global Search",
      action: () => {
        // This is handled by the GlobalSearch component
      },
      category: "Search",
    },
    // Quick Actions
    {
      key: "c v",
      description: "Create Virtual Machine",
      action: () => {
        router.push("/virtual-machines")
        setTimeout(() => {
          const addButton = document.querySelector('[data-testid="add-vm-button"]') as HTMLButtonElement
          addButton?.click()
        }, 100)
      },
      category: "Quick Actions",
    },
    {
      key: "c p",
      description: "Create Physical Device",
      action: () => {
        router.push("/physical-devices")
        setTimeout(() => {
          const addButton = document.querySelector('[data-testid="add-device-button"]') as HTMLButtonElement
          addButton?.click()
        }, 100)
      },
      category: "Quick Actions",
    },
    {
      key: "c i",
      description: "Create ISO File",
      action: () => {
        router.push("/isos")
        setTimeout(() => {
          const addButton = document.querySelector('[data-testid="add-iso-button"]') as HTMLButtonElement
          addButton?.click()
        }, 100)
      },
      category: "Quick Actions",
    },
    {
      key: "c a",
      description: "Create Account",
      action: () => {
        router.push("/accounts")
        setTimeout(() => {
          const addButton = document.querySelector('[data-testid="add-account-button"]') as HTMLButtonElement
          addButton?.click()
        }, 100)
      },
      category: "Quick Actions",
    },
    {
      key: "c t",
      description: "Create Tech Stack Entry",
      action: () => {
        router.push("/tech-stack")
        setTimeout(() => {
          const addButton = document.querySelector('[data-testid="add-tech-button"]') as HTMLButtonElement
          addButton?.click()
        }, 100)
      },
      category: "Quick Actions",
    },
    {
      key: "c n",
      description: "Create Note",
      action: () => {
        router.push("/notes")
        setTimeout(() => {
          const addButton = document.querySelector('[data-testid="add-note-button"]') as HTMLButtonElement
          addButton?.click()
        }, 100)
      },
      category: "Quick Actions",
    },
  ]

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === "true"
      ) {
        return
      }

      // Handle single key shortcuts
      if (event.key === "?" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        // Trigger help dialog
        const helpButton = document.querySelector('[data-testid="help-button"]') as HTMLButtonElement
        helpButton?.click()
        return
      }

      // Handle two-key combinations (like "g h")
      const key = event.key.toLowerCase()

      // Store the last pressed key and timestamp
      const now = Date.now()
      const lastKey = (window as any).__lastShortcutKey
      const lastTime = (window as any).__lastShortcutTime || 0

      // If less than 1 second has passed, combine keys
      if (now - lastTime < 1000 && lastKey) {
        const combination = `${lastKey} ${key}`
        const shortcut = shortcuts.find((s) => s.key === combination)

        if (shortcut) {
          event.preventDefault()
          shortcut.action()
          // Clear the stored key
          ;(window as any).__lastShortcutKey = null
          ;(window as any).__lastShortcutTime = 0
          return
        }
      }

      if ((event.metaKey || event.ctrlKey) && key === "k") {
        event.preventDefault()
        const shortcut = shortcuts.find((s) => s.key === "cmd k")
        if (shortcut) {
          shortcut.action()
          return
        }
      }
      // Store current key for potential combination
      ;(window as any).__lastShortcutKey = key
      ;(window as any).__lastShortcutTime = now
    },
    [router],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return shortcuts
}
