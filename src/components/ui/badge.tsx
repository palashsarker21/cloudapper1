import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--brand-gradient)] text-primary-foreground shadow-sm hover:opacity-90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:opacity-90",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-sm hover:opacity-90",
        success:
          "border-transparent bg-success text-success-foreground shadow-sm hover:opacity-90",
        warning:
          "border-transparent bg-warning text-warning-foreground shadow-sm hover:opacity-90",
        info:
          "border-transparent bg-info text-info-foreground shadow-sm hover:opacity-90",
        outline: "text-foreground border-2 border-primary/20 bg-background/50",

      },

    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
