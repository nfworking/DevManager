"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ItemCard } from "@/components/item-card"
import { type VirtualMachine, getStorageData, saveStorageData, generateId } from "@/lib/storage"
import { VMDialog } from "@/components/vm-dialog"
import { VMDetailDialog } from "@/components/vm-detail-dialog"
import { AuthGuard } from "@/components/auth-guard"
import { toast } from "@/hooks/use-toast"
import { showSuccessNotification } from "@/lib/notifications"

function VirtualMachinesContent() {
  const [vms, setVMs] = useState<VirtualMachine[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingVM, setEditingVM] = useState<VirtualMachine | null>(null)
  const [viewingVM, setViewingVM] = useState<VirtualMachine | null>(null)

  useEffect(() => {
    const data = getStorageData()
    setVMs(data.virtualMachines)
  }, [])

  const handleSave = (vmData: Omit<VirtualMachine, "id" | "createdAt">) => {
    const data = getStorageData()

    if (editingVM) {
      // Update existing VM
      const updatedVMs = data.virtualMachines.map((vm) =>
        vm.id === editingVM.id ? { ...vmData, id: editingVM.id, createdAt: editingVM.createdAt } : vm,
      )
      data.virtualMachines = updatedVMs
      setVMs(updatedVMs)

      // Show success toast and notification
      toast({
        title: "Virtual Machine Updated",
        description: `${vmData.name} has been successfully updated.`,
        variant: "success",
      })

      showSuccessNotification("Virtual Machine Updated", `${vmData.name} has been successfully updated.`, {
        label: "View VMs",
        href: "/virtual-machines",
      })
    } else {
      // Create new VM
      const newVM: VirtualMachine = {
        ...vmData,
        id: generateId(),
        createdAt: new Date().toISOString(),
      }
      data.virtualMachines.push(newVM)
      setVMs([...data.virtualMachines])

      // Show success toast and notification
      toast({
        title: "Virtual Machine Created",
        description: `${vmData.name} has been successfully created.`,
        variant: "success",
      })

      showSuccessNotification(
        "Virtual Machine Created",
        `${vmData.name} has been successfully created with ${vmData.provider} provider.`,
        { label: "View VMs", href: "/virtual-machines" },
      )
    }

    saveStorageData(data)
    setIsCreateOpen(false)
    setEditingVM(null)
  }

  const handleDelete = (id: string) => {
    const data = getStorageData()
    const vmToDelete = data.virtualMachines.find((vm) => vm.id === id)
    data.virtualMachines = data.virtualMachines.filter((vm) => vm.id !== id)
    setVMs(data.virtualMachines)
    saveStorageData(data)

    // Show success toast and notification
    toast({
      title: "Virtual Machine Deleted",
      description: `${vmToDelete?.name || "Virtual machine"} has been deleted.`,
      variant: "success",
    })

    showSuccessNotification(
      "Virtual Machine Deleted",
      `${vmToDelete?.name || "Virtual machine"} has been permanently deleted.`,
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Virtual Machines</h1>
          <p className="text-muted-foreground">Manage your virtual machine collection</p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="transition-all duration-200 hover:scale-105"
          data-testid="add-vm-button"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add VM
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vms.map((vm) => (
          <ItemCard
            key={vm.id}
            title={vm.name}
            description={`${vm.provider} • ${vm.os}`}
            tags={vm.tags}
            metadata={[
              { label: "Storage", value: vm.storageSize },
              { label: "Network", value: vm.networkAdapter },
            ]}
            onView={() => setViewingVM(vm)}
            onEdit={() => setEditingVM(vm)}
            onDelete={() => handleDelete(vm.id)}
          />
        ))}
      </div>

      {vms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No virtual machines found</p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create your first VM
          </Button>
        </div>
      )}

      <VMDialog
        open={isCreateOpen || !!editingVM}
        onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) setEditingVM(null)
        }}
        onSave={handleSave}
        initialData={editingVM}
      />

      <VMDetailDialog vm={viewingVM} open={!!viewingVM} onOpenChange={(open) => !open && setViewingVM(null)} />
    </div>
  )
}

export default function VirtualMachinesPage() {
  return (
    <AuthGuard>
      <VirtualMachinesContent />
    </AuthGuard>
  )
}
