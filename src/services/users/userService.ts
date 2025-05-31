import { supabase } from "@/integrations/supabase/client";
import { requireCurrentUser } from "@/utils/authCache";

export {
  getConnections,
  updateConnectionStatus,
  disableConnection,
  type ConnectionStatus,
  type Connection,
  type InviteResponse,
} from "../connections/index.js";

/**
 * Search profiles by (case-insensitive) name while excluding the current user.
 *
 * @param {string} query  Partial name / email to search for
 * @returns List of matching profile id + username tuples
 */
