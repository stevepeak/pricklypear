import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getSupabaseServiceClient } from '../utils/supabase.ts';
import { getErrorMessage, handleError } from '../utils/handle-error.ts';
import Stripe from 'https://esm.sh/stripe@18.2.1';
import { env } from '../utils/env.ts';
import { sendSlackNotification } from '../utils/send-slack-notification.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface StripeSubscription {
  customer: string;
  status: string;
  id: string;
  items: {
    data: Array<{
      price?: {
        product?: string;
      };
    }>;
  };
}

async function handleCustomerSubscriptionCreated(
  subscription: StripeSubscription
) {
  const supabase = getSupabaseServiceClient();
  const customerId = subscription.customer;
  const status = subscription.status;
  const productId = subscription.items.data[0]?.price?.product;

  // Find user by Stripe customer ID
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('stripe->>customer_id', customerId)
    .single();

  if (profileError || !profile) {
    throw profileError;
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      plan: productId,
      stripe: {
        customer_id: customerId,
        subscription_id: subscription.id,
        subscription_status: status,
      },
    })
    .eq('id', profile.id);

  if (updateError) {
    throw updateError;
  }

  // --- Slack notification ---
  const message = `Subscription *created*
  Customer: ${profile.id} (Stripe: ${customerId})
  Email: ${profile.email ?? 'unknown'}
  Subscription: ${subscription.id}
  Plan: ${productId ?? 'unknown'}
  Status: ${status}
  At: ${new Date().toISOString()}`;
  await sendSlackNotification({ text: message });
}

async function handleCustomerSubscriptionUpdated(
  subscription: StripeSubscription,
  previousStatus?: string
) {
  const supabase = getSupabaseServiceClient();
  const customerId = subscription.customer;
  const status = subscription.status;
  const productId = subscription.items.data[0]?.price?.product;

  // Find user by Stripe customer ID
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('stripe->>customer_id', customerId)
    .single();

  if (profileError || !profile) {
    throw profileError;
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      plan: productId,
      stripe: {
        ...profile.stripe,
        subscription_status: status,
      },
    })
    .eq('id', profile.id);

  if (updateError) {
    throw updateError;
  }

  // --- Slack notification ---
  const message = `Subscription *updated*
  Customer: ${profile.id} (Stripe: ${customerId})
  Email: ${profile.email ?? 'unknown'}
  Subscription: ${subscription.id}
  Plan: ${productId ?? 'unknown'}
  Status: ${previousStatus ?? 'unknown'} -> ${status}
  At: ${new Date().toISOString()}`;
  await sendSlackNotification({ text: message });
}

async function handleCustomerSubscriptionDeleted(
  subscription: StripeSubscription
) {
  const supabase = getSupabaseServiceClient();
  const customerId = subscription.customer;

  // Find user by Stripe customer ID
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('stripe->>customer_id', customerId)
    .single();

  if (profileError || !profile) {
    throw profileError;
  }

  // Remove plan when subscription is cancelled
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      plan: null,
      stripe: {
        ...profile.stripe,
        subscription_status: 'canceled',
      },
    })
    .eq('id', profile.id);

  if (updateError) {
    throw updateError;
  }

  // --- Slack notification ---
  const message = `Subscription *deleted*
  Customer: ${profile.id} (Stripe: ${customerId})
  Email: ${profile.email ?? 'unknown'}
  Subscription: ${subscription.id}
  Status: canceled
  At: ${new Date().toISOString()}`;
  await sendSlackNotification({ text: message });
}

export async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response(JSON.stringify({ error: 'No signature found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify webhook signature
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
    });

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      const error = new Error(
        `Webhook signature verification failed: ${getErrorMessage(err)}`
      );
      handleError(error);
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
        await handleCustomerSubscriptionCreated(
          event.data.object as StripeSubscription
        );
        break;
      case 'customer.subscription.updated': {
        // Stripe sends any changed fields inside `previous_attributes`.
        // We only care about `status`; safely extract it with a typed cast.
        const previousStatus = (
          event.data.previous_attributes as { status?: string } | undefined
        )?.status;
        await handleCustomerSubscriptionUpdated(
          event.data.object as StripeSubscription,
          previousStatus
        );
        break;
      }
      case 'customer.subscription.deleted':
        await handleCustomerSubscriptionDeleted(
          event.data.object as StripeSubscription
        );
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    handleError(error);
    return new Response(JSON.stringify({ error: getErrorMessage(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

serve(handler);
