import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getSupabaseServiceClient } from '../utils/supabase.ts';
import { getErrorMessage, handleError } from '../utils/handle-error.ts';
import Stripe from 'https://esm.sh/stripe@18.2.1';
import { env } from '../utils/env.ts';

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
    .eq('stripe_customer_id', customerId)
    .single();

  if (profileError || !profile) {
    console.error('Profile not found for customer:', customerId);
    return;
  }

  // Update user plan based on product ID
  let plan: string | null = null;
  if (productId === 'prod_SWrqFnHhZyT9zK') {
    plan = 'Prickly Pro (prod_SWrqFnHhZyT9zK)';
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      plan,
      stripe: {
        customer_id: customerId,
        subscription_id: subscription.id,
        subscription_status: status,
        product_id: productId,
      },
    })
    .eq('id', profile.id);

  if (updateError) {
    console.error('Error updating profile:', updateError);
  }
}

async function handleCustomerSubscriptionUpdated(
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
    .eq('stripe.customer_id', customerId)
    .single();

  if (profileError || !profile) {
    console.error('Profile not found for customer:', customerId);
    return;
  }

  // Update user plan based on product ID and status
  let plan: string | null = null;
  if (productId === 'prod_SWrqFnHhZyT9zK' && status === 'active') {
    plan = 'Prickly Pro (prod_SWrqFnHhZyT9zK)';
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      plan,
      stripe: {
        ...profile.stripe,
        subscription_status: status,
        product_id: productId,
      },
    })
    .eq('id', profile.id);

  if (updateError) {
    console.error('Error updating profile:', updateError);
  }
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
    .eq('stripe.customer_id', customerId)
    .single();

  if (profileError || !profile) {
    console.error('Profile not found for customer:', customerId);
    return;
  }

  // Remove plan when subscription is cancelled
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      plan: null,
      stripe: {
        ...profile.stripe,
        subscription_status: 'canceled',
        product_id: null,
      },
    })
    .eq('id', profile.id);

  if (updateError) {
    console.error('Error updating profile:', updateError);
  }
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

    // Verify webhook signature (you'll need to add STRIPE_WEBHOOK_SECRET to your environment)
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    });

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
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
      case 'customer.subscription.updated':
        await handleCustomerSubscriptionUpdated(
          event.data.object as StripeSubscription
        );
        break;
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
