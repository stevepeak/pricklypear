import React from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { SystemPromptDialog } from "@/components/commands/SystemPrompt";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const [isSystemPromptOpen, setIsSystemPromptOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Search Emoji</CommandItem>
            <CommandItem>Calculator</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>Profile</CommandItem>
            <CommandItem>Billing</CommandItem>
            <CommandItem>Settings</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Advanced">
            <CommandItem>Demo Mode</CommandItem>
            <CommandItem
              onSelect={() => {
                setOpen(false);
                setIsSystemPromptOpen(true);
              }}
            >
              Update System Prompt
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      <SystemPromptDialog
        open={isSystemPromptOpen}
        onOpenChange={setIsSystemPromptOpen}
      />
    </>
  );
}
