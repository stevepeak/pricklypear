import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SystemPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SystemPromptDialog({
  open,
  onOpenChange,
}: SystemPromptDialogProps) {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const stored = localStorage.getItem("systemPrompt") || "";
      setSystemPrompt(stored);
    }
  }, [open]);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem("systemPrompt", systemPrompt);
    setIsSaving(false);
    onOpenChange(false);
    toast("System prompt updated", {
      description: "Your system prompt has been saved.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update System Prompt</DialogTitle>
          <DialogDescription>
            This prompt will be used as the system prompt for AI chats. It is
            stored only in your browser.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="Enter your system prompt here..."
          className="mt-2 h-96"
          autoFocus
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSaving} variant="default">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
