"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LiveMarkdownEditor } from "@/components/live-markdown-editor"
import type { Note } from "@/lib/storage"
import { Save, Edit, Eye } from "lucide-react"

interface NoteEditorProps {
  note: Note | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (note: Note) => void
}

export function NoteEditor({ note, open, onOpenChange, onSave }: NoteEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
  })

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content,
        tags: note.tags.join(", "),
      })
      setIsEditing(false)
    }
  }, [note, open])

  if (!note) return null

  const handleSave = () => {
    const updatedNote: Note = {
      ...note,
      title: formData.title,
      content: formData.content,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      updatedAt: new Date().toISOString(),
    }
    onSave(updatedNote)
    setIsEditing(false)
  }

  const renderMarkdown = (content: string) => {
    return content
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4 text-foreground">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-3 text-foreground">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mb-2 text-foreground">$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4 class="text-lg font-medium mb-2 text-foreground">$1</h4>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-foreground">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic text-foreground">$1</em>')
      .replace(/`(.*?)`/gim, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono text-foreground">$1</code>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 text-foreground">• $1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 text-foreground list-decimal">$1</li>')
      .replace(
        /^> (.*$)/gim,
        '<blockquote class="border-l-4 border-muted-foreground pl-4 italic text-muted-foreground">$1</blockquote>',
      )
      .replace(
        /\[([^\]]+)\]$$([^)]+)$$/gim,
        '<a href="$2" class="text-blue-600 dark:text-blue-400 underline hover:no-underline">$1</a>',
      )
      .replace(/\n/gim, "<br>")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{note.title}</DialogTitle>
              <DialogDescription>
                Created {new Date(note.createdAt).toLocaleDateString()} • Updated{" "}
                {new Date(note.updatedAt).toLocaleDateString()}
              </DialogDescription>
            </div>
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? <Eye className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
              {isEditing ? "Preview" : "Edit"}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <LiveMarkdownEditor
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                rows={15}
              />

              <div className="grid gap-2">
                <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                <Input
                  id="edit-tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border rounded-md p-6 bg-muted/20 min-h-[400px]">
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(note.content),
                  }}
                />
              </div>

              {note.tags.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
