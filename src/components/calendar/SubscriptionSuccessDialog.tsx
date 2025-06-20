import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { format } from "date-fns";

interface SubscriptionSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: string;
  startDate?: Date;
  endDate?: Date;
  expiresDate?: Date;
}

export function SubscriptionSuccessDialog({
  open,
  onOpenChange,
  subscriptionId,
  startDate,
  endDate,
  expiresDate,
}: SubscriptionSuccessDialogProps) {
  const [copied, setCopied] = useState(false);

  const formatDate = (date?: Date) => {
    if (!date) return undefined;
    return format(date, "MM-dd-yyyy");
  };

  const queryParams = new URLSearchParams({
    id: subscriptionId,
    ...(expiresDate
      ? { expires: formatDate(expiresDate) }
      : { expires: "never" }),
    ...(startDate && { start: formatDate(startDate) }),
    ...(endDate && { end: formatDate(endDate) }),
  });

  const subscriptionUrl = `https://vgddrhyjttyrathqhefb.supabase.co/functions/v1/calendar-ics?${queryParams.toString()}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(subscriptionUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subscription Created Successfully</DialogTitle>
          <DialogDescription>
            Share this URL with others to let them subscribe to your calendar.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input value={subscriptionUrl} readOnly className="flex-1" />
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">How to use this URL:</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Google Calendar:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open Google Calendar</li>
                <li>Click the + next to "Other calendars"</li>
                <li>Choose "From URL"</li>
                <li>Paste the subscription URL</li>
                <li>Click "Add calendar"</li>
              </ol>
              <p className="mt-4">
                <strong>Apple Calendar:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open Calendar app</li>
                <li>Go to File &gt; New Calendar Subscription</li>
                <li>Paste the subscription URL</li>
                <li>Click "Subscribe"</li>
              </ol>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
