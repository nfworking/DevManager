"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { VirtualMachine } from "@/lib/storage"
import { Calendar, Server, HardDrive, Network } from "lucide-react"

interface VMDetailDialogProps {
  vm: VirtualMachine | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VMDetailDialog({ vm, open, onOpenChange }: VMDetailDialogProps) {
  if (!vm) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{vm.name}</DialogTitle>
          <DialogDescription>Virtual Machine Details</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Server className="h-4 w-4" />
                Provider
              </div>
              <p className="text-sm text-muted-foreground">{vm.provider}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <HardDrive className="h-4 w-4" />
                Storage
              </div>
              <p className="text-sm text-muted-foreground">{vm.storageSize}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Operating System</h4>
            <p className="text-sm text-muted-foreground">{vm.os}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Network className="h-4 w-4" />
              Network Adapter
            </div>
            <p className="text-sm text-muted-foreground">{vm.networkAdapter}</p>
          </div>

          {vm.hardware && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Hardware Information</h4>
              <p className="text-sm text-muted-foreground">{vm.hardware}</p>
            </div>
          )}

          {vm.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {vm.tags.map((tag, index) => (
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
            Created {new Date(vm.createdAt).toLocaleDateString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
