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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface SystemPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SystemPromptDialog({
  open,
  onOpenChange,
}: SystemPromptDialogProps) {
  const [activeTab, setActiveTab] = useState("ai-chat");
  const [aiChatPrompt, setAiChatPrompt] = useState("");
  const [messageReviewPrompt, setMessageReviewPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const aiChat = localStorage.getItem("systemPrompt:ai-chat") || "";
      const review = localStorage.getItem("systemPrompt:message-review") || "";
      setAiChatPrompt(aiChat);
      setMessageReviewPrompt(review);
    }
  }, [open]);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem("systemPrompt:ai-chat", aiChatPrompt);
    localStorage.setItem("systemPrompt:message-review", messageReviewPrompt);
    setIsSaving(false);
    onOpenChange(false);
    toast("System prompts updated", {
      description: "Your system prompts have been saved.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update System Prompt</DialogTitle>
          <DialogDescription>
            Set your system prompts for AI Chat and Message Review. Prompts are
            stored only in your browser.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="ai-chat">AI Chat</TabsTrigger>
            <TabsTrigger value="message-review">Message Review</TabsTrigger>
          </TabsList>
          <TabsContent value="ai-chat">
            <Textarea
              value={aiChatPrompt}
              onChange={(e) => setAiChatPrompt(e.target.value)}
              placeholder="Enter your AI Chat system prompt here..."
              className="mt-2 h-96"
              autoFocus={activeTab === "ai-chat"}
            />
          </TabsContent>
          <TabsContent value="message-review">
            <Textarea
              value={messageReviewPrompt}
              onChange={(e) => setMessageReviewPrompt(e.target.value)}
              placeholder="Enter your Message Review system prompt here..."
              className="mt-2 h-96"
              autoFocus={activeTab === "message-review"}
            />
          </TabsContent>
        </Tabs>
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
