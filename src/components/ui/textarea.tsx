import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Border and background styles
        "border-input border rounded-sm bg-transparent dark:bg-input/30",
        // Text and placeholder styles
        "text-base md:text-sm placeholder:text-muted-foreground",
        // Layout and sizing
        "flex field-sizing-content min-h-16 w-full",
        // Spacing and padding
        "px-3 py-2",
        // Visual effects
        "shadow-xs transition-[color,box-shadow] outline-none",
        // Invalid state styles
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        // Disabled state styles
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
