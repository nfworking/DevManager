"use client"

import { API_CONFIG } from "@/lib/config"

export interface VMStatus {
  Name: string
  State: number
  ProcessorCount: number
  MemoryAssigned: number
  MemoryDemand: number
  Generation?: number
}

export interface VMHealthInfo {
  Name: string
  PID: number
  MemoryAssigned: number
  CPUUsage?: number
  MemoryUsage?: number
}

export interface CombinedVMData {
  Name: string
  State: number
  ProcessorCount: number
  MemoryAssigned: number
  MemoryDemand: number
  Generation?: number
  PID: number
  HealthMemoryAssigned: number
  isRunning: boolean
}

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

export interface ConnectionStatus {
  isConnected: boolean
  lastChecked: string
  error?: string
  responseTime?: number
}

// VM State mappings based on Hyper-V states
export const VM_STATES = {
  0: { label: "Other", color: "text-gray-500", bgColor: "bg-gray-100 dark:bg-gray-800" },
  1: { label: "Running", color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900" },
  2: { label: "Off", color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900" },
  3: { label: "Stopping", color: "text-yellow-600", bgColor: "bg-yellow-100 dark:bg-yellow-900" },
  4: { label: "Saved", color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900" },
  5: { label: "Paused", color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-900" },
  6: { label: "Starting", color: "text-cyan-600", bgColor: "bg-cyan-100 dark:bg-cyan-900" },
  7: { label: "Reset", color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-900" },
  8: { label: "Saving", color: "text-indigo-600", bgColor: "bg-indigo-100 dark:bg-indigo-900" },
  9: { label: "Pausing", color: "text-pink-600", bgColor: "bg-pink-100 dark:bg-pink-900" },
  10: { label: "Resuming", color: "text-teal-600", bgColor: "bg-teal-100 dark:bg-teal-900" },
} as const

class VMStatusAPI {
  private baseUrl: string
  private timeout: number

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL
    this.timeout = API_CONFIG.TIMEOUT
  }

  private async makeRequest<T>(endpoint: string): Promise<APIResponse<T>> {
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

  async checkConnection(): Promise<ConnectionStatus> {
    const startTime = Date.now()

    try {
      const response = await this.makeRequest<VMHealthInfo[]>(API_CONFIG.ENDPOINTS.HEALTH_CHECK)
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

  async getVMStatus(): Promise<APIResponse<VMStatus>> {
    return this.makeRequest<VMStatus>(API_CONFIG.ENDPOINTS.VM_STATUS)
  }

  async getVMHealthInfo(): Promise<APIResponse<VMHealthInfo[]>> {
    return this.makeRequest<VMHealthInfo[]>(API_CONFIG.ENDPOINTS.HEALTH_CHECK)
  }

  async getCombinedVMData(): Promise<APIResponse<CombinedVMData[]>> {
    try {
      // Fetch both static VM data and health data
      const [vmResponse, healthResponse] = await Promise.all([this.getVMStatus(), this.getVMHealthInfo()])

      if (!vmResponse.success) {
        return {
          success: false,
          error: vmResponse.error || "Failed to fetch VM status",
          timestamp: new Date().toISOString(),
        }
      }

      if (!healthResponse.success) {
        return {
          success: false,
          error: healthResponse.error || "Failed to fetch VM health data",
          timestamp: new Date().toISOString(),
        }
      }

      const vmData = vmResponse.data
      const healthData = healthResponse.data || []

      if (!vmData) {
        return {
          success: false,
          error: "No VM data received",
          timestamp: new Date().toISOString(),
        }
      }

      // Combine the data - create array from single VM and match with health data
      const combinedData: CombinedVMData[] = []

      // Find matching health data for the VM
      const healthInfo = healthData.find((h) => h.Name === vmData.Name)

      const combined: CombinedVMData = {
        Name: vmData.Name,
        State: vmData.State,
        ProcessorCount: vmData.ProcessorCount,
        MemoryAssigned: vmData.MemoryAssigned,
        MemoryDemand: vmData.MemoryDemand,
        Generation: vmData.Generation,
        PID: healthInfo?.PID || 0,
        HealthMemoryAssigned: healthInfo?.MemoryAssigned || 0,
        isRunning: (healthInfo?.PID || 0) > 0,
      }

      combinedData.push(combined)

      // Also add any health data that doesn't match the main VM (other VMs)
      healthData.forEach((health) => {
        if (health.Name !== vmData.Name) {
          const additionalVM: CombinedVMData = {
            Name: health.Name,
            State: health.PID > 0 ? 1 : 2, // Assume running if PID exists, off otherwise
            ProcessorCount: 0, // Not available in health data
            MemoryAssigned: health.MemoryAssigned,
            MemoryDemand: 0, // Not available in health data
            PID: health.PID,
            HealthMemoryAssigned: health.MemoryAssigned,
            isRunning: health.PID > 0,
          }
          combinedData.push(additionalVM)
        }
      })

      return {
        success: true,
        data: combinedData,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to combine VM data",
        timestamp: new Date().toISOString(),
      }
    }
  }

  formatMemory(bytes: number): string {
    if (bytes === 0) return "0 GB"
    const gb = bytes / (1024 * 1024 * 1024)
    return `${gb.toFixed(2)} GB`
  }

  formatMemoryMB(bytes: number): string {
    if (bytes === 0) return "0 MB"
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(0)} MB`
  }

  getVMStateInfo(state: number) {
    return VM_STATES[state as keyof typeof VM_STATES] || VM_STATES[0]
  }

  getMemoryUsagePercentage(assigned: number, demand: number): number {
    if (assigned === 0) return 0
    return Math.round((demand / assigned) * 100)
  }
}

export const vmStatusAPI = new VMStatusAPI()
