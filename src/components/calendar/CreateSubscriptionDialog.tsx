import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useCalendarSubscriptions } from '@/hooks/useCalendarSubscriptions';
import { toast } from 'sonner';
import { SubscriptionSuccessDialog } from './SubscriptionSuccessDialog';

interface CreateSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DatePicker({
  date,
  onSelect,
  label,
  open,
  onOpenChange,
}: {
  date?: Date;
  onSelect: (date?: Date) => void;
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'PPP') : `Select ${label.toLowerCase()}`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function CreateSubscriptionDialog({
  open,
  onOpenChange,
}: CreateSubscriptionDialogProps) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [expiresDate, setExpiresDate] = useState<Date>();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [expiresDateOpen, setExpiresDateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<string>();
  const { createSubscription } = useCalendarSubscriptions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a subscription name');
      return;
    }

    setIsSubmitting(true);
    try {
      const subscription = await createSubscription(
        name.trim(),
        startDate,
        endDate,
        expiresDate
      );
      setSubscriptionId(subscription.id);
      onOpenChange(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to create subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Calendar Subscription</DialogTitle>
            <DialogDescription>
              Create a new calendar subscription URL that others can use to
              subscribe to your calendar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Subscription Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a name for this subscription"
                data-1p-ignore
                autoComplete="off"
              />
            </div>

            <DatePicker
              date={startDate}
              onSelect={setStartDate}
              label="Start Date (Optional)"
              open={startDateOpen}
              onOpenChange={setStartDateOpen}
            />

            <DatePicker
              date={endDate}
              onSelect={setEndDate}
              label="End Date (Optional)"
              open={endDateOpen}
              onOpenChange={setEndDateOpen}
            />

            <DatePicker
              date={expiresDate}
              onSelect={setExpiresDate}
              label="Expiration Date (Optional)"
              open={expiresDateOpen}
              onOpenChange={setExpiresDateOpen}
            />

            <div className="flex justify-between space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="success" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Subscription'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {subscriptionId && (
        <SubscriptionSuccessDialog
          open={showSuccess}
          onOpenChange={setShowSuccess}
          subscriptionId={subscriptionId}
          startDate={startDate}
          endDate={endDate}
          expiresDate={expiresDate}
        />
      )}
    </>
  );
}
