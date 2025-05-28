"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { TechStack } from "@/lib/storage"
import { Calendar, Layers, HardDrive, Monitor, ImageIcon } from "lucide-react"

interface TechStackDetailDialogProps {
  techStack: TechStack | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TechStackDetailDialog({ techStack, open, onOpenChange }: TechStackDetailDialogProps) {
  if (!techStack) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {techStack.icon && (
              <img
                src={techStack.icon || "/placeholder.svg"}
                alt={techStack.name}
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            )}
            {techStack.name}
          </DialogTitle>
          <DialogDescription>Technology Details</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {techStack.icon && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ImageIcon className="h-4 w-4" />
                Icon/Logo
              </div>
              <div className="flex items-center gap-2">
                <img
                  src={techStack.icon || "/placeholder.svg"}
                  alt={techStack.name}
                  className="w-8 h-8 object-contain border rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
                <p className="text-sm text-muted-foreground break-all">{techStack.icon}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Layers className="h-4 w-4" />
              Reason for Use
            </div>
            <p className="text-sm text-muted-foreground">{techStack.reason}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Monitor className="h-4 w-4" />
                Operating System
              </div>
              <p className="text-sm text-muted-foreground">{techStack.os}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <HardDrive className="h-4 w-4" />
                Installation Size
              </div>
              <p className="text-sm text-muted-foreground">{techStack.installationSize}</p>
            </div>
          </div>

          {techStack.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {techStack.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Added {new Date(techStack.createdAt).toLocaleDateString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
