import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  itemName?: string
  onConfirm: () => void | Promise<void>
  loading?: boolean
  confirmLabel?: string
  cancelLabel?: string
}

export function DeleteDialog({
  open,
  onOpenChange,
  title = "Hapus Data",
  description,
  itemName,
  onConfirm,
  loading = false,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
}: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
    } finally {
      setIsDeleting(false)
    }
  }

  const isLoading = loading || isDeleting

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description || (
              <>
                Apakah Anda yakin ingin menghapus{" "}
                {itemName && <strong>{itemName}</strong>}
                {itemName ? "?" : " data ini?"} Tindakan ini tidak dapat dibatalkan.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
