"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getStorageData, type DevManagerData } from "@/lib/storage"
import { Search, Server, Monitor, KeyRound, Layers, FileText, Disc, Command, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface SearchResult {
  id: string
  title: string
  description: string
  type: string
  category: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  tags?: string[]
  createdAt?: string
}

interface GlobalSearchProps {
  className?: string
}

export function GlobalSearch({ className }: GlobalSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [data, setData] = useState<DevManagerData>({
    virtualMachines: [],
    physicalDevices: [],
    accounts: [],
    techStack: [],
    notes: [],
    isos: [],
  })
  const router = useRouter()

  // Load data
  useEffect(() => {
    setData(getStorageData())
  }, [open])

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Create searchable results
  const allResults = useMemo((): SearchResult[] => {
    const results: SearchResult[] = []

    // Virtual Machines
    data.virtualMachines.forEach((vm) => {
      results.push({
        id: vm.id,
        title: vm.name,
        description: `${vm.provider} • ${vm.os}`,
        type: "Virtual Machine",
        category: "Infrastructure",
        href: "/virtual-machines",
        icon: Server,
        tags: vm.tags,
        createdAt: vm.createdAt,
      })
    })

    // Physical Devices
    data.physicalDevices.forEach((device) => {
      results.push({
        id: device.id,
        title: device.name,
        description: `${device.manufacturer} ${device.model} • ${device.os}`,
        type: "Physical Device",
        category: "Hardware",
        href: "/physical-devices",
        icon: Monitor,
        tags: device.tags,
        createdAt: device.createdAt,
      })
    })

    // ISO Files
    data.isos?.forEach((iso) => {
      results.push({
        id: iso.id,
        title: iso.name,
        description: `${iso.size} • ${iso.location}`,
        type: "ISO File",
        category: "Files",
        href: "/isos",
        icon: Disc,
        tags: iso.tags,
        createdAt: iso.createdAt,
      })
    })

    // Accounts
    data.accounts.forEach((account) => {
      results.push({
        id: account.id,
        title: account.name,
        description: `${account.website} • ${account.username}`,
        type: "Account",
        category: "Security",
        href: "/accounts",
        icon: KeyRound,
        tags: account.tags,
        createdAt: account.createdAt,
      })
    })

    // Tech Stack
    data.techStack.forEach((tech) => {
      results.push({
        id: tech.id,
        title: tech.name,
        description: tech.reason,
        type: "Technology",
        category: "Development",
        href: "/tech-stack",
        icon: Layers,
        tags: tech.tags,
        createdAt: tech.createdAt,
      })
    })

    // Notes
    data.notes.forEach((note) => {
      results.push({
        id: note.id,
        title: note.title,
        description: note.content.substring(0, 100) + (note.content.length > 100 ? "..." : ""),
        type: "Note",
        category: "Documentation",
        href: "/notes",
        icon: FileText,
        tags: note.tags,
        createdAt: note.createdAt,
      })
    })

    return results
  }, [data])

  // Filter results based on query
  const filteredResults = useMemo(() => {
    if (!query.trim()) return []

    const searchTerm = query.toLowerCase()
    return allResults.filter((result) => {
      return (
        result.title.toLowerCase().includes(searchTerm) ||
        result.description.toLowerCase().includes(searchTerm) ||
        result.type.toLowerCase().includes(searchTerm) ||
        result.category.toLowerCase().includes(searchTerm) ||
        result.tags?.some((tag) => tag.toLowerCase().includes(searchTerm))
      )
    })
  }, [query, allResults])

  // Group results by category
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    filteredResults.forEach((result) => {
      if (!groups[result.category]) {
        groups[result.category] = []
      }
      groups[result.category].push(result)
    })
    return groups
  }, [filteredResults])

  const handleResultClick = (result: SearchResult) => {
    router.push(result.href)
    setOpen(false)
    setQuery("")
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setQuery("")
    }
  }

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outline"
        className={`relative h-9 w-full max-w-sm justify-start text-sm text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64 xl:w-80 bg-background/60 backdrop-blur-sm border-muted hover:bg-accent/50 transition-all duration-200 ${className}`}
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4 shrink-0" />
        <span className="hidden lg:inline-flex">Search everything...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Search Dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="overflow-hidden p-0 shadow-2xl border-0 bg-background/95 backdrop-blur-xl max-w-2xl">
          <DialogHeader className="px-4 pb-0 pt-4">
            <DialogTitle className="sr-only">Global Search</DialogTitle>
            <DialogDescription className="sr-only">Search across all your development resources</DialogDescription>
          </DialogHeader>

          <div className="flex items-center border-b border-border/50 px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search virtual machines, devices, accounts, notes..."
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              autoFocus
            />
            {query && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-muted/50" onClick={() => setQuery("")}>
                ×
              </Button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {query.trim() === "" ? (
              <div className="px-4 py-8 text-center">
                <Search className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">Start typing to search across all your resources</p>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                    <Command className="h-3 w-3" />K
                  </kbd>
                  <span>to open</span>
                  <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                    ESC
                  </kbd>
                  <span>to close</span>
                </div>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="mx-auto h-8 w-8 rounded-full bg-muted flex items-center justify-center mb-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try searching for virtual machines, devices, accounts, or notes
                </p>
              </div>
            ) : (
              <div className="px-2 py-2">
                {Object.entries(groupedResults).map(([category, results], categoryIndex) => (
                  <div key={category}>
                    {categoryIndex > 0 && <Separator className="my-2" />}
                    <div className="px-2 py-1">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{category}</h4>
                    </div>
                    <div className="space-y-1">
                      {results.map((result) => (
                        <Button
                          key={result.id}
                          variant="ghost"
                          className="w-full justify-start h-auto p-3 hover:bg-accent/50 transition-all duration-150 group"
                          onClick={() => handleResultClick(result)}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-accent transition-colors duration-150">
                              <result.icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium truncate">{result.title}</p>
                                <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5">
                                  {result.type}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                              {result.tags && result.tags.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {result.tags.slice(0, 3).map((tag, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-muted/50 text-muted-foreground"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {result.tags.length > 3 && (
                                    <span className="text-xs text-muted-foreground">+{result.tags.length - 3}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {filteredResults.length > 0 && (
            <div className="border-t border-border/50 px-4 py-2">
              <p className="text-xs text-muted-foreground">
                {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""} found
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
