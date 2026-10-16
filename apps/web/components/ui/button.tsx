import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default:
    "bg-primary text-white hover:bg-emerald-800 shadow-sm active:bg-emerald-900",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 shadow-sm active:bg-red-800",
  outline:
    "border-2 border-stone-300 bg-transparent text-stone-900 hover:bg-stone-100 hover:text-stone-950 dark:border-stone-700 dark:text-stone-100 active:bg-stone-200",
  secondary:
    "bg-stone-100 text-stone-900 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-100 active:bg-stone-300",
  ghost:
    "text-stone-900 hover:bg-stone-100 hover:text-stone-950 dark:text-stone-100 active:bg-stone-200",
  link: "text-primary underline-offset-4 hover:underline p-0 h-auto min-h-0 min-w-0",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "min-h-[44px] min-w-[44px] px-4 py-2 text-sm",
  sm: "min-h-[44px] sm:min-h-[36px] px-3 py-1.5 text-xs",
  lg: "min-h-[48px] px-6 py-3 text-base",
  icon: "min-h-[44px] min-w-[44px] h-11 w-11 p-0 flex items-center justify-center",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      type = "button",
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        type={asChild ? undefined : type}
        disabled={disabled}
        aria-disabled={disabled ? "true" : undefined}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";