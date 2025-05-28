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
import type { Account } from "@/lib/storage"

interface AccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Omit<Account, "id" | "createdAt">) => void
  initialData?: Account | null
}

export function AccountDialog({ open, onOpenChange, onSave, initialData }: AccountDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    website: "",
    notes: "",
    tags: "",
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        username: initialData.username,
        email: initialData.email,
        password: initialData.password,
        website: initialData.website,
        notes: initialData.notes,
        tags: initialData.tags.join(", "),
      })
    } else {
      setFormData({
        name: "",
        username: "",
        email: "",
        password: "",
        website: "",
        notes: "",
        tags: "",
      })
    }
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: formData.name,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      website: formData.website,
      notes: formData.notes,
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
          <DialogTitle>{initialData ? "Edit Account" : "Add Account"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update the account details." : "Add a new account to your collection."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="GitHub Account"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website">Website/Service</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="github.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="johndoe"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this account"
                className="resize-none"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="work, development, personal"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{initialData ? "Update" : "Add Account"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
