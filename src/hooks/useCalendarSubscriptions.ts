import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { requireCurrentUser } from '@/utils/authCache';
import type { Database } from '@/integrations/supabase/types';

type CalendarSubscription =
  Database['public']['Tables']['calendar_subscriptions']['Row'];

export function useCalendarSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<CalendarSubscription[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const user = await requireCurrentUser();
        const { data, error } = await supabase
          .from('calendar_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSubscriptions(data || []);
      } catch (error) {
        console.error('Error fetching calendar subscriptions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const createSubscription = async (
    name: string,
    startTime?: Date,
    endTime?: Date,
    expiresAt?: Date
  ) => {
    const user = await requireCurrentUser();
    const { data, error } = await supabase
      .from('calendar_subscriptions')
      .insert({
        name,
        user_id: user.id,
        start_time: startTime?.toISOString() || null,
        end_time: endTime?.toISOString() || null,
        expires_at: expiresAt?.toISOString() || null,
      })
      .select()
      .single();

    if (error) throw error;
    setSubscriptions((prev) => [data, ...prev]);
    return data;
  };

  const deleteSubscription = async (id: string) => {
    const { error } = await supabase
      .from('calendar_subscriptions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
  };

  return {
    subscriptions,
    isLoading,
    createSubscription,
    deleteSubscription,
  };
}
