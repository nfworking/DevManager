"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getStorageData, type DevManagerData } from "@/lib/storage"
import { Server, Monitor, KeyRound, Layers, FileText, Plus, TrendingUp, Activity, Disc } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"

function DashboardContent() {
  const [data, setData] = useState<DevManagerData>({
    virtualMachines: [],
    physicalDevices: [],
    accounts: [],
    techStack: [],
    notes: [],
    isos: [],
  })

  useEffect(() => {
    setData(getStorageData())
  }, [])

  const stats = [
    {
      title: "Virtual Machines",
      count: data.virtualMachines.length,
      icon: Server,
      href: "/virtual-machines",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
    },
    {
      title: "Physical Devices",
      count: data.physicalDevices.length,
      icon: Monitor,
      href: "/physical-devices",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/50",
    },
    {
      title: "ISO Files",
      count: data.isos?.length || 0,
      icon: Disc,
      href: "/isos",
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/50",
    },
    {
      title: "Saved Accounts",
      count: data.accounts.length,
      icon: KeyRound,
      href: "/accounts",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/50",
    },
    {
      title: "Tech Stack",
      count: data.techStack.length,
      icon: Layers,
      href: "/tech-stack",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/50",
    },
    {
      title: "Notes",
      count: data.notes.length,
      icon: FileText,
      href: "/notes",
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/50",
    },
  ]

  const recentItems = [
    ...data.virtualMachines.slice(-3).map((item) => ({
      ...item,
      type: "Virtual Machine",
      href: "/virtual-machines",
      icon: Server,
    })),
    ...data.physicalDevices.slice(-3).map((item) => ({
      ...item,
      type: "Physical Device",
      href: "/physical-devices",
      icon: Monitor,
    })),
    ...(data.isos || []).slice(-3).map((item) => ({
      ...item,
      type: "ISO File",
      href: "/isos",
      icon: Disc,
    })),
    ...data.notes.slice(-3).map((item) => ({
      ...item,
      type: "Note",
      href: "/notes",
      icon: FileText,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const totalItems =
    data.virtualMachines.length +
    data.physicalDevices.length +
    data.accounts.length +
    data.techStack.length +
    data.notes.length +
    (data.isos?.length || 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Welcome to Dev Manager
        </h1>
        <p className="text-xl text-muted-foreground">Your centralized development environment dashboard</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor} transition-all duration-200 group-hover:scale-110`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.count}</div>
                <p className="text-xs text-muted-foreground">{stat.count === 1 ? "item" : "items"}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Quickly add new items to your development environment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col gap-2 transition-all duration-200 hover:scale-105"
            >
              <Link href="/virtual-machines">
                <Server className="h-6 w-6" />
                <span className="text-sm">Add VM</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col gap-2 transition-all duration-200 hover:scale-105"
            >
              <Link href="/physical-devices">
                <Monitor className="h-6 w-6" />
                <span className="text-sm">Add Device</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col gap-2 transition-all duration-200 hover:scale-105"
            >
              <Link href="/isos">
                <Disc className="h-6 w-6" />
                <span className="text-sm">Add ISO</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col gap-2 transition-all duration-200 hover:scale-105"
            >
              <Link href="/accounts">
                <KeyRound className="h-6 w-6" />
                <span className="text-sm">Add Account</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col gap-2 transition-all duration-200 hover:scale-105"
            >
              <Link href="/tech-stack">
                <Layers className="h-6 w-6" />
                <span className="text-sm">Add Tech</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col gap-2 transition-all duration-200 hover:scale-105"
            >
              <Link href="/notes">
                <FileText className="h-6 w-6" />
                <span className="text-sm">New Note</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Environment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Items</span>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {totalItems}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Virtual Machines</span>
                <span className="font-medium">{data.virtualMachines.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Physical Devices</span>
                <span className="font-medium">{data.physicalDevices.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>ISO Files</span>
                <span className="font-medium">{data.isos?.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Accounts</span>
                <span className="font-medium">{data.accounts.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Technologies</span>
                <span className="font-medium">{data.techStack.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Notes</span>
                <span className="font-medium">{data.notes.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest additions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {recentItems.length > 0 ? (
              <div className="space-y-3">
                {recentItems.map((item, index) => (
                  <Link key={`${item.type}-${item.id}`} href={item.href}>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="p-1.5 rounded-md bg-muted">
                        <item.icon className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name || item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.type}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
                <p className="text-xs">Start by adding some items to your environment</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
