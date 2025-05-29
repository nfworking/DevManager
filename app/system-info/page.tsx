"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { AuthGuard } from "@/components/auth-guard"
import { systemAPI, type SystemInfo, type SystemConnectionStatus } from "@/lib/system-api"
import {
  RefreshCw,
  Monitor,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  Activity,
  Server,
  MemoryStickIcon as Memory,
  Zap,
} from "lucide-react"
import { motion } from "framer-motion"

function SystemInfoContent() {
  const [systemData, setSystemData] = useState<SystemInfo | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<SystemConnectionStatus>({
    isConnected: false,
    lastChecked: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshCount, setRefreshCount] = useState(0)

  const checkConnection = useCallback(async () => {
    try {
      const status = await systemAPI.checkConnection()
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

  const fetchSystemData = useCallback(
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
          setError("Cannot connect to system backend")
          setSystemData(null)
          return
        }

        // Fetch system data
        const response = await systemAPI.getSystemInfo()

        if (response.success && response.data) {
          setSystemData(response.data)
          setLastUpdated(response.timestamp)
          setRefreshCount((prev) => prev + 1)
          setError(null)
        } else {
          setError(response.error || "Failed to fetch system data")
          setSystemData(null)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
        setError(errorMessage)
        setSystemData(null)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [checkConnection],
  )

  const handleManualRefresh = () => {
    fetchSystemData(false)
  }

  // Initial load
  useEffect(() => {
    fetchSystemData(true)
  }, [fetchSystemData])

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      if (!isLoading && !isRefreshing) {
        fetchSystemData(false)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRefresh, isLoading, isRefreshing, fetchSystemData])

  const formatLastUpdated = (timestamp: string) => {
    if (!timestamp) return "Never"
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  const pulseVariants = {
    pulse: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 0.8,
        repeat: 0,
        ease: "easeInOut",
      },
    },
  }

  if (isLoading) {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Information</h1>
            <p className="text-muted-foreground">Live physical device monitoring</p>
          </div>
        </div>

        <motion.div
          className="flex items-center justify-center py-12"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <RefreshCw className="h-12 w-12 animate-spin" />
            <span className="text-lg">Connecting to system backend...</span>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={containerVariants}>
      {/* Header */}
      <motion.div className="flex items-center justify-between" variants={itemVariants}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Information</h1>
          <p className="text-muted-foreground">Live physical device monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`transition-all duration-300 ${autoRefresh ? "bg-green-50 border-green-200 dark:bg-green-950/30" : ""}`}
          >
            <Activity className={`mr-2 h-4 w-4 ${autoRefresh ? "text-green-600 dark:text-green-400" : ""}`} />
            Auto Refresh {autoRefresh ? "On" : "Off"}
          </Button>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="transition-all duration-300 hover:shadow-md"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Connection Status */}
      <motion.div variants={itemVariants}>
        <motion.div
          variants={pulseVariants}
          animate={isRefreshing ? "pulse" : ""}
          className="apple-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {connectionStatus.isConnected ? (
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      color: ["#10b981", "#34d399", "#10b981"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  >
                    <Wifi className="h-5 w-5 text-green-600" />
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{
                      rotate: [0, 5, 0, -5, 0],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                    }}
                  >
                    <WifiOff className="h-5 w-5 text-red-600" />
                  </motion.div>
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
                    <span>Endpoint: localhost:8000/system</span>
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
        </motion.div>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          variants={itemVariants}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Data Status */}
      {!error && connectionStatus.isConnected && systemData && (
        <motion.div className="flex items-center justify-between text-sm text-muted-foreground" variants={itemVariants}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: 0,
                  delay: 0.2,
                }}
              >
                <CheckCircle className="h-3 w-3 text-green-600" />
              </motion.div>
              <span>System data loaded</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span>Auto-refresh every 5s</span>
            {isRefreshing && <RefreshCw className="h-3 w-3 animate-spin ml-1" />}
          </div>
        </motion.div>
      )}

      {/* System Information Cards */}
      {systemData && (
        <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" variants={containerVariants}>
          {/* System Overview */}
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="transition-all duration-300">
            <Card className="h-full overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Server className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  System Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-3">
                  <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Monitor className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      Hostname
                    </div>
                    <motion.span
                      className="text-sm font-mono bg-muted/50 px-2 py-1 rounded"
                      key={`hostname-${refreshCount}`}
                      initial={{ backgroundColor: "rgba(var(--primary), 0.1)" }}
                      animate={{ backgroundColor: "rgba(var(--muted), 0.5)" }}
                      transition={{ duration: 1 }}
                    >
                      {systemData.hostname || "Unknown"}
                    </motion.span>
                  </motion.div>
                  <Separator />
                  <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Operating System
                    </div>
                    <span className="text-sm font-mono">{systemData.os || "Unknown"}</span>
                  </motion.div>
                  <Separator />
                  <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                      Uptime
                    </div>
                    <motion.span
                      className="text-sm font-mono"
                      key={`uptime-${refreshCount}`}
                      initial={{ color: "rgba(var(--primary), 1)" }}
                      animate={{ color: "rgba(var(--foreground), 1)" }}
                      transition={{ duration: 1 }}
                    >
                      {systemAPI.formatUptime(systemData.uptime || 0)}
                    </motion.span>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* CPU Information */}
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="transition-all duration-300">
            <Card className="h-full overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  CPU Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <motion.span
                        className={`text-sm font-mono ${systemAPI.getCPUUsageColor(systemData.cpu_usage || 0)}`}
                        key={`cpu-${refreshCount}`}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        {systemData.cpu_usage || 0}%
                      </motion.span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <motion.div
                        className={`h-2 rounded-full transition-all duration-300 ${systemAPI.getProgressBarColor(
                          systemData.cpu_usage || 0,
                        )}`}
                        style={{ width: `${Math.min(systemData.cpu_usage || 0, 100)}%` }}
                        key={`cpu-bar-${refreshCount}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(systemData.cpu_usage || 0, 100)}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* RAM Information */}
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="transition-all duration-300">
            <Card className="h-full overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Memory className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Memory Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total RAM</span>
                      <span className="text-sm font-mono">{systemAPI.formatRAM(systemData.ram?.total || 0)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Used RAM</span>
                      <motion.span
                        className="text-sm font-mono"
                        key={`ram-used-${refreshCount}`}
                        initial={{ fontWeight: "bold" }}
                        animate={{ fontWeight: "normal" }}
                        transition={{ duration: 1 }}
                      >
                        {systemAPI.formatRAM(systemData.ram?.used || 0)}
                      </motion.span>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <motion.span
                      className={`text-sm font-mono ${systemAPI.getRAMUsageColor(systemData.ram?.percent || 0)}`}
                      key={`ram-percent-${refreshCount}`}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {systemData.ram?.percent || 0}%
                    </motion.span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                    <motion.div
                      className={`h-3 rounded-full transition-all duration-300 ${systemAPI.getProgressBarColor(
                        systemData.ram?.percent || 0,
                      )}`}
                      style={{ width: `${Math.min(systemData.ram?.percent || 0, 100)}%` }}
                      key={`ram-bar-${refreshCount}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(systemData.ram?.percent || 0, 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    {systemAPI.formatRAM(systemData.ram?.used || 0)} of{" "}
                    {systemAPI.formatRAM(systemData.ram?.total || 0)} used
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Disk Information */}
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="transition-all duration-300">
            <Card className="h-full overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-green-600 dark:text-green-400" />
                  Disk Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Space</span>
                      <span className="text-sm font-mono">{systemAPI.formatBytes(systemData.disk?.total || 0)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Used Space</span>
                      <motion.span
                        className="text-sm font-mono"
                        key={`disk-used-${refreshCount}`}
                        initial={{ fontWeight: "bold" }}
                        animate={{ fontWeight: "normal" }}
                        transition={{ duration: 1 }}
                      >
                        {systemAPI.formatBytes(systemData.disk?.used || 0)}
                      </motion.span>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Disk Usage</span>
                    <motion.span
                      className={`text-sm font-mono ${systemAPI.getDiskUsageColor(systemData.disk?.percent || 0)}`}
                      key={`disk-percent-${refreshCount}`}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {systemData.disk?.percent || 0}%
                    </motion.span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                    <motion.div
                      className={`h-3 rounded-full transition-all duration-300 ${systemAPI.getProgressBarColor(
                        systemData.disk?.percent || 0,
                      )}`}
                      style={{ width: `${Math.min(systemData.disk?.percent || 0, 100)}%` }}
                      key={`disk-bar-${refreshCount}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(systemData.disk?.percent || 0, 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    {systemAPI.formatBytes(systemData.disk?.used || 0)} of{" "}
                    {systemAPI.formatBytes(systemData.disk?.total || 0)} used
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* No Data State */}
      {!error && connectionStatus.isConnected && !systemData && (
        <motion.div variants={itemVariants} className="transition-all duration-300">
          <Card className="apple-card">
            <CardContent className="text-center py-12">
              <motion.div
                animate={{
                  opacity: [0.5, 1, 0.5],
                  scale: [0.98, 1, 0.98],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <Monitor className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2">No System Data Found</h3>
              <p className="text-muted-foreground mb-4">The backend is connected but no system data is available.</p>
              <Button variant="outline" onClick={handleManualRefresh} disabled={isRefreshing}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Retry
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function SystemInfoPage() {
  return (
    <AuthGuard>
      <SystemInfoContent />
    </AuthGuard>
  )
}
