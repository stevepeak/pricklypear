import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Layout and sizing
        "flex h-9 w-full min-w-0",
        // Border and background styles
        "border-input border rounded-sm bg-transparent dark:bg-input/30",
        // Text and placeholder styles
        "text-base md:text-sm placeholder:text-muted-foreground",
        // File input styles
        "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        // Selection styles
        "selection:bg-primary selection:text-primary-foreground",
        // Spacing and padding
        "px-3 py-1",
        // Visual effects
        "transition-[color,box-shadow] outline-none",
        // Disabled state styles
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // Invalid state styles
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
