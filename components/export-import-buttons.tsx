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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { downloadDataAsFile, importData } from "@/lib/storage"
import { Download, Upload, FileText, CheckCircle, XCircle } from "lucide-react"

export function ExportImportButtons() {
  const [importOpen, setImportOpen] = useState(false)
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")
  const [importMessage, setImportMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    try {
      downloadDataAsFile()
    } catch (error) {
      console.error("Export failed:", error)
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
          setImportStatus("success")
          setImportMessage("Data imported successfully! Please refresh the page to see changes.")
        } else {
          setImportStatus("error")
          setImportMessage("Failed to import data. Please check the file format.")
        }
      } catch (error) {
        setImportStatus("error")
        setImportMessage("Error reading file. Please ensure it's a valid JSON file.")
      }
    }
    reader.readAsText(file)
  }

  const resetImportDialog = () => {
    setImportStatus("idle")
    setImportMessage("")
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
            {importStatus === "idle" && (
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select backup file</Label>
                <Input id="file-upload" type="file" accept=".json" ref={fileInputRef} onChange={handleFileSelect} />
                <p className="text-xs text-muted-foreground">
                  Only JSON files exported from Dev Manager are supported.
                </p>
              </div>
            )}

            {importStatus === "success" && (
              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">{importMessage}</AlertDescription>
              </Alert>
            )}

            {importStatus === "error" && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{importMessage}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>
              {importStatus === "success" ? "Close" : "Cancel"}
            </Button>
            {importStatus === "success" && <Button onClick={() => window.location.reload()}>Refresh Page</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
