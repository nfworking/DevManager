"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ItemCard } from "@/components/item-card"
import { type PhysicalDevice, getStorageData, saveStorageData, generateId } from "@/lib/storage"
import { DeviceDialog } from "@/components/device-dialog"
import { DeviceDetailDialog } from "@/components/device-detail-dialog"
import { AuthGuard } from "@/components/auth-guard"

function PhysicalDevicesContent() {
  const [devices, setDevices] = useState<PhysicalDevice[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingDevice, setEditingDevice] = useState<PhysicalDevice | null>(null)
  const [viewingDevice, setViewingDevice] = useState<PhysicalDevice | null>(null)

  useEffect(() => {
    const data = getStorageData()
    setDevices(data.physicalDevices)
  }, [])

  const handleSave = (deviceData: Omit<PhysicalDevice, "id" | "createdAt">) => {
    const data = getStorageData()

    if (editingDevice) {
      const updatedDevices = data.physicalDevices.map((device) =>
        device.id === editingDevice.id
          ? { ...deviceData, id: editingDevice.id, createdAt: editingDevice.createdAt }
          : device,
      )
      data.physicalDevices = updatedDevices
      setDevices(updatedDevices)
    } else {
      const newDevice: PhysicalDevice = {
        ...deviceData,
        id: generateId(),
        createdAt: new Date().toISOString(),
      }
      data.physicalDevices.push(newDevice)
      setDevices([...data.physicalDevices])
    }

    saveStorageData(data)
    setIsCreateOpen(false)
    setEditingDevice(null)
  }

  const handleDelete = (id: string) => {
    const data = getStorageData()
    data.physicalDevices = data.physicalDevices.filter((device) => device.id !== id)
    setDevices(data.physicalDevices)
    saveStorageData(data)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Physical Devices</h1>
          <p className="text-muted-foreground">Manage your physical hardware inventory</p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="transition-all duration-200 hover:scale-105"
          data-testid="add-device-button"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Device
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <ItemCard
            key={device.id}
            title={device.name}
            description={`${device.manufacturer} ${device.model} • ${device.os}`}
            tags={device.tags}
            metadata={[
              { label: "Storage", value: device.storageSize },
              { label: "Network", value: device.networkAdapter },
            ]}
            onView={() => setViewingDevice(device)}
            onEdit={() => setEditingDevice(device)}
            onDelete={() => handleDelete(device.id)}
          />
        ))}
      </div>

      {devices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No physical devices found</p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add your first device
          </Button>
        </div>
      )}

      <DeviceDialog
        open={isCreateOpen || !!editingDevice}
        onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) setEditingDevice(null)
        }}
        onSave={handleSave}
        initialData={editingDevice}
      />

      <DeviceDetailDialog
        device={viewingDevice}
        open={!!viewingDevice}
        onOpenChange={(open) => !open && setViewingDevice(null)}
      />
    </div>
  )
}

export default function PhysicalDevicesPage() {
  return (
    <AuthGuard>
      <PhysicalDevicesContent />
    </AuthGuard>
  )
}
