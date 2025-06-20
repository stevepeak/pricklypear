import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Link } from "lucide-react";
import { useCalendarSubscriptions } from "@/hooks/useCalendarSubscriptions";
import { toast } from "sonner";
import { useState } from "react";
import { SubscriptionSuccessDialog } from "./SubscriptionSuccessDialog";

export function SubscriptionView() {
  const { subscriptions, isLoading, deleteSubscription } =
    useCalendarSubscriptions();
  const [selectedSubscription, setSelectedSubscription] = useState<{
    id: string;
    startDate?: Date;
    endDate?: Date;
    expiresDate?: Date;
  } | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteSubscription(id);
      toast.success("Subscription deleted successfully");
    } catch (error) {
      console.error("Error deleting subscription:", error);
      toast.error("Failed to delete subscription");
    }
  };

  const handleShowSubscriptionLink = (subscription: {
    id: string;
    start_time?: string;
    end_time?: string;
    expires_at?: string;
  }) => {
    setSelectedSubscription({
      id: subscription.id,
      startDate: subscription.start_time
        ? new Date(subscription.start_time)
        : undefined,
      endDate: subscription.end_time
        ? new Date(subscription.end_time)
        : undefined,
      expiresDate: subscription.expires_at
        ? new Date(subscription.expires_at)
        : undefined,
    });
  };

  if (isLoading) {
    return <div>Loading subscriptions...</div>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Last Accessed</TableHead>
            <TableHead>Time Range</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription) => (
            <TableRow key={subscription.id}>
              <TableCell>{subscription.name}</TableCell>
              <TableCell>
                {format(new Date(subscription.created_at), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                {subscription.expires_at
                  ? format(new Date(subscription.expires_at), "MMM d, yyyy")
                  : "Never"}
              </TableCell>
              <TableCell>
                {subscription.last_accessed_at
                  ? format(
                      new Date(subscription.last_accessed_at),
                      "MMM d, yyyy",
                    )
                  : "Never"}
              </TableCell>
              <TableCell>
                {subscription.start_time && subscription.end_time
                  ? `${format(new Date(subscription.start_time), "MMM d, yyyy")} - ${format(
                      new Date(subscription.end_time),
                      "MMM d, yyyy",
                    )}`
                  : "All time"}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShowSubscriptionLink(subscription)}
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(subscription.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedSubscription && (
        <SubscriptionSuccessDialog
          open={!!selectedSubscription}
          onOpenChange={(open) => !open && setSelectedSubscription(null)}
          subscriptionId={selectedSubscription.id}
          startDate={selectedSubscription.startDate}
          endDate={selectedSubscription.endDate}
          expiresDate={selectedSubscription.expiresDate}
        />
      )}
    </>
  );
}
