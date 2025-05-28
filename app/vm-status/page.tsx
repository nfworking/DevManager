"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { AuthGuard } from "@/components/auth-guard"
import { vmStatusAPI, type CombinedVMData, type ConnectionStatus } from "@/lib/vm-status-api"
import { API_CONFIG } from "@/lib/config"
import {
  RefreshCw,
  Server,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  MemoryStick,
  Activity,
  Zap,
} from "lucide-react"

function VMStatusContent() {
  const [vmData, setVMData] = useState<CombinedVMData[]>([])
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastChecked: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [autoRefresh, setAutoRefresh] = useState(true)

  const checkConnection = useCallback(async () => {
    try {
      const status = await vmStatusAPI.checkConnection()
      setConnectionStatus(status)
      return status.isConnected
    } catch (error) {
      setConnectionStatus({
        isConnected: false,
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Connection check failed",
      })
      return false
    }
  }, [])

  const fetchVMData = useCallback(
    async (showLoading = false) => {
      if (showLoading) {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }

      setError(null)

      try {
        // First check connection
        const isConnected = await checkConnection()

        if (!isConnected) {
          setError("Cannot connect to backend server")
          setVMData([])
          return
        }

        // Fetch combined VM data
        const response = await vmStatusAPI.getCombinedVMData()

        if (response.success && response.data) {
          setVMData(response.data)
          setLastUpdated(response.timestamp)
          setError(null)
        } else {
          setError(response.error || "Failed to fetch VM data")
          setVMData([])
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
        setError(errorMessage)
        setVMData([])
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [checkConnection],
  )

  const handleManualRefresh = () => {
    fetchVMData(false)
  }

  // Initial load
  useEffect(() => {
    fetchVMData(true)
  }, [fetchVMData])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      if (!isLoading && !isRefreshing) {
        fetchVMData(false)
      }
    }, API_CONFIG.REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [autoRefresh, isLoading, isRefreshing, fetchVMData])

  const formatLastUpdated = (timestamp: string) => {
    if (!timestamp) return "Never"
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">VM Status Monitor</h1>
            <p className="text-muted-foreground">Live virtual machine status monitoring</p>
          </div>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Connecting to backend...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">VM Status Monitor</h1>
          <p className="text-muted-foreground">Live virtual machine status monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-green-50 border-green-200 dark:bg-green-950" : ""}
          >
            <Activity className="mr-2 h-4 w-4" />
            Auto Refresh {autoRefresh ? "On" : "Off"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="transition-all duration-200"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {connectionStatus.isConnected ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            Backend Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge
                variant={connectionStatus.isConnected ? "default" : "destructive"}
                className={
                  connectionStatus.isConnected
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : ""
                }
              >
                {connectionStatus.isConnected ? "Connected" : "Disconnected"}
              </Badge>
              <div className="text-sm text-muted-foreground">
                <span>Endpoints: {API_CONFIG.BASE_URL}/vms & /vms/health</span>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last checked: {formatLastUpdated(connectionStatus.lastChecked)}
              </div>
              {connectionStatus.responseTime && <div>Response time: {connectionStatus.responseTime}ms</div>}
            </div>
          </div>
          {connectionStatus.error && (
            <Alert variant="destructive" className="mt-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{connectionStatus.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Data Status */}
      {!error && connectionStatus.isConnected && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>
                {vmData.length} VM{vmData.length !== 1 ? "s" : ""} found
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span>Auto-refresh every {API_CONFIG.REFRESH_INTERVAL / 1000}s</span>
            {isRefreshing && <RefreshCw className="h-3 w-3 animate-spin ml-1" />}
          </div>
        </div>
      )}

      {/* VM Status Cards */}
      {vmData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {vmData.map((vm, index) => {
            const stateInfo = vmStatusAPI.getVMStateInfo(vm.State)
            const memoryUsage = vmStatusAPI.getMemoryUsagePercentage(vm.MemoryAssigned, vm.MemoryDemand)

            return (
              <Card key={`${vm.Name}-${index}`} className="transition-all duration-200 hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      {vm.Name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {vm.isRunning && <Zap className="h-4 w-4 text-green-500" title="Process Running" />}
                      <Badge className={`${stateInfo.color} ${stateInfo.bgColor} border-0`}>{stateInfo.label}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* CPU Information */}
                  {vm.ProcessorCount > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Cpu className="h-4 w-4 text-blue-600" />
                          Processors
                        </div>
                        <span className="text-sm font-mono">{vm.ProcessorCount}</span>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Memory Information */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <MemoryStick className="h-4 w-4 text-green-600" />
                      Memory Status
                    </div>
                    <div className="space-y-2">
                      {/* Static Memory Assignment */}
                      {vm.MemoryAssigned > 0 && (
                        <div className="text-xs">
                          <div className="flex justify-between mb-1">
                            <span className="text-muted-foreground">Configured:</span>
                            <span className="font-mono">{vmStatusAPI.formatMemory(vm.MemoryAssigned)}</span>
                          </div>
                          {vm.MemoryDemand > 0 && (
                            <>
                              <div className="flex justify-between mb-1">
                                <span className="text-muted-foreground">Demand:</span>
                                <span className="font-mono">{vmStatusAPI.formatMemory(vm.MemoryDemand)}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    memoryUsage > 80
                                      ? "bg-red-500"
                                      : memoryUsage > 60
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                  }`}
                                  style={{ width: `${Math.min(memoryUsage, 100)}%` }}
                                />
                              </div>
                              <div className="text-xs text-center text-muted-foreground mt-1">
                                {memoryUsage}% utilized
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Health Memory Data */}
                      {vm.HealthMemoryAssigned > 0 && vm.HealthMemoryAssigned !== vm.MemoryAssigned && (
                        <div className="text-xs pt-2 border-t border-muted">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Live Memory:</span>
                            <span className="font-mono">{vmStatusAPI.formatMemory(vm.HealthMemoryAssigned)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Process Information */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Activity className="h-4 w-4 text-cyan-600" />
                      Runtime Status
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Process ID:</span>
                        <span className="font-mono">{vm.PID > 0 ? vm.PID : "Not Running"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className={`font-mono ${vm.isRunning ? "text-green-600" : "text-red-600"}`}>
                          {vm.isRunning ? "Active" : "Inactive"}
                        </span>
                      </div>
                      {vm.Generation && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Generation:</span>
                          <span className="font-mono">{vm.Generation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* No Data State */}
      {!error && connectionStatus.isConnected && vmData.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Server className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Virtual Machines Found</h3>
            <p className="text-muted-foreground mb-4">The backend is connected but no VM data is available.</p>
            <Button variant="outline" onClick={handleManualRefresh} disabled={isRefreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function VMStatusPage() {
  return (
    <AuthGuard>
      <VMStatusContent />
    </AuthGuard>
  )
}
