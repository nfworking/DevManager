"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ItemCard } from "@/components/item-card"
import { type Note, getStorageData, saveStorageData, generateId } from "@/lib/storage"
import { NoteDialog } from "@/components/note-dialog"
import { NoteEditor } from "@/components/note-editor"
import { AuthGuard } from "@/components/auth-guard"

function NotesContent() {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [viewingNote, setViewingNote] = useState<Note | null>(null)

  useEffect(() => {
    const data = getStorageData()
    setNotes(data.notes)
    setFilteredNotes(data.notes)
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredNotes(notes)
    } else {
      const filtered = notes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredNotes(filtered)
    }
  }, [searchQuery, notes])

  const handleSave = (noteData: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
    const data = getStorageData()
    const now = new Date().toISOString()

    if (editingNote) {
      const updatedNotes = data.notes.map((note) =>
        note.id === editingNote.id
          ? { ...noteData, id: editingNote.id, createdAt: editingNote.createdAt, updatedAt: now }
          : note,
      )
      data.notes = updatedNotes
      setNotes(updatedNotes)
    } else {
      const newNote: Note = {
        ...noteData,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      }
      data.notes.push(newNote)
      setNotes([...data.notes])
    }

    saveStorageData(data)
    setIsCreateOpen(false)
    setEditingNote(null)
  }

  const handleDelete = (id: string) => {
    const data = getStorageData()
    data.notes = data.notes.filter((note) => note.id !== id)
    setNotes(data.notes)
    saveStorageData(data)
  }

  const getPreview = (content: string) => {
    return content.length > 100 ? content.substring(0, 100) + "..." : content
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">Create and manage your markdown notes</p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="transition-all duration-200 hover:scale-105"
          data-testid="add-note-button"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <ItemCard
            key={note.id}
            title={note.title}
            description={getPreview(note.content)}
            tags={note.tags}
            metadata={[{ label: "Updated", value: new Date(note.updatedAt).toLocaleDateString() }]}
            onView={() => setViewingNote(note)}
            onEdit={() => setEditingNote(note)}
            onDelete={() => handleDelete(note.id)}
          />
        ))}
      </div>

      {filteredNotes.length === 0 && searchQuery === "" && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No notes found</p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create your first note
          </Button>
        </div>
      )}

      {filteredNotes.length === 0 && searchQuery !== "" && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No notes match your search</p>
        </div>
      )}

      <NoteDialog
        open={isCreateOpen || !!editingNote}
        onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) setEditingNote(null)
        }}
        onSave={handleSave}
        initialData={editingNote}
      />

      <NoteEditor
        note={viewingNote}
        open={!!viewingNote}
        onOpenChange={(open) => !open && setViewingNote(null)}
        onSave={(updatedNote) => {
          const data = getStorageData()
          const updatedNotes = data.notes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
          data.notes = updatedNotes
          setNotes(updatedNotes)
          saveStorageData(data)
        }}
      />
    </div>
  )
}

export default function NotesPage() {
  return (
    <AuthGuard>
      <NotesContent />
    </AuthGuard>
  )
}
