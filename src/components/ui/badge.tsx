import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[11px] tracking-wide uppercase",
  {
    variants: {
      variant: {
        default: "border-border bg-surface text-muted",
        primary: "border-primary/20 bg-soft text-primary",
        cae: "border-cae/20 bg-cae/10 text-cae",
        highlight: "border-highlight/20 bg-highlight/10 text-highlight",
        outline: "border-border bg-transparent text-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
