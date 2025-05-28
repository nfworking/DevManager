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
import type { PhysicalDevice } from "@/lib/storage"
import { PREDEFINED_OPTIONS } from "@/lib/config"

interface DeviceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Omit<PhysicalDevice, "id" | "createdAt">) => void
  initialData?: PhysicalDevice | null
}

export function DeviceDialog({ open, onOpenChange, onSave, initialData }: DeviceDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    manufacturer: "",
    model: "",
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
        manufacturer: initialData.manufacturer,
        model: initialData.model,
        hardware: initialData.hardware,
        tags: initialData.tags.join(", "),
        os: initialData.os,
        storageSize: initialData.storageSize,
        networkAdapter: initialData.networkAdapter,
      })
    } else {
      setFormData({
        name: "",
        manufacturer: "",
        model: "",
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
      manufacturer: formData.manufacturer,
      model: formData.model,
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
          <DialogTitle>{initialData ? "Edit Physical Device" : "Add Physical Device"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update the device details." : "Add a new physical device to your inventory."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Device Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="MacBook Pro M3 Max"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Select
                value={formData.manufacturer}
                onValueChange={(value) => setFormData({ ...formData, manufacturer: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manufacturer" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_OPTIONS.physicalDevice.manufacturers.map((manufacturer) => (
                    <SelectItem key={manufacturer} value={manufacturer}>
                      {manufacturer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="model">Device Type/Model</Label>
              <Select value={formData.model} onValueChange={(value) => setFormData({ ...formData, model: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select device type" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_OPTIONS.physicalDevice.deviceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="hardware">Hardware Specifications</Label>
              <Select
                value={formData.hardware}
                onValueChange={(value) => setFormData({ ...formData, hardware: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hardware configuration" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_OPTIONS.physicalDevice.hardwareConfigs.map((config) => (
                    <SelectItem key={config} value={config}>
                      {config}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.hardware === "Custom Configuration" && (
                <Textarea
                  placeholder="Enter custom hardware specifications"
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
                  {PREDEFINED_OPTIONS.physicalDevice.operatingSystems.map((os) => (
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
                  <SelectValue placeholder="Select storage configuration" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_OPTIONS.physicalDevice.storageSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.storageSize === "Custom Storage" && (
                <Input
                  placeholder="Enter custom storage configuration"
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
                  {PREDEFINED_OPTIONS.physicalDevice.networkAdapters.map((adapter) => (
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
                placeholder="laptop, development, portable, work"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{initialData ? "Update" : "Add Device"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
