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
import { Textarea } from "@/components/ui/textarea"
import type { TechStack } from "@/lib/storage"

interface TechStackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Omit<TechStack, "id" | "createdAt">) => void
  initialData?: TechStack | null
}

export function TechStackDialog({ open, onOpenChange, onSave, initialData }: TechStackDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    reason: "",
    os: "",
    installationSize: "",
    tags: "",
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        icon: initialData.icon,
        reason: initialData.reason,
        os: initialData.os,
        installationSize: initialData.installationSize,
        tags: initialData.tags.join(", "),
      })
    } else {
      setFormData({
        name: "",
        icon: "",
        reason: "",
        os: "",
        installationSize: "",
        tags: "",
      })
    }
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: formData.name,
      icon: formData.icon,
      reason: formData.reason,
      os: formData.os,
      installationSize: formData.installationSize,
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
          <DialogTitle>{initialData ? "Edit Technology" : "Add Technology"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update the technology details." : "Add a new technology to your stack."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Technology Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="React"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="icon">Icon/Logo URL</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="https://reactjs.org/logo.svg"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Use</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Component-based UI library for building interactive interfaces"
                className="resize-none"
                rows={3}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="os">Operating System</Label>
              <Input
                id="os"
                value={formData.os}
                onChange={(e) => setFormData({ ...formData, os: e.target.value })}
                placeholder="Cross-platform"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="installationSize">Installation Size</Label>
              <Input
                id="installationSize"
                value={formData.installationSize}
                onChange={(e) => setFormData({ ...formData, installationSize: e.target.value })}
                placeholder="~2.5MB"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="frontend, javascript, ui, library"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{initialData ? "Update" : "Add Technology"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
