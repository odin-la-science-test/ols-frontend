import { forwardRef, type ComponentProps } from "react"

import { cn } from "@/lib/utils"

const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-border bg-card/80 px-4 py-2 text-sm transition-all duration-200",
          "placeholder:text-muted-foreground/80",
          "hover:border-muted-foreground/40",
          "focus:outline-none focus:ring-1 focus:ring-[var(--module-accent,var(--color-ring))] focus:border-[var(--module-accent,var(--color-primary))]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          className
        )}
        spellCheck={true}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
