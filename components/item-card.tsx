"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ItemCardProps {
  title: string
  description?: string
  tags?: string[]
  metadata?: { label: string; value: string }[]
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

export function ItemCard({
  title,
  description,
  tags = [],
  metadata = [],
  onView,
  onEdit,
  onDelete,
  className,
}: ItemCardProps) {
  return (
    <Card
      className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1" onClick={onView}>
            <CardTitle className="text-lg font-semibold leading-tight">{title}</CardTitle>
            {description && <CardDescription className="text-sm text-muted-foreground">{description}</CardDescription>}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={onView}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0" onClick={onView}>
        {metadata.length > 0 && (
          <div className="space-y-2 mb-3">
            {metadata.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.label}:</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
