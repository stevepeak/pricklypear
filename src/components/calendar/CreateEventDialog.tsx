import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { toast } from 'sonner';

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threadId?: string;
}

export function CreateEventDialog({
  open,
  onOpenChange,
  threadId,
}: CreateEventDialogProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createEvent } = useCalendarEvents();

  const handleStartTimeChange = (time: string) => {
    setStartTime(time);
    if (startDate) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDate = new Date(startDate);
      newDate.setHours(hours, minutes);
      setStartDate(newDate);
    }
  };

  const handleEndTimeChange = (time: string) => {
    setEndTime(time);
    if (endDate) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDate = new Date(endDate);
      newDate.setHours(hours, minutes);
      setEndDate(newDate);
    }
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes);
      setStartDate(newDate);
    } else {
      setStartDate(undefined);
    }
    setStartDateOpen(false);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      const [hours, minutes] = endTime.split(':').map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes);
      setEndDate(newDate);
    } else {
      setEndDate(undefined);
    }
    setEndDateOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (!eventName.trim()) {
      toast.error('Please enter an event name');
      return;
    }

    setIsSubmitting(true);
    try {
      await createEvent(
        eventName.trim(),
        description.trim() || null,
        startDate,
        endDate,
        threadId,
        location.trim() || null
      );
      toast.success('Event created successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create calendar event</DialogTitle>
          <DialogDescription>
            Each event proposal will be evaluated by AI to meet acceptance
            criteria, once accepted the other party will be notified to accept
            or reject the event.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Event name</Label>
            <Input
              id="name"
              placeholder="Event name"
              autoComplete="off"
              data-1p-ignore
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Event description"
              className="min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Event location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start date</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    selected={startDate}
                    onDayClick={handleStartDateSelect}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>End date</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    selected={endDate}
                    onDayClick={handleEndDateSelect}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => handleEndTimeChange(e.target.value)}
              />
            </div>
          </div>

          {!threadId && (
            <div className="text-sm text-muted-foreground mb-4">
              You can also propose calendar events directly from a thread.
            </div>
          )}

          <div className="flex justify-between space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="success" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Propose Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
