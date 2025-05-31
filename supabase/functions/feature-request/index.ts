import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LINEAR_API_URL = "https://api.linear.app/graphql";
const LINEAR_API_KEY = Deno.env.get("LINEAR_API_KEY");
const LINEAR_TEAM_ID = Deno.env.get("LINEAR_TEAM_ID");

async function createLinearIssue(
  args: { title: string; description: string },
  fetchFn: typeof fetch = fetch,
) {
  const { title, description } = args;
  if (!LINEAR_API_KEY || !LINEAR_TEAM_ID) {
    throw new Error("Missing Linear API credentials");
  }
  const query = `mutation CreateIssue($input: IssueCreateInput!) {\n  issueCreate(input: $input) {\n    success\n    issue {\n      id\n      identifier\n      url\n    }\n  }\n}`;
  const variables = {
    input: {
      teamId: LINEAR_TEAM_ID,
      title,
      description,
      priority: 1, // for Urgent
      projectId: "0bf5d056-5ee8-4198-a310-eba0786efe55", // Feature Requests
    },
  };
  const res = await fetchFn(LINEAR_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: LINEAR_API_KEY,
    },
    body: JSON.stringify({ query, variables }),
  });
  const data = await res.json();
  if (!data.data?.issueCreate?.success) {
    throw new Error(
      data.errors?.[0]?.message || "Failed to create Linear issue",
    );
  }
  return data.data.issueCreate.issue;
}

export type HandlerDeps = { fetch?: typeof fetch };

export async function handler(req: Request, deps: HandlerDeps = {}) {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { title, description } = await req.json();
    if (!title || !description) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Title and description are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    const issue = await createLinearIssue(
      { title, description },
      deps.fetch ?? fetch,
    );
    return new Response(JSON.stringify({ success: true, issue }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("feature-request error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Unexpected error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

// @ts-expect-error TS2345
serve(handler);
