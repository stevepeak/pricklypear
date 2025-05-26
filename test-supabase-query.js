// Test Supabase database queries
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vgddrhyjttyrathqhefb.supabase.co";
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function testSupabaseQuery() {
  try {
    const { data, error } = await supabase
      .from("connections")
      .select(
        `*,
      connected_profile:connected_user_id ( name ),
        user_profile:user_id ( name )
    `,
      )


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
