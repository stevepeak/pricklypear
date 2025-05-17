import React from "react";
import { List, LayoutGrid } from "lucide-react";

import { Switch } from "@/components/ui/switch";

/**
 * DD-90
 * Toggle between "table" and "cards" thread views.
 *
 * Visually it displays a switch whose track contains a List icon on the
 * left (table view) and a LayoutGrid icon on the right (card view).
 * When the thumb is on the right the switch is *checked* and therefore
 * represents the "cards" view.
 */
interface ThreadViewToggleProps {
  /** Current view selection. */
  value: "table" | "cards";
  /** Callback fired whenever the user toggles the switch. */
  onValueChange: (value: "table" | "cards") => void;
  /** Forwarded className so the parent can style/position the control. */
  className?: string;
}

const iconClass =
  "pointer-events-none absolute top-1/2 -translate-y-1/2 h-3 w-3 transition-colors";

/**
 * Wrapper around the generic Switch that shows the relevant icons in the
 * track and maps the boolean `checked` state to a string view value.
 */
function ThreadViewToggle(props: ThreadViewToggleProps) {
  const { value, onValueChange, className } = props;
  const checked = value === "cards";

  return (
    <div
      className={
        className ? `relative inline-flex ${className}` : "relative inline-flex"
      }
    >
      <Switch
        checked={checked}
        onCheckedChange={(isChecked) =>
          onValueChange(isChecked ? "cards" : "table")
        }
        aria-label="Toggle thread view"
      />
      {/* Left icon – table view */}
      <List
        className={`${iconClass} left-1 ${
          checked ? "text-muted-foreground" : "text-secondary"
        }`}
      />
      {/* Right icon – cards view */}
      <LayoutGrid
        className={`${iconClass} right-1 ${
          checked ? "text-secondary" : "text-muted-foreground"
        }`}
      />
    </div>
  );
}

export default ThreadViewToggle;
