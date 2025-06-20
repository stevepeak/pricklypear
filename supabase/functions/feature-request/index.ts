import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { env } from "../utils/env.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LINEAR_API_URL = "https://api.linear.app/graphql";

async function createLinearIssue(
  args: { title: string; description: string },
  fetchFn: typeof fetch = fetch,
) {
  const { title, description } = args;
  if (!env.LINEAR_API_KEY || !env.LINEAR_TEAM_ID) {
    throw new Error("Missing Linear API credentials");
  }
  const query = `mutation CreateIssue($input: IssueCreateInput!) {\n  issueCreate(input: $input) {\n    success\n    issue {\n      id\n      identifier\n      url\n    }\n  }\n}`;
  const variables = {
    input: {
      teamId: env.LINEAR_TEAM_ID,
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
      Authorization: env.LINEAR_API_KEY,
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

async function createLinearComment(
  issueId: string,
  body: string,
  fetchFn: typeof fetch = fetch,
) {
  if (!env.LINEAR_API_KEY) {
    throw new Error("Missing Linear API credentials");
  }
  const query = `mutation CreateComment($input: CommentCreateInput!) {
    commentCreate(input: $input) {
      success
      comment {
        id
      }
    }
  }`;
  const variables = {
    input: {
      issueId,
      body,
    },
  };
  const res = await fetchFn(LINEAR_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: env.LINEAR_API_KEY,
    },
    body: JSON.stringify({ query, variables }),
  });
  const data = await res.json();
  if (!data.data?.commentCreate?.success) {
    throw new Error(
      data.errors?.[0]?.message || "Failed to create Linear comment",
    );
  }
  return data.data.commentCreate.comment;
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

    // Add a comment to the newly created issue
    await createLinearComment(
      issue.id,
      `@Charlie please follow these instructions:
      1. Look for other Linear tickets that may be duplicate to this ticket, if you found any then list them out in your comment.
      2. Apply the label of Bug or Feature Request to the ticket based on the content of the ticket.
      3. Come up with an implementation plan for the ticket.
      `,
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
