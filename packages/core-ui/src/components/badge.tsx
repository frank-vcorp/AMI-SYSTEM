import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold max-w-fit transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-medical-500 text-white hover:bg-medical-600",
        secondary:
          "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80",
        destructive:
          "border-transparent bg-red-500 text-white hover:bg-red-500/80",
        outline: "text-slate-950 border-slate-200",
        success: "border-transparent bg-clinical-success/10 text-clinical-success border-clinical-success/20",
        warning: "border-transparent bg-clinical-warning/10 text-clinical-warning border-clinical-warning/20",
        danger: "border-transparent bg-clinical-error/10 text-clinical-error border-clinical-error/20",
        info: "border-transparent bg-clinical-info/10 text-clinical-info border-clinical-info/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
