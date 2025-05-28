"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import type { Account } from "@/lib/storage"
import { Calendar, Globe, Mail, User, Key, Copy } from "lucide-react"
import { useState } from "react"

interface AccountDetailDialogProps {
  account: Account | null
  open: boolean
  onOpenChange: (open: boolean) => void
  showPassword: boolean
}

export function AccountDetailDialog({ account, open, onOpenChange, showPassword }: AccountDetailDialogProps) {
  const [copied, setCopied] = useState<string | null>(null)

  if (!account) return null

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{account.name}</DialogTitle>
          <DialogDescription>Account Details</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Globe className="h-4 w-4" />
              Website/Service
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{account.website}</p>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(account.website, "website")}>
                <Copy className="h-3 w-3" />
                {copied === "website" ? "Copied!" : ""}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                Username
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{account.username}</p>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(account.username, "username")}>
                  <Copy className="h-3 w-3" />
                  {copied === "username" ? "Copied!" : ""}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Mail className="h-4 w-4" />
                Email
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{account.email}</p>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(account.email, "email")}>
                  <Copy className="h-3 w-3" />
                  {copied === "email" ? "Copied!" : ""}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Key className="h-4 w-4" />
                Password
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground font-mono">
                  {showPassword ? account.password : "••••••••"}
                </p>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(account.password, "password")}>
                  <Copy className="h-3 w-3" />
                  {copied === "password" ? "Copied!" : ""}
                </Button>
              </div>
            </div>
          </div>

          {account.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Notes</h4>
                <p className="text-sm text-muted-foreground">{account.notes}</p>
              </div>
            </>
          )}

          {account.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {account.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Created {new Date(account.createdAt).toLocaleDateString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
