import * as React from "react"
import { Loader2 } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export interface ActionButtonProps extends ButtonProps {
  tooltip?: string | React.ReactNode
  loading?: boolean
  icon?: React.ReactNode
}

const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ children, tooltip, loading, icon, disabled, className, ...props }, ref) => {
    
    // Determine if we assume icon-only mode (no children, but has icon) to adjust sizing/padding potentially?
    // For now standard Button handles it.
    
    const buttonContent = (
      <Button
        ref={ref}
        disabled={disabled || loading}
        className={cn(className)}
        {...props}
      >
        {loading ? (
          <Loader2 className={cn("h-4 w-4 animate-spin", children ? "mr-2" : "")} />
        ) : (
          icon ? (
             // If icon is present, render it. If children exist, add margin.
             // If icon is a ReactNode, just render it. 
             // We clone it to add class if needed, or just render.
             <span className={cn("flex items-center justify-center", children ? "mr-2" : "")}>
               {icon}
             </span>
          ) : null
        )}
        {children}
      </Button>
    )

    if (tooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {/* TooltipTrigger must wrap a single child that accepts ref. Button does forward ref. */}
            {buttonContent}
          </TooltipTrigger>
          <TooltipContent>
            {typeof tooltip === "string" ? <p>{tooltip}</p> : tooltip}
          </TooltipContent>
        </Tooltip>
      )
    }

    return buttonContent
  }
)
ActionButton.displayName = "ActionButton"

export { ActionButton }
