"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Eye, EyeOff } from "lucide-react"
import { ItemCard } from "@/components/item-card"
import { type Account, getStorageData, saveStorageData, generateId } from "@/lib/storage"
import { AccountDialog } from "@/components/account-dialog"
import { AccountDetailDialog } from "@/components/account-detail-dialog"
import { AuthGuard } from "@/components/auth-guard"
import { toast } from "@/hooks/use-toast"
import { showSuccessNotification } from "@/lib/notifications"

function AccountsContent() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [viewingAccount, setViewingAccount] = useState<Account | null>(null)
  const [showPasswords, setShowPasswords] = useState(false)

  useEffect(() => {
    const data = getStorageData()
    setAccounts(data.accounts)
  }, [])

  const handleSave = (accountData: Omit<Account, "id" | "createdAt">) => {
    const data = getStorageData()

    if (editingAccount) {
      const updatedAccounts = data.accounts.map((account) =>
        account.id === editingAccount.id
          ? { ...accountData, id: editingAccount.id, createdAt: editingAccount.createdAt }
          : account,
      )
      data.accounts = updatedAccounts
      setAccounts(updatedAccounts)

      toast({
        title: "Account Updated",
        description: `${accountData.name} has been successfully updated.`,
        variant: "success",
      })

      showSuccessNotification("Account Updated", `${accountData.name} credentials have been successfully updated.`, {
        label: "View Accounts",
        href: "/accounts",
      })
    } else {
      const newAccount: Account = {
        ...accountData,
        id: generateId(),
        createdAt: new Date().toISOString(),
      }
      data.accounts.push(newAccount)
      setAccounts([...data.accounts])

      toast({
        title: "Account Added",
        description: `${accountData.name} has been securely saved.`,
        variant: "success",
      })

      showSuccessNotification(
        "Account Added",
        `${accountData.name} for ${accountData.website} has been securely saved to your vault.`,
        { label: "View Accounts", href: "/accounts" },
      )
    }

    saveStorageData(data)
    setIsCreateOpen(false)
    setEditingAccount(null)
  }

  const handleDelete = (id: string) => {
    const data = getStorageData()
    const accountToDelete = data.accounts.find((account) => account.id === id)
    data.accounts = data.accounts.filter((account) => account.id !== id)
    setAccounts(data.accounts)
    saveStorageData(data)

    toast({
      title: "Account Deleted",
      description: `${accountToDelete?.name || "Account"} has been deleted.`,
      variant: "success",
    })

    showSuccessNotification(
      "Account Deleted",
      `${accountToDelete?.name || "Account"} has been permanently removed from your vault.`,
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Saved Accounts</h1>
          <p className="text-muted-foreground">Manage your account credentials securely</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPasswords(!showPasswords)}
            className="transition-all duration-200"
          >
            {showPasswords ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {showPasswords ? "Hide" : "Show"} Passwords
          </Button>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="transition-all duration-200 hover:scale-105"
            data-testid="add-account-button"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <ItemCard
            key={account.id}
            title={account.name}
            description={account.website}
            tags={account.tags}
            metadata={[
              { label: "Username", value: account.username },
              { label: "Email", value: account.email },
              {
                label: "Password",
                value: showPasswords ? account.password : "••••••••",
              },
            ]}
            onView={() => setViewingAccount(account)}
            onEdit={() => setEditingAccount(account)}
            onDelete={() => handleDelete(account.id)}
          />
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No accounts found</p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add your first account
          </Button>
        </div>
      )}

      <AccountDialog
        open={isCreateOpen || !!editingAccount}
        onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) setEditingAccount(null)
        }}
        onSave={handleSave}
        initialData={editingAccount}
      />

      <AccountDetailDialog
        account={viewingAccount}
        open={!!viewingAccount}
        onOpenChange={(open) => !open && setViewingAccount(null)}
        showPassword={showPasswords}
      />
    </div>
  )
}

export default function AccountsPage() {
  return (
    <AuthGuard>
      <AccountsContent />
    </AuthGuard>
  )
}
