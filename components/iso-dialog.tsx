"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ISO } from "@/lib/storage"

interface ISODialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Omit<ISO, "id" | "createdAt">) => void
  initialData?: ISO | null
}

export function ISODialog({ open, onOpenChange, onSave, initialData }: ISODialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    size: "",
    location: "",
    date: "",
    tags: "",
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        size: initialData.size,
        location: initialData.location,
        date: initialData.date.split("T")[0], // Format for date input
        tags: initialData.tags.join(", "),
      })
    } else {
      setFormData({
        name: "",
        size: "",
        location: "",
        date: new Date().toISOString().split("T")[0], // Default to today
        tags: "",
      })
    }
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: formData.name,
      size: formData.size,
      location: formData.location,
      date: formData.date,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit ISO File" : "Add ISO File"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update the ISO file details." : "Add a new ISO file to your collection."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">ISO Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ubuntu 22.04.3 Desktop"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="size">File Size</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="4.7 GB"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location/Path</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="/Users/john/Downloads/ubuntu-22.04.3-desktop-amd64.iso"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="ubuntu, linux, desktop, lts"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{initialData ? "Update" : "Add ISO"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
