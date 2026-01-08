import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  onSubmit?: (e: React.FormEvent) => void
  submitLabel?: string
  cancelLabel?: string
  loading?: boolean
  showFooter?: boolean
  footerContent?: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
  className?: string
}

export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  submitLabel = "Simpan",
  cancelLabel = "Tutup",
  loading = false,
  showFooter = true,
  footerContent,
  side = "right",
  className,
}: FormSheetProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(e)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={side} 
        className={cn("flex flex-col sm:max-w-md", className)}
      >
        <SheetHeader className="text-left">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        {onSubmit ? (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto py-6 space-y-6">
              {children}
            </div>
            
            {showFooter && (
              <div className="flex flex-col gap-2 pt-4 border-t mt-auto">
                {footerContent || (
                  <>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {submitLabel}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => onOpenChange(false)} 
                      disabled={loading}
                      className="w-full"
                    >
                      {cancelLabel}
                    </Button>
                  </>
                )}
              </div>
            )}
          </form>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-6 space-y-6">
              {children}
            </div>
            
            {showFooter && (
              <div className="flex flex-col gap-2 pt-4 border-t mt-auto">
                {footerContent || (
                  <Button 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                    className="w-full"
                  >
                    {cancelLabel}
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

// View mode sheet - for displaying data only
interface ViewSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  onEdit?: () => void
  editLabel?: string
  closeLabel?: string
  side?: "top" | "bottom" | "left" | "right"
  className?: string
}

export function ViewSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  onEdit,
  editLabel = "Edit",
  closeLabel = "Tutup",
  side = "right",
  className,
}: ViewSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={side} 
        className={cn("flex flex-col sm:max-w-md", className)}
      >
        <SheetHeader className="text-left">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {children}
        </div>

        <div className="flex flex-col gap-2 pt-4 border-t mt-auto">
          {onEdit && (
            <Button onClick={onEdit} className="w-full">
              {editLabel}
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            {closeLabel}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Field display component for view mode
interface FieldDisplayProps {
  label: string
  value: React.ReactNode
  className?: string
}

export function FieldDisplay({ label, value, className }: FieldDisplayProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
        {label}
      </p>
      <p className="text-sm font-medium">{value || "-"}</p>
    </div>
  )
}
