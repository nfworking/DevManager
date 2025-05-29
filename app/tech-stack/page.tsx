"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ItemCard } from "@/components/item-card"
import { type TechStack, getStorageData, saveStorageData, generateId } from "@/lib/storage"
import { TechStackDialog } from "@/components/tech-stack-dialog"
import { TechStackDetailDialog } from "@/components/tech-stack-detail-dialog"
import { AuthGuard } from "@/components/auth-guard"
import { toast } from "@/hooks/use-toast"
import { showSuccessNotification } from "@/lib/notifications"

function TechStackContent() {
  const [techStacks, setTechStacks] = useState<TechStack[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTechStack, setEditingTechStack] = useState<TechStack | null>(null)
  const [viewingTechStack, setViewingTechStack] = useState<TechStack | null>(null)

  useEffect(() => {
    const data = getStorageData()
    setTechStacks(data.techStack)
  }, [])

  const handleSave = (techStackData: Omit<TechStack, "id" | "createdAt">) => {
    const data = getStorageData()

    if (editingTechStack) {
      const updatedTechStacks = data.techStack.map((tech) =>
        tech.id === editingTechStack.id
          ? { ...techStackData, id: editingTechStack.id, createdAt: editingTechStack.createdAt }
          : tech,
      )
      data.techStack = updatedTechStacks
      setTechStacks(updatedTechStacks)

      toast({
        title: "Technology Updated",
        description: `${techStackData.name} has been successfully updated.`,
        variant: "success",
      })

      showSuccessNotification(
        "Technology Updated",
        `${techStackData.name} has been successfully updated in your tech stack.`,
        { label: "View Tech Stack", href: "/tech-stack" },
      )
    } else {
      const newTechStack: TechStack = {
        ...techStackData,
        id: generateId(),
        createdAt: new Date().toISOString(),
      }
      data.techStack.push(newTechStack)
      setTechStacks([...data.techStack])

      toast({
        title: "Technology Added",
        description: `${techStackData.name} has been added to your stack.`,
        variant: "success",
      })

      showSuccessNotification(
        "Technology Added",
        `${techStackData.name} has been added to your tech stack for ${techStackData.os}.`,
        { label: "View Tech Stack", href: "/tech-stack" },
      )
    }

    saveStorageData(data)
    setIsCreateOpen(false)
    setEditingTechStack(null)
  }

  const handleDelete = (id: string) => {
    const data = getStorageData()
    const techToDelete = data.techStack.find((tech) => tech.id === id)
    data.techStack = data.techStack.filter((tech) => tech.id !== id)
    setTechStacks(data.techStack)
    saveStorageData(data)

    toast({
      title: "Technology Removed",
      description: `${techToDelete?.name || "Technology"} has been removed.`,
      variant: "success",
    })

    showSuccessNotification(
      "Technology Removed",
      `${techToDelete?.name || "Technology"} has been removed from your tech stack.`,
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tech Stack</h1>
          <p className="text-muted-foreground">Manage your development tools and technologies</p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="transition-all duration-200 hover:scale-105"
          data-testid="add-tech-button"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Technology
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {techStacks.map((tech) => (
          <ItemCard
            key={tech.id}
            title={tech.name}
            description={tech.reason}
            tags={tech.tags}
            metadata={[
              { label: "OS", value: tech.os },
              { label: "Size", value: tech.installationSize },
            ]}
            onView={() => setViewingTechStack(tech)}
            onEdit={() => setEditingTechStack(tech)}
            onDelete={() => handleDelete(tech.id)}
          />
        ))}
      </div>

      {techStacks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No technologies found</p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add your first technology
          </Button>
        </div>
      )}

      <TechStackDialog
        open={isCreateOpen || !!editingTechStack}
        onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) setEditingTechStack(null)
        }}
        onSave={handleSave}
        initialData={editingTechStack}
      />

      <TechStackDetailDialog
        techStack={viewingTechStack}
        open={!!viewingTechStack}
        onOpenChange={(open) => !open && setViewingTechStack(null)}
      />
    </div>
  )
}

export default function TechStackPage() {
  return (
    <AuthGuard>
      <TechStackContent />
    </AuthGuard>
  )
}
