import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { requireCurrentUser } from '@/utils/authCache';
import type { Database } from '@/integrations/supabase/types';
import { useGlobalMessages } from '@/contexts/GlobalMessagesContext';

type CalendarEvent = Database['public']['Tables']['calendar_events']['Row'];

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { registerCalendarEventCallback } = useGlobalMessages();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .order('start_time', { ascending: true });

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching calendar events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();

    // Register callback for real-time updates
    const unsubscribe = registerCalendarEventCallback((event) => {
      setEvents((prev) => {
        const existingIndex = prev.findIndex((e) => e.id === event.id);
        if (existingIndex === -1) {
          return [...prev, event];
        }
        return prev.map((e) => (e.id === event.id ? event : e));
      });
    });

    return () => {
      unsubscribe();
    };
  }, [registerCalendarEventCallback]);

  const createEvent = async (
    title: string,
    description: string | null,
    startTime: Date,
    endTime: Date,
    threadId?: string,
    location?: string | null
  ) => {
    const user = await requireCurrentUser();

    // TODO create a trigger to add participation for acting user, auto accept it
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        title,
        description,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        created_by: user.id,
        thread_id: threadId || null,
        location: location || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateParticipantStatus = async (
    eventId: string,
    status: Database['public']['Enums']['participant_status']
  ) => {
    const user = await requireCurrentUser();

    const { data, error } = await supabase
      .from('calendar_event_participants')
      .upsert({
        event_id: eventId,
        user_id: user.id,
        status,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  return {
    events,
    isLoading,
    createEvent,
    updateParticipantStatus,
  };
}
