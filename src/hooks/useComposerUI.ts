import { useState, useEffect } from "react";
import { isAIThread } from "@/types/thread";
import type { Thread } from "@/types/thread";

interface UseComposerUIProps {
  thread: Thread;
  messagesEndRef?: React.RefObject<HTMLDivElement>;
}

export function useComposerUI({ thread, messagesEndRef }: UseComposerUIProps) {
  const [autoAccept, setAutoAccept] = useState(
    isAIThread(thread) ? false : true,
  );
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);

  // Load auto-accept preference from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("autoAcceptAISuggestions");
    setAutoAccept(stored === "true");
  }, []);

  // Show 'Jump to latest message' button if bottom is not visible
  useEffect(() => {
    const handleScroll = () => {
      if (!messagesEndRef?.current) return;
      const rect = messagesEndRef.current.getBoundingClientRect();
      const atBottom = rect.bottom <= window.innerHeight - 40;
      setShowJumpToLatest(!atBottom);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [messagesEndRef]);

  const handleToggleAutoAccept = (value: boolean) => {
    setAutoAccept(value);
    localStorage.setItem("autoAcceptAISuggestions", value.toString());
  };

  const handleJumpToLatest = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
  };

  return {
    autoAccept,
    showJumpToLatest,
    handleToggleAutoAccept,
    handleJumpToLatest,
  };
}
