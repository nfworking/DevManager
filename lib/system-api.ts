"use client"

export interface SystemInfo {
  hostname: string
  os: string
  uptime: number
  cpu_usage: number
  ram: {
    total: number
    used: number
    percent: number
  }
  disk: {
    total: number
    used: number
    percent: number
  }
}

export interface SystemAPIResponse {
  success: boolean
  data?: SystemInfo
  error?: string
  timestamp: string
}

export interface SystemConnectionStatus {
  isConnected: boolean
  lastChecked: string
  error?: string
  responseTime?: number
}

class SystemAPI {
  private baseUrl: string
  private timeout: number

  constructor() {
    this.baseUrl = "http://localhost:8000"
    this.timeout = 10000
  }

  private async makeRequest<T>(endpoint: string): Promise<SystemAPIResponse> {
    const startTime = Date.now()

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return {
            success: false,
            error: `Request timeout after ${this.timeout}ms`,
            timestamp: new Date().toISOString(),
          }
        }

        return {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        }
      }

      return {
        success: false,
        error: "Unknown error occurred",
        timestamp: new Date().toISOString(),
      }
    }
  }

  async checkConnection(): Promise<SystemConnectionStatus> {
    const startTime = Date.now()

    try {
      const response = await this.makeRequest<SystemInfo>("/system")
      const responseTime = Date.now() - startTime

      return {
        isConnected: response.success,
        lastChecked: new Date().toISOString(),
        responseTime,
        error: response.error,
      }
    } catch (error) {
      const responseTime = Date.now() - startTime

      return {
        isConnected: false,
        lastChecked: new Date().toISOString(),
        responseTime,
        error: error instanceof Error ? error.message : "Connection failed",
      }
    }
  }

  async getSystemInfo(): Promise<SystemAPIResponse> {
    try {
      const response = await this.makeRequest<SystemInfo>("/system")

      // Ensure the response has the expected structure
      if (response.success && response.data) {
        // Add default values for potentially missing properties
        const data = {
          ...response.data,
          cpu: response.data.cpu || { count: 0, used: 0, percent: 0 },
          disk: response.data.disk || { total: 0, used: 0, percent: 0 },
          uptime: response.data.uptime || 0,
          boot_time: response.data.boot_time || 0,
        }

        return {
          ...response,
          data,
        }
      }

      return response
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch system data",
        timestamp: new Date().toISOString(),
      }
    }
  }

  // Utility functions for formatting
  formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  formatBootTime(timestamp: number): string {
    // Convert timestamp to milliseconds if it's in seconds
    const bootTime = timestamp < 1e12 ? timestamp * 1000 : timestamp
    const date = new Date(bootTime)
    return date.toLocaleString()
  }

  getCPUUsageColor(percent: number): string {
    if (percent < 30) return "text-green-600 dark:text-green-400"
    if (percent < 70) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  getDiskUsageColor(percent: number): string {
    if (percent < 50) return "text-green-600"
    if (percent < 80) return "text-yellow-600"
    return "text-red-600"
  }

  getProgressBarColor(percent: number): string {
    if (percent < 50) return "bg-green-500"
    if (percent < 80) return "bg-yellow-500"
    return "bg-red-500"
  }

  formatRAM(bytes: number): string {
    const gb = bytes / (1024 * 1024 * 1024)
    return `${gb.toFixed(2)} GB`
  }

  getRAMUsageColor(percent: number): string {
    if (percent < 50) return "text-green-600 dark:text-green-400"
    if (percent < 80) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }
}

export const systemAPI = new SystemAPI()
