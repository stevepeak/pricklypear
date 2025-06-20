import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { format } from "https://deno.land/std@0.168.0/datetime/mod.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { getSupabaseServiceClient } from "../utils/supabase.ts";
import { handleError } from "../utils/handle-error.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
};

function createErrorResponse(message: string, status: number) {
  return new Response(message, {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/calendar; charset=utf-8",
    },
  });
}

// Zod schemas for parameter validation
const dateSchema = z
  .string()
  .regex(/^\d{2}-\d{2}-\d{4}$/, {
    message: "Date must be in MM-DD-YYYY format",
  })
  .optional()
  .transform((date) => {
    if (!date) {
      return null;
    }
    const [month, day, year] = date.split("-").map(Number);
    // JavaScript Date constructor uses 0-based months (0-11), so we subtract 1 from the input month
    const parsedDate = new Date(year, month - 1, day);
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Invalid date");
    }
    return parsedDate;
  });

const calendarParamsSchema = z
  .object({
    id: z.string().min(1, "ID is required"),
    expires: z.enum(["never"]).or(dateSchema),
    start: dateSchema,
    end: dateSchema,
  })
  .refine(
    (data) => {
      // Ensure end date is after start date if both are provided
      if (data.start && data.end) {
        return data.end > data.start;
      }
      return true;
    },
    {
      message: "End date must be after start date",
    },
  );

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

function generateICS(events: CalendarEvent[], subscriptionName: string) {
  const icsEvents = events
    .map((event) => {
      const start = new Date(event.start_time);
      const end = new Date(event.end_time);

      return [
        "BEGIN:VEVENT",
        `DTSTART:${format(start, "yyyyMMddTHHmmss")}`,
        `DTEND:${format(end, "yyyyMMddTHHmmss")}`,
        `SUMMARY:${event.title}`,
        event.description ? `DESCRIPTION:${event.description}` : "",
        event.location ? `LOCATION:${event.location}` : "",
        "END:VEVENT",
      ]
        .filter(Boolean)
        .join("\r\n");
    })
    .join("\r\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Your App//Calendar Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${subscriptionName}`,
    icsEvents,
    "END:VCALENDAR",
  ].join("\r\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

    // Parse and validate parameters using Zod
    const params = calendarParamsSchema.parse({
      id: url.searchParams.get("id"),
      expires: url.searchParams.get("expires"),
      start: url.searchParams.get("start"),
      end: url.searchParams.get("end"),
    });

    // Check if subscription has expired
    if (params.expires && new Date(params.expires) < new Date()) {
      return createErrorResponse("Subscription expired", 403);
    }

    const supabaseClient = getSupabaseServiceClient();

    // Get events using RPC call
    const { data: events, error: eventsError } = await supabaseClient.rpc(
      "get_events_for_subscription",
      {
        subscriptionid: params.id,
      },
    );

    if (eventsError) {
      return createErrorResponse("Failed to fetch events", 500);
    }

    const icsContent = generateICS(events, "Prickly Pear");

    return new Response(icsContent, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename=${"Prickly Pear".toLowerCase().replace(/\s+/g, "-")}.ics`,
      },
    });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return createErrorResponse("Invalid parameters", 400);
    }

    handleError(error);

    return createErrorResponse(error.message ?? "Unknown error", 500);
  }
});
