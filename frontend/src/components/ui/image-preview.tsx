import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { X, ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ImagePreviewProps {
  src: string
  alt?: string
  className?: string
  imageClassName?: string
  // Controlled mode props
  isOpen?: boolean
  onClose?: () => void
}

export function ImagePreview({ 
  src, 
  alt = "Image", 
  className, 
  imageClassName,
  isOpen,
  onClose
}: ImagePreviewProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  
  // Use controlled or uncontrolled mode
  const isControlled = isOpen !== undefined
  const open = isControlled ? isOpen : internalOpen
  const setOpen = isControlled 
    ? (value: boolean) => { if (!value && onClose) onClose() }
    : setInternalOpen

  // For controlled mode (used from ImageUpload), render only the modal
  if (isControlled) {
    return (
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          {/* Glassmorphism Overlay */}
          <DialogPrimitive.Overlay 
            className={cn(
              "fixed inset-0 z-50 backdrop-blur-md bg-black/60",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
            )}
          />
          
          {/* Accessibility: Hidden title and description */}
          <VisuallyHidden.Root asChild>
            <DialogPrimitive.Title>{alt}</DialogPrimitive.Title>
          </VisuallyHidden.Root>
          <VisuallyHidden.Root asChild>
            <DialogPrimitive.Description>Preview gambar {alt}</DialogPrimitive.Description>
          </VisuallyHidden.Root>
          
          {/* Modal Content */}
          <DialogPrimitive.Content
            className={cn(
              "fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            )}
            onClick={() => setOpen(false)}
          >
            {/* Close Button */}
            <DialogPrimitive.Close
              className={cn(
                "absolute top-4 right-4 z-50",
                "rounded-full p-2",
                "bg-white/10 backdrop-blur-md border border-white/20",
                "text-white hover:bg-white/20 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-white/50"
              )}
            >
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>

            {/* Image Container with glassmorphism frame */}
            <div 
              className={cn(
                "relative max-w-[90vw] max-h-[90vh]",
                "rounded-xl overflow-hidden",
                "bg-white/10 backdrop-blur-sm p-2",
                "border border-white/20 shadow-2xl"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={src}
                alt={alt}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
              
              {/* Image caption */}
              {alt && alt !== "Image" && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-linear-to-t from-black/60 to-transparent">
                  <p className="text-white text-sm font-medium text-center truncate">
                    {alt}
                  </p>
                </div>
              )}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    )
  }

  // Uncontrolled mode - renders thumbnail with click-to-open
  return (
    <>
      {/* Thumbnail with zoom icon overlay */}
      <div 
        className={cn(
          "relative group cursor-pointer overflow-hidden rounded-lg",
          className
        )}
        onClick={() => setOpen(true)}
      >
        <img 
          src={src} 
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
            imageClassName
          )}
        />
        {/* Zoom overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30 cursor-pointer hover:bg-white/30 transition-colors">
                <ZoomIn className="h-6 w-6 text-white" />
              </div>
            </TooltipTrigger>
            <TooltipContent>Perbesar Gambar</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Lightbox Modal */}
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          {/* Glassmorphism Overlay */}
          <DialogPrimitive.Overlay 
            className={cn(
              "fixed inset-0 z-50 backdrop-blur-md bg-black/60",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
            )}
          />
          
          {/* Accessibility: Hidden title and description */}
          <VisuallyHidden.Root asChild>
            <DialogPrimitive.Title>{alt}</DialogPrimitive.Title>
          </VisuallyHidden.Root>
          <VisuallyHidden.Root asChild>
            <DialogPrimitive.Description>Preview gambar {alt}</DialogPrimitive.Description>
          </VisuallyHidden.Root>
          
          {/* Modal Content */}
          <DialogPrimitive.Content
            className={cn(
              "fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            )}
            onClick={() => setOpen(false)}
          >
            {/* Close Button */}
            <DialogPrimitive.Close
              className={cn(
                "absolute top-4 right-4 z-50",
                "rounded-full p-2",
                "bg-white/10 backdrop-blur-md border border-white/20",
                "text-white hover:bg-white/20 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-white/50"
              )}
            >
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>

            {/* Image Container with glassmorphism frame */}
            <div 
              className={cn(
                "relative max-w-[90vw] max-h-[90vh]",
                "rounded-xl overflow-hidden",
                "bg-white/10 backdrop-blur-sm p-2",
                "border border-white/20 shadow-2xl"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={src}
                alt={alt}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
              
              {/* Image caption */}
              {alt && alt !== "Image" && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-linear-to-t from-black/60 to-transparent">
                  <p className="text-white text-sm font-medium text-center truncate">
                    {alt}
                  </p>
                </div>
              )}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  )
}
