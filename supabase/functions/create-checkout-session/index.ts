import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getSupabaseServiceClient } from '../utils/supabase.ts';
import { z } from 'https://deno.land/x/zod@v3.24.2/mod.ts';
import { getErrorMessage, handleError } from '../utils/handle-error.ts';
import Stripe from 'https://esm.sh/stripe@18.2.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const createCheckoutSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  successUrl: z.string().url('Invalid success URL'),
  cancelUrl: z.string().url('Invalid cancel URL'),
});

export async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, successUrl, cancelUrl } = await req.json();
    const result = createCheckoutSchema.safeParse({
      userId,
      successUrl,
      cancelUrl,
    });

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error.errors[0].message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = getSupabaseServiceClient();

    // Get user profile by stripe JSON customer_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'User profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-12-18.acacia',
    });

    // Create or get Stripe customer
    let customerId = profile.stripe?.customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email || undefined,
        name: profile.name,
        metadata: {
          user_id: userId,
        },
      });
      customerId = customer.id;

      // Update profile with Stripe customer ID in the stripe JSON column
      await supabase
        .from('profiles')
        .update({
          stripe: { ...(profile.stripe || {}), customer_id: customerId },
        })
        .eq('id', userId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1OqXqFnHhZyT9zK', // You'll need to create this price in Stripe
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        user_id: userId,
      },
    });

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    handleError(error);
    return new Response(JSON.stringify({ error: getErrorMessage(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

serve(handler);
