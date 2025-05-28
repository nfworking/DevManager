"use client"

import { useState, useEffect, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface LiveMarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
}

export function LiveMarkdownEditor({
  value,
  onChange,
  placeholder = "Write your markdown content here...",
  rows = 12,
  className = "",
}: LiveMarkdownEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [value])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Content (Live Markdown Preview)</Label>
        <div className="text-xs text-muted-foreground">{value.length} characters</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Editor</div>
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`resize-none font-mono text-sm min-h-[300px] ${className}`}
            rows={rows}
          />
        </div>

        {/* Live Preview */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Live Preview</div>
          <div className="border rounded-md p-4 min-h-[300px] bg-muted/20 overflow-auto">
            {value.trim() ? (
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(value),
                }}
              />
            ) : (
              <div className="text-muted-foreground text-sm italic">Start typing to see live preview...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
