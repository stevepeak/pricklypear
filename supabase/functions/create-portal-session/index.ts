import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSupabaseServiceClient } from "../utils/supabase.ts";
import { z } from "https://deno.land/x/zod@v3.24.2/mod.ts";
import { getErrorMessage, handleError } from "../utils/handle-error.ts";
import Stripe from "https://esm.sh/stripe@18.2.1";
import { env } from "../utils/env.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const createPortalSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  returnUrl: z.string().url("Invalid return URL"),
});

export async function handler(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, returnUrl } = await req.json();
    const result = createPortalSchema.safeParse({
      userId,
      returnUrl,
    });

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error.errors[0].message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = getSupabaseServiceClient();

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "User profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!profile.stripe?.customer_id) {
      return new Response(
        JSON.stringify({ error: "No Stripe customer found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-05-28.basil",
    });

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe.customer_id,
      return_url: returnUrl,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    handleError(error);
    return new Response(JSON.stringify({ error: getErrorMessage(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

serve(handler);
