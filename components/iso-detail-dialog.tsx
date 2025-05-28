"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { ISO } from "@/lib/storage"
import { Calendar, HardDrive, FolderOpen, Disc } from "lucide-react"

interface ISODetailDialogProps {
  iso: ISO | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ISODetailDialog({ iso, open, onOpenChange }: ISODetailDialogProps) {
  if (!iso) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Disc className="h-5 w-5" />
            {iso.name}
          </DialogTitle>
          <DialogDescription>ISO File Details</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <HardDrive className="h-4 w-4" />
                File Size
              </div>
              <p className="text-sm text-muted-foreground">{iso.size}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                Date
              </div>
              <p className="text-sm text-muted-foreground">{new Date(iso.date).toLocaleDateString()}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FolderOpen className="h-4 w-4" />
              Location/Path
            </div>
            <p className="text-sm text-muted-foreground break-all font-mono bg-muted/50 p-2 rounded">{iso.location}</p>
          </div>

          {iso.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {iso.tags.map((tag, index) => (
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
            Added {new Date(iso.createdAt).toLocaleDateString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
