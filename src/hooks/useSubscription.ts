import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { requireCurrentUser } from '@/utils/authCache';
import { toast } from 'sonner';
import { isWeb } from '@/utils/platform';

export function useSubscription() {
  const [isLoading, setIsLoading] = useState(false);

  const createCheckoutSession = async () => {
    setIsLoading(true);
    try {
      const user = await requireCurrentUser();

      const origin = isWeb() ? window.location.origin : '';
      const successUrl = `${origin}/account?success=true`;
      const cancelUrl = `${origin}/billing?canceled=true`;

      const { data, error } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: {
            userId: user.id,
            successUrl,
            cancelUrl,
          },
        }
      );

      if (error) {
        throw error;
      }

      if (data?.url && isWeb()) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast('Error starting checkout', {
        description:
          'There was a problem starting the checkout process. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    setIsLoading(true);
    try {
      const user = await requireCurrentUser();

      const returnUrl = `${isWeb() ? window.location.origin : ''}/billing`;

      const { data, error } = await supabase.functions.invoke(
        'create-portal-session',
        {
          body: {
            userId: user.id,
            returnUrl,
          },
        }
      );

      if (error) {
        throw error;
      }

      if (data?.url && isWeb()) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast('Error opening billing portal', {
        description:
          'There was a problem opening the billing portal. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCheckoutSession,
    openCustomerPortal,
    isLoading,
  };
}
