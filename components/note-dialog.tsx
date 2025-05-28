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
import { LiveMarkdownEditor } from "@/components/live-markdown-editor"
import type { Note } from "@/lib/storage"

interface NoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Omit<Note, "id" | "createdAt" | "updatedAt">) => void
  initialData?: Note | null
}

export function NoteDialog({ open, onOpenChange, onSave, initialData }: NoteDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        content: initialData.content,
        tags: initialData.tags.join(", "),
      })
    } else {
      setFormData({
        title: "",
        content: "",
        tags: "",
      })
    }
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title: formData.title,
      content: formData.content,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Note" : "Create Note"}</DialogTitle>
          <DialogDescription>{initialData ? "Update your note." : "Create a new markdown note."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="My awesome note"
                required
              />
            </div>

            <LiveMarkdownEditor
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder="# My Note

Write your markdown content here...

- List item 1
- List item 2

**Bold text** and *italic text*

> This is a blockquote

`inline code`

[Link text](https://example.com)"
            />

            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="ideas, project, todo"
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
