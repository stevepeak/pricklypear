/// <reference lib="deno.ns" />
import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';

// Import the function we want to test
// Note: We need to extract the generateICS function to make it testable
function generateICS(events: CalendarEvent[], subscriptionName: string) {
  const icsEvents = events
    .map((event) => {
      const start = new Date(event.start_time);
      const end = new Date(event.end_time);

      return [
        'BEGIN:VEVENT',
        `DTSTART:${format(start, 'yyyyMMddTHHmmss')}`,
        `DTEND:${format(end, 'yyyyMMddTHHmmss')}`,
        `SUMMARY:${event.title}`,
        event.description ? `DESCRIPTION:${event.description}` : '',
        event.location ? `LOCATION:${event.location}` : '',
        'END:VEVENT',
      ]
        .filter(Boolean)
        .join('\r\n');
    })
    .join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Your App//Calendar Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${subscriptionName}`,
    icsEvents,
    'END:VCALENDAR',
  ].join('\r\n');
}

// Define calendar event type
type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  created_by: string;
  thread_id: string | null;
  created_at: string;
  updated_at: string;
};

// Import format function
import { format } from 'https://deno.land/std@0.168.0/datetime/mod.ts';

Deno.test(
  'generateICS should create valid ICS content for a single event',
  () => {
    const testEvent: CalendarEvent = {
      id: '1',
      title: 'Test Meeting',
      description: 'A test meeting description',
      start_time: '2024-01-15T10:00:00Z',
      end_time: '2024-01-15T11:00:00Z',
      location: 'Conference Room A',
      created_by: 'user123',
      thread_id: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const result = generateICS([testEvent], 'Test Calendar');

    // Check that the result contains expected ICS structure
    assertEquals(result.includes('BEGIN:VCALENDAR'), true);
    assertEquals(result.includes('VERSION:2.0'), true);
    assertEquals(result.includes('BEGIN:VEVENT'), true);
    assertEquals(result.includes('SUMMARY:Test Meeting'), true);
    assertEquals(
      result.includes('DESCRIPTION:A test meeting description'),
      true
    );
    assertEquals(result.includes('LOCATION:Conference Room A'), true);
    assertEquals(result.includes('END:VEVENT'), true);
    assertEquals(result.includes('END:VCALENDAR'), true);
    assertEquals(result.includes('X-WR-CALNAME:Test Calendar'), true);
  }
);
