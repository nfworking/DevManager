"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { PhysicalDevice } from "@/lib/storage"
import { Calendar, Monitor, HardDrive, Network, Cpu } from "lucide-react"

interface DeviceDetailDialogProps {
  device: PhysicalDevice | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeviceDetailDialog({ device, open, onOpenChange }: DeviceDetailDialogProps) {
  if (!device) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{device.name}</DialogTitle>
          <DialogDescription>Physical Device Details</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Monitor className="h-4 w-4" />
                Manufacturer
              </div>
              <p className="text-sm text-muted-foreground">{device.manufacturer}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Cpu className="h-4 w-4" />
                Model
              </div>
              <p className="text-sm text-muted-foreground">{device.model}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Operating System</h4>
            <p className="text-sm text-muted-foreground">{device.os}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <HardDrive className="h-4 w-4" />
                Storage
              </div>
              <p className="text-sm text-muted-foreground">{device.storageSize}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Network className="h-4 w-4" />
                Network
              </div>
              <p className="text-sm text-muted-foreground">{device.networkAdapter}</p>
            </div>
          </div>

          {device.hardware && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Hardware Specifications</h4>
              <p className="text-sm text-muted-foreground">{device.hardware}</p>
            </div>
          )}

          {device.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {device.tags.map((tag, index) => (
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
            Added {new Date(device.createdAt).toLocaleDateString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
