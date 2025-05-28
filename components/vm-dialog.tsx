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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { VirtualMachine } from "@/lib/storage"
import { PREDEFINED_OPTIONS } from "@/lib/config"

interface VMDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Omit<VirtualMachine, "id" | "createdAt">) => void
  initialData?: VirtualMachine | null
}

export function VMDialog({ open, onOpenChange, onSave, initialData }: VMDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    provider: "",
    hardware: "",
    tags: "",
    os: "",
    storageSize: "",
    networkAdapter: "",
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        provider: initialData.provider,
        hardware: initialData.hardware,
        tags: initialData.tags.join(", "),
        os: initialData.os,
        storageSize: initialData.storageSize,
        networkAdapter: initialData.networkAdapter,
      })
    } else {
      setFormData({
        name: "",
        provider: "",
        hardware: "",
        tags: "",
        os: "",
        storageSize: "",
        networkAdapter: "",
      })
    }
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: formData.name,
      provider: formData.provider,
      hardware: formData.hardware,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      os: formData.os,
      storageSize: formData.storageSize,
      networkAdapter: formData.networkAdapter,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Virtual Machine" : "Create Virtual Machine"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update the virtual machine details." : "Add a new virtual machine to your collection."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ubuntu Development Server"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="provider">Provider</Label>
              <Select
                value={formData.provider}
                onValueChange={(value) => setFormData({ ...formData, provider: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_OPTIONS.virtualMachine.providers.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="hardware">Hardware Configuration</Label>
              <Select
                value={formData.hardware}
                onValueChange={(value) => setFormData({ ...formData, hardware: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hardware configuration" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_OPTIONS.virtualMachine.hardwareConfigs.map((config) => (
                    <SelectItem key={config} value={config}>
                      {config}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.hardware === "Custom Configuration" && (
                <Textarea
                  placeholder="Enter custom hardware configuration"
                  value={formData.hardware}
                  onChange={(e) => setFormData({ ...formData, hardware: e.target.value })}
                  className="mt-2"
                  rows={2}
                />
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="os">Operating System</Label>
              <Select value={formData.os} onValueChange={(value) => setFormData({ ...formData, os: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select operating system" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_OPTIONS.virtualMachine.operatingSystems.map((os) => (
                    <SelectItem key={os} value={os}>
                      {os}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="storageSize">Storage Size</Label>
              <Select
                value={formData.storageSize}
                onValueChange={(value) => setFormData({ ...formData, storageSize: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select storage size" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_OPTIONS.virtualMachine.storageSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.storageSize === "Custom Size" && (
                <Input
                  placeholder="Enter custom storage size (e.g., 150GB)"
                  value={formData.storageSize}
                  onChange={(e) => setFormData({ ...formData, storageSize: e.target.value })}
                  className="mt-2"
                />
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="networkAdapter">Network Adapter</Label>
              <Select
                value={formData.networkAdapter}
                onValueChange={(value) => setFormData({ ...formData, networkAdapter: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select network adapter" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_OPTIONS.virtualMachine.networkAdapters.map((adapter) => (
                    <SelectItem key={adapter} value={adapter}>
                      {adapter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="development, testing, linux, server"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{initialData ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
