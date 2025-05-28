"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ItemCard } from "@/components/item-card"
import { type ISO, getStorageData, saveStorageData, generateId } from "@/lib/storage"
import { ISODialog } from "@/components/iso-dialog"
import { ISODetailDialog } from "@/components/iso-detail-dialog"
import { AuthGuard } from "@/components/auth-guard"

function ISOsContent() {
  const [isos, setISOs] = useState<ISO[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingISO, setEditingISO] = useState<ISO | null>(null)
  const [viewingISO, setViewingISO] = useState<ISO | null>(null)

  useEffect(() => {
    const data = getStorageData()
    setISOs(data.isos || [])
  }, [])

  const handleSave = (isoData: Omit<ISO, "id" | "createdAt">) => {
    const data = getStorageData()

    if (editingISO) {
      const updatedISOs = data.isos.map((iso) =>
        iso.id === editingISO.id ? { ...isoData, id: editingISO.id, createdAt: editingISO.createdAt } : iso,
      )
      data.isos = updatedISOs
      setISOs(updatedISOs)
    } else {
      const newISO: ISO = {
        ...isoData,
        id: generateId(),
        createdAt: new Date().toISOString(),
      }
      data.isos = data.isos || []
      data.isos.push(newISO)
      setISOs([...data.isos])
    }

    saveStorageData(data)
    setIsCreateOpen(false)
    setEditingISO(null)
  }

  const handleDelete = (id: string) => {
    const data = getStorageData()
    data.isos = data.isos.filter((iso) => iso.id !== id)
    setISOs(data.isos)
    saveStorageData(data)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ISO Files</h1>
          <p className="text-muted-foreground">Manage your ISO file collection</p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="transition-all duration-200 hover:scale-105"
          data-testid="add-iso-button"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add ISO
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isos.map((iso) => (
          <ItemCard
            key={iso.id}
            title={iso.name}
            description={iso.location}
            tags={iso.tags}
            metadata={[
              { label: "Size", value: iso.size },
              { label: "Date", value: new Date(iso.date).toLocaleDateString() },
            ]}
            onView={() => setViewingISO(iso)}
            onEdit={() => setEditingISO(iso)}
            onDelete={() => handleDelete(iso.id)}
          />
        ))}
      </div>

      {isos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No ISO files found</p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add your first ISO
          </Button>
        </div>
      )}

      <ISODialog
        open={isCreateOpen || !!editingISO}
        onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) setEditingISO(null)
        }}
        onSave={handleSave}
        initialData={editingISO}
      />

      <ISODetailDialog iso={viewingISO} open={!!viewingISO} onOpenChange={(open) => !open && setViewingISO(null)} />
    </div>
  )
}

export default function ISOsPage() {
  return (
    <AuthGuard>
      <ISOsContent />
    </AuthGuard>
  )
}
