import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base layout & colours — text-foreground is critical for dark mode visibility
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1",
        "text-base text-foreground transition-colors outline-none",
        // Placeholder
        "placeholder:text-muted-foreground",
        // Focus ring
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        // Disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50",
        // Validation
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        // Dark mode overrides
        "dark:bg-input/30 dark:disabled:bg-input/80",
        "dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        // Webkit autofill override — keeps text readable when browser fills the field
        "[&:-webkit-autofill]:[-webkit-text-fill-color:var(--foreground)]",
        "[&:-webkit-autofill]:shadow-[0_0_0_1000px_var(--input)_inset]",
        // md text size
        "md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
