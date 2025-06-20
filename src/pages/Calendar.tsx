import { useState, useMemo } from 'react';
import { Search, Plus, Calendar as CalendarIcon, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  SearchBar,
  SearchBarLeft,
  SearchBarRight,
} from '@/components/ui/search-bar';
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  EventProps,
} from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { CreateEventDialog } from '@/components/calendar/CreateEventDialog';
import { CreateSubscriptionDialog } from '@/components/calendar/CreateSubscriptionDialog';
import { SubscriptionView } from '@/components/calendar/SubscriptionView';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { Toggle } from '@/components/ui/toggle';
import type { Database } from '@/integrations/supabase/types';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    'en-US': enUS,
  },
});

type CalendarEvent = Database['public']['Tables']['calendar_events']['Row'];
type CalendarEventWithDates = CalendarEvent & {
  start: Date;
  end: Date;
};

const CustomEvent = ({ event }: EventProps<CalendarEventWithDates>) => {
  // TODO all day events
  const isAllDay = false; // isSameDay(event.start, event.end);
  const timeDisplay = isAllDay ? '' : format(event.start, 'h:mm a');

  return (
    <div className="flex justify-between items-center w-full">
      <span className="truncate">{event.title}</span>
      {!isAllDay && <span className="text-xs ml-2">{timeDisplay}</span>}
    </div>
  );
};

export default function Calendar() {
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [view, setView] = useState<'calendar' | 'subscriptions'>('calendar');
  const { events } = useCalendarEvents();

  const handleEventSelect = (event: CalendarEventWithDates) => {
    if (process.env.NODE_ENV !== 'production') {
      // Useful during development; stripped out in prod builds.
      console.log('Selected event:', event);
    }
    // TODO: Open event details dialog
  };

  const filteredEvents = useMemo(
    () =>
      events
        .filter((event) =>
          event.title.toLowerCase().includes(search.toLowerCase())
        )
        .map((event) => ({
          ...event,
          start: new Date(event.start_time),
          end: new Date(event.end_time),
        })),
    [events, search]
  );

  return (
    <>
      <SearchBar>
        <SearchBarLeft>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            className="pl-9 pr-3 h-9 border-none shadow-none focus-visible:ring-0"
            placeholder="Search events"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
            aria-label="Search events"
          />
        </SearchBarLeft>
        <SearchBarRight>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={view === 'subscriptions'}
                  size="sm"
                  onPressedChange={(pressed) =>
                    setView(pressed ? 'subscriptions' : 'calendar')
                  }
                  aria-label="Toggle view"
                >
                  {view === 'subscriptions' ? (
                    <CalendarIcon className="h-4 w-4" />
                  ) : (
                    <Link className="h-4 w-4" />
                  )}
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                {view === 'subscriptions'
                  ? 'Switch to Calendar'
                  : 'Switch to Manage Subscriptions'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            {view === 'subscriptions' ? (
              <>
                <Plus className="h-4 w-4 " />
                New Subscription
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 " />
                New Event
              </>
            )}
          </Button>
        </SearchBarRight>
      </SearchBar>
      {view === 'calendar' ? (
        <div className="p-4 h-[calc(100vh-120px)]">
          <BigCalendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            className="h-full"
            onSelectEvent={handleEventSelect}
            components={{
              event: CustomEvent,
            }}
            messages={{
              today: 'Today',
              previous: '←',
              next: '→',
              month: 'Month',
              week: 'Week',
              day: 'Day',
              agenda: 'Agenda',
              date: 'Date',
              time: 'Time',
              event: 'Event',
              noEventsInRange: 'No events in this range',
              showMore: (total) => `+${total} more`,
            }}
            eventPropGetter={() => ({
              className:
                'bg-green-600/80 text-white rounded px-1 border-0',
            })}
          />
        </div>
      ) : (
        <SubscriptionView />
      )}
      {view === 'calendar' ? (
        <CreateEventDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      ) : (
        <CreateSubscriptionDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      )}
    </>
  );
}
