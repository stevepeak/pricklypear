import { useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { isAIThread } from "@/types/thread";
import type { Thread } from "@/types/thread";

interface ComposerTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  disabled: boolean;
  autoFocus: boolean;
  thread: Thread;
  messagesEndRef?: React.RefObject<HTMLDivElement>;
}

export function ComposerTextarea({
  value,
  onChange,
  onKeyDown,
  disabled,
  autoFocus,
  thread,
  messagesEndRef,
}: ComposerTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea when value changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  // Scroll to messages end when value changes (but not on every keystroke)
  useEffect(() => {
    if (messagesEndRef?.current && value.length > 0) {
      // Use a small delay to avoid excessive scrolling
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [value, messagesEndRef]);

  // Focus textarea on mount if autoFocus is true and not disabled
  useEffect(() => {
    if (autoFocus && !disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus, disabled]);

  return (
    <Textarea
      ref={textareaRef}
      placeholder={
        isAIThread(thread)
          ? "What can Prickly AI help you with?"
          : "Type your message..."
      }
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      data-testid="thread-message-composer"
      disabled={disabled}
      className="w-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none px-4 pt-4 shadow-none bg-background"
      rows={3}
      autoFocus={autoFocus && !disabled}
    />
  );
}
