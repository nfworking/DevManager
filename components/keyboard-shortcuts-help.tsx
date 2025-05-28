"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { Keyboard, HelpCircle } from "lucide-react"

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false)
  const shortcuts = useKeyboardShortcuts()

  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = []
      }
      acc[shortcut.category].push(shortcut)
      return acc
    },
    {} as Record<string, typeof shortcuts>,
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="transition-all duration-200 hover:scale-105"
          data-testid="help-button"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Keyboard shortcuts help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>Use these keyboard shortcuts to navigate and perform actions quickly.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> Press keys in sequence (e.g., press "g" then "h" to go to dashboard). Use{" "}
              <Badge variant="outline" className="mx-1">
                Cmd/Ctrl + ?
              </Badge>{" "}
              to open this help dialog.
            </p>
          </div>

          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-3">{category}</h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut) => (
                  <div key={shortcut.key} className="flex items-center justify-between py-2">
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.key.split(" ").map((key, index) => (
                        <Badge key={index} variant="outline" className="font-mono text-xs">
                          {key.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="mt-4" />
            </div>
          ))}

          <div>
            <h3 className="text-lg font-semibold mb-3">General</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">Toggle sidebar</span>
                <div className="flex gap-1">
                  <Badge variant="outline" className="font-mono text-xs">
                    CMD/CTRL
                  </Badge>
                  <Badge variant="outline" className="font-mono text-xs">
                    B
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">Show keyboard shortcuts</span>
                <div className="flex gap-1">
                  <Badge variant="outline" className="font-mono text-xs">
                    CMD/CTRL
                  </Badge>
                  <Badge variant="outline" className="font-mono text-xs">
                    ?
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
