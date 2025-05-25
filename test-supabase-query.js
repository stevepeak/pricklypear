// Test Supabase database queries
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vgddrhyjttyrathqhefb.supabase.co";
const SUPABASE_SERVICE_ROLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnZGRyaHlqdHR5cmF0aHFoZWZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjA0Njg1MiwiZXhwIjoyMDYxNjIyODUyfQ.3PkjOQBX_zWYIi_hqQieN9GJQIg4jvCNQS2pCS71bfE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function testSupabaseQuery() {
  try {
    const { data, error } = await supabase
      .from("threads")
      .select(
        `
      thread_participants (
        profiles (
          id,
          name,
          notifications
        )
      )
    `,
      )
      .eq("id", "1ec9ac5a-dce5-4df7-828d-c5730962a975");

    if (error) {
      console.error("Error querying Supabase:", error);
      process.exit(1);
    }

    console.log("Profiles:", data);
    process.exit(0);
  } catch (err) {
    console.error("Unexpected error:", err);
    process.exit(1);
  }
}

testSupabaseQuery();
