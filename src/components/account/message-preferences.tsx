import React from "react";
import { MessageSquareText } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { requireCurrentUser } from "@/utils/authCache";
import { useToast } from "@/hooks/use-toast";

interface MessagePreferencesProps {
  messageTone: string;
  onMessageToneChange: (value: string) => void;
}

export function MessagePreferences({
  messageTone,
  onMessageToneChange,
}: MessagePreferencesProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <MessageSquareText className="h-5 w-5" />
          <h3 className="text-lg font-medium">Message Tone</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose how you want your messages to be rephrased when they're
          reviewed.
        </p>
        <Select value={messageTone} onValueChange={onMessageToneChange}>
          <SelectTrigger className="w-full normal-case">
            <SelectValue placeholder="Select a tone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="friendly" className="normal-case">
              Friendly
            </SelectItem>
            <SelectItem value="professional" className="normal-case">
              Professional
            </SelectItem>
            <SelectItem value="casual" className="normal-case">
              Casual
            </SelectItem>
            <SelectItem value="formal" className="normal-case">
              Formal
            </SelectItem>
            <SelectItem value="encouraging" className="normal-case">
              Encouraging
            </SelectItem>
          </SelectContent>
        </Select>
        <div className="mt-2 p-3 bg-muted rounded-md text-sm">
          <p className="italic">
            {messageTone === "friendly" &&
              "Messages will be rephrased to sound warm and approachable."}
            {messageTone === "professional" &&
              "Messages will be rephrased to sound polished and business-like."}
            {messageTone === "casual" &&
              "Messages will be rephrased to sound relaxed and conversational."}
            {messageTone === "formal" &&
              "Messages will be rephrased to sound structured and precise."}
            {messageTone === "encouraging" &&
              "Messages will be rephrased to sound positive and supportive."}
          </p>
        </div>
      </div>
    </div>
  );
}

export async function handleMessageToneChange({
  value,
  setMessageTone,
  toast,
}: {
  value: string;
  setMessageTone: (v: string) => void;
  toast: ReturnType<typeof useToast>["toast"];
}) {
  const user = await requireCurrentUser();
  setMessageTone(value);
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ message_tone: value })
      .eq("id", user.id);
    if (error) throw error;
    toast({
      title: "Message tone updated",
      description: `Your messages will now be rephrased with a ${value} tone.`,
    });
  } catch (error) {
    console.error("Error updating message tone:", error);
    toast({
      title: "Update failed",
      description: "There was a problem updating your message tone preference.",
    });
  }
}
