import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PricingSection } from '@/components/PricingSection';
import { useSubscription } from '@/hooks/useSubscription';
import { useUserPlan } from '@/hooks/useUserPlan';
import { toast } from 'sonner';

export default function Billing() {
  const [searchParams] = useSearchParams();
  const { plan, isLoading: planLoading } = useUserPlan();
  const { createCheckoutSession, openCustomerPortal, isLoading } =
    useSubscription();

  // Handle success/cancel messages from URL params
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      toast('Subscription successful!', {
        description:
          'Welcome to Prickly Pro! You now have access to all features.',
      });
    } else if (canceled === 'true') {
      toast('Subscription canceled', {
        description:
          'Your subscription was not completed. You can try again anytime.',
      });
    }
  }, [searchParams]);

  const handleUpgrade = () => {
    createCheckoutSession();
  };

  const handleManageSubscription = () => {
    openCustomerPortal();
  };

  if (planLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">
          Loading subscription information...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <PricingSection
        variant="billing"
        currentPlan={plan}
        isLoading={isLoading}
        onUpgrade={handleUpgrade}
        onManageSubscription={handleManageSubscription}
        onDowngrade={handleManageSubscription}
      />
    </div>
  );
}
