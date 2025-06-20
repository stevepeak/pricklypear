import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      modifiers={{
        weekend: (date) => date.getDay() === 0 || date.getDay() === 6,
      }}
      modifiersStyles={{
        weekend: { backgroundColor: "var(--muted)", border: "none" },
      }}
      classNames={{
        // day: 'w-9 p-1 text-center hover:bg-muted/50',
        day_button: "w-9 p-1 text-center hover:bg-accent",
        ...classNames,
      }}
      {...props}
    />
  );
}

export { Calendar };
