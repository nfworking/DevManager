"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { downloadDataAsFile, importData } from "@/lib/storage"
import { Download, Upload, FileText } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { showSuccessNotification, showErrorNotification } from "@/lib/notifications"

export function ExportImportButtons() {
  const [importOpen, setImportOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    try {
      downloadDataAsFile()
      toast({
        title: "Data Exported",
        description: "Your data has been successfully exported.",
        variant: "success",
      })

      showSuccessNotification(
        "Data Exported",
        "Your development environment data has been successfully exported as a backup file.",
      )
    } catch (error) {
      console.error("Export failed:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      })

      showErrorNotification("Export Failed", "Failed to export your data. Please try again.")
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const success = importData(content)

        if (success) {
          toast({
            title: "Data Imported",
            description: "Data imported successfully! Please refresh the page to see changes.",
            variant: "success",
          })

          showSuccessNotification(
            "Data Imported",
            "Your data has been successfully imported. Please refresh the page to see all changes.",
          )

          setImportOpen(false)
          setTimeout(() => window.location.reload(), 2000)
        } else {
          toast({
            title: "Import Failed",
            description: "Failed to import data. Please check the file format.",
            variant: "destructive",
          })

          showErrorNotification(
            "Import Failed",
            "Failed to import data. Please ensure the file is a valid Dev Manager backup.",
          )
        }
      } catch (error) {
        toast({
          title: "Import Error",
          description: "Error reading file. Please ensure it's a valid JSON file.",
          variant: "destructive",
        })

        showErrorNotification(
          "Import Error",
          "Error reading the selected file. Please ensure it's a valid JSON backup file.",
        )
      }
    }
    reader.readAsText(file)
  }

  const resetImportDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        className="transition-all duration-200 hover:scale-105"
      >
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>

      <Dialog
        open={importOpen}
        onOpenChange={(open) => {
          setImportOpen(open)
          if (!open) resetImportDialog()
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="transition-all duration-200 hover:scale-105">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Import Data
            </DialogTitle>
            <DialogDescription>
              Select a JSON backup file to import your data. This will replace all current data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select backup file</Label>
              <Input id="file-upload" type="file" accept=".json" ref={fileInputRef} onChange={handleFileSelect} />
              <p className="text-xs text-muted-foreground">Only JSON files exported from Dev Manager are supported.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
