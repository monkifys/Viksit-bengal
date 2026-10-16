import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "success"
    | "warning"
    | "outline";
}

const badgeVariants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default:
    "border-transparent bg-primary text-white shadow hover:bg-emerald-800",
  secondary:
    "border-stone-300 bg-stone-100 text-stone-900 hover:bg-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100",
  destructive:
    "border-red-300 bg-red-100 text-red-950 hover:bg-red-200 dark:bg-red-950/40 dark:text-red-200",
  success:
    "border-emerald-300 bg-emerald-100 text-emerald-950 hover:bg-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200",
  warning:
    "border-amber-300 bg-amber-100 text-amber-950 hover:bg-amber-200 dark:bg-amber-950/40 dark:text-amber-200",
  outline:
    "border-stone-600 text-stone-900 dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}