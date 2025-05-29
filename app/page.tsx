"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getStorageData, type DevManagerData } from "@/lib/storage"
import {
  Server,
  Monitor,
  KeyRound,
  Layers,
  FileText,
  Plus,
  TrendingUp,
  Activity,
  Disc,
  GripVertical,
} from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"
import { motion } from "framer-motion"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

// Define the types for our draggable items
interface StatItem {
  id: string
  title: string
  count: number
  icon: React.ElementType
  href: string
  color: string
  bgColor: string
}

interface QuickActionItem {
  id: string
  title: string
  icon: React.ElementType
  href: string
}

function DashboardContent() {
  const [data, setData] = useState<DevManagerData>({
    virtualMachines: [],
    physicalDevices: [],
    accounts: [],
    techStack: [],
    notes: [],
    isos: [],
  })

  // State for draggable items
  const [statItems, setStatItems] = useState<StatItem[]>([])
  const [quickActionItems, setQuickActionItems] = useState<QuickActionItem[]>([])

  // Load data and initialize draggable items
  useEffect(() => {
    const storageData = getStorageData()
    setData(storageData)

    // Initialize stat items if not already in localStorage
    const savedStatOrder = localStorage.getItem("dashboard-stat-order")
    if (savedStatOrder) {
      setStatItems(JSON.parse(savedStatOrder))
    } else {
      const initialStats = [
        {
          id: "virtual-machines",
          title: "Virtual Machines",
          count: storageData.virtualMachines.length,
          icon: Server,
          href: "/virtual-machines",
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-50 dark:bg-blue-950/50",
        },
        {
          id: "physical-devices",
          title: "Physical Devices",
          count: storageData.physicalDevices.length,
          icon: Monitor,
          href: "/physical-devices",
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-50 dark:bg-green-950/50",
        },
        {
          id: "iso-files",
          title: "ISO Files",
          count: storageData.isos?.length || 0,
          icon: Disc,
          href: "/isos",
          color: "text-yellow-600 dark:text-yellow-400",
          bgColor: "bg-yellow-50 dark:bg-yellow-950/50",
        },
        {
          id: "saved-accounts",
          title: "Saved Accounts",
          count: storageData.accounts.length,
          icon: KeyRound,
          href: "/accounts",
          color: "text-purple-600 dark:text-purple-400",
          bgColor: "bg-purple-50 dark:bg-purple-950/50",
        },
        {
          id: "tech-stack",
          title: "Tech Stack",
          count: storageData.techStack.length,
          icon: Layers,
          href: "/tech-stack",
          color: "text-orange-600 dark:text-orange-400",
          bgColor: "bg-orange-50 dark:bg-orange-950/50",
        },
        {
          id: "notes",
          title: "Notes",
          count: storageData.notes.length,
          icon: FileText,
          href: "/notes",
          color: "text-indigo-600 dark:text-indigo-400",
          bgColor: "bg-indigo-50 dark:bg-indigo-950/50",
        },
      ]
      setStatItems(initialStats)
      localStorage.setItem("dashboard-stat-order", JSON.stringify(initialStats))
    }

    // Initialize quick action items if not already in localStorage
    const savedQuickActionOrder = localStorage.getItem("dashboard-quick-action-order")
    if (savedQuickActionOrder) {
      setQuickActionItems(JSON.parse(savedQuickActionOrder))
    } else {
      const initialQuickActions = [
        {
          id: "add-vm",
          title: "Add VM",
          icon: Server,
          href: "/virtual-machines",
        },
        {
          id: "add-device",
          title: "Add Device",
          icon: Monitor,
          href: "/physical-devices",
        },
        {
          id: "add-iso",
          title: "Add ISO",
          icon: Disc,
          href: "/isos",
        },
        {
          id: "add-account",
          title: "Add Account",
          icon: KeyRound,
          href: "/accounts",
        },
        {
          id: "add-tech",
          title: "Add Tech",
          icon: Layers,
          href: "/tech-stack",
        },
        {
          id: "new-note",
          title: "New Note",
          icon: FileText,
          href: "/notes",
        },
      ]
      setQuickActionItems(initialQuickActions)
      localStorage.setItem("dashboard-quick-action-order", JSON.stringify(initialQuickActions))
    }
  }, [])

  // Update counts when data changes
  useEffect(() => {
    if (statItems.length > 0) {
      const updatedStats = statItems.map((item) => {
        switch (item.id) {
          case "virtual-machines":
            return { ...item, count: data.virtualMachines.length }
          case "physical-devices":
            return { ...item, count: data.physicalDevices.length }
          case "iso-files":
            return { ...item, count: data.isos?.length || 0 }
          case "saved-accounts":
            return { ...item, count: data.accounts.length }
          case "tech-stack":
            return { ...item, count: data.techStack.length }
          case "notes":
            return { ...item, count: data.notes.length }
          default:
            return item
        }
      })
      setStatItems(updatedStats)
    }
  }, [data, statItems.length])

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

  // Handle drag end for stats
  const handleStatDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(statItems)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setStatItems(items)
    localStorage.setItem("dashboard-stat-order", JSON.stringify(items))
  }

  // Handle drag end for quick actions
  const handleQuickActionDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(quickActionItems)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setQuickActionItems(items)
    localStorage.setItem("dashboard-quick-action-order", JSON.stringify(items))
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

  return (
    <motion.div className="space-y-8" initial="hidden" animate="show" variants={containerVariants}>
      {/* Header */}
      <motion.div className="space-y-2" variants={itemVariants}>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Welcome to Dev Manager
        </h1>
        <p className="text-xl text-muted-foreground">Your centralized development environment dashboard</p>
      </motion.div>

      {/* Overview Stats */}
      <motion.div variants={itemVariants}>
        <DragDropContext onDragEnd={handleStatDragEnd}>
          <Droppable droppableId="stats" direction="horizontal">
            {(provided) => (
              <div
                className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {statItems.map((stat, index) => (
                  <Draggable key={stat.id} draggableId={stat.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${snapshot.isDragging ? "z-50" : ""}`}
                      >
                        <Link href={stat.href}>
                          <Card
                            className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/20 ${snapshot.isDragging ? "shadow-xl" : ""}`}
                          >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted/50"
                                >
                                  <GripVertical className="h-3 w-3 text-muted-foreground/50" />
                                </div>
                                {stat.title}
                              </CardTitle>
                              <motion.div
                                className={`p-2 rounded-lg ${stat.bgColor} transition-all duration-300`}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                              >
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                              </motion.div>
                            </CardHeader>
                            <CardContent>
                              <motion.div
                                className="text-2xl font-bold"
                                key={`stat-${stat.id}-${stat.count}`}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5 }}
                              >
                                {stat.count}
                              </motion.div>
                              <p className="text-xs text-muted-foreground">{stat.count === 1 ? "item" : "items"}</p>
                            </CardContent>
                          </Card>
                        </Link>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Quickly add new items to your development environment (drag to reorder)</CardDescription>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={handleQuickActionDragEnd}>
              <Droppable droppableId="quick-actions" direction="horizontal">
                {(provided) => (
                  <div
                    className="grid grid-cols-2 md:grid-cols-6 gap-4"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {quickActionItems.map((action, index) => (
                      <Draggable key={action.id} draggableId={action.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`${snapshot.isDragging ? "z-50" : ""}`}
                          >
                            <Button
                              asChild
                              variant="outline"
                              className={`h-20 flex-col gap-2 transition-all duration-300 hover:scale-105 relative ${snapshot.isDragging ? "shadow-xl" : ""}`}
                            >
                              <Link href={action.href}>
                                <div
                                  {...provided.dragHandleProps}
                                  className="absolute top-1 left-1 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted/50"
                                >
                                  <GripVertical className="h-3 w-3 text-muted-foreground/50" />
                                </div>
                                <motion.div whileHover={{ rotate: 10 }}>
                                  <action.icon className="h-6 w-6" />
                                </motion.div>
                                <span className="text-sm">{action.title}</span>
                              </Link>
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary Card */}
        <motion.div variants={itemVariants}>
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Environment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Items</span>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {totalItems}
                  </Badge>
                </motion.div>
              </div>
              <div className="space-y-2">
                <motion.div
                  className="flex justify-between text-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <span>Virtual Machines</span>
                  <span className="font-medium">{data.virtualMachines.length}</span>
                </motion.div>
                <motion.div
                  className="flex justify-between text-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span>Physical Devices</span>
                  <span className="font-medium">{data.physicalDevices.length}</span>
                </motion.div>
                <motion.div
                  className="flex justify-between text-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span>ISO Files</span>
                  <span className="font-medium">{data.isos?.length || 0}</span>
                </motion.div>
                <motion.div
                  className="flex justify-between text-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <span>Accounts</span>
                  <span className="font-medium">{data.accounts.length}</span>
                </motion.div>
                <motion.div
                  className="flex justify-between text-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span>Technologies</span>
                  <span className="font-medium">{data.techStack.length}</span>
                </motion.div>
                <motion.div
                  className="flex justify-between text-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <span>Notes</span>
                  <span className="font-medium">{data.notes.length}</span>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card className="transition-all duration-300 hover:shadow-md">
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
                    <motion.div
                      key={`${item.type}-${item.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link href={item.href}>
                        <motion.div
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          whileHover={{ x: 5 }}
                        >
                          <motion.div className="p-1.5 rounded-md bg-muted" whileHover={{ rotate: 10 }}>
                            <item.icon className="h-3 w-3" />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name || item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.type}</p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  className="text-center py-8 text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
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
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  </motion.div>
                  <p className="text-sm">No recent activity</p>
                  <p className="text-xs">Start by adding some items to your environment</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function HomePage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
