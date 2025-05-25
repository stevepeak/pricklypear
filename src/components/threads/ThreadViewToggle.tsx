import React from "react";
import { List, LayoutGrid } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

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

function ThreadViewToggle(props: ThreadViewToggleProps) {
  const { value, onValueChange, className } = props;
  const isCards = value === "cards";
  const nextView = isCards ? "table" : "cards";
  const tooltipText = `Change view to ${nextView === "cards" ? "cards" : "table"}`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            aria-label={tooltipText}
            pressed={isCards}
            onPressedChange={(pressed) =>
              onValueChange(pressed ? "cards" : "table")
            }
            className={className}
          >
            {isCards ? (
              <List className="h-4 w-4" />
            ) : (
              <LayoutGrid className="h-4 w-4" />
            )}
          </Toggle>
        </TooltipTrigger>
        <TooltipContent side="top">{tooltipText}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default ThreadViewToggle;
