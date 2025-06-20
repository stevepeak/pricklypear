import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { requireCurrentUser } from "@/utils/authCache";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type UserPlan = Database["public"]["Enums"]["plans"] | null;

export function useUserPlan() {
  const [plan, setPlan] = useState<UserPlan>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserPlan = async () => {
    try {
      const user = await requireCurrentUser();

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("plan, stripe")
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      // If user has a plan, use it; otherwise default to Cacti Family
      setPlan(data?.plan);
    } catch (err) {
      console.error("Error fetching user plan:", err);
      setError("Failed to load subscription information");
      toast("Error loading subscription", {
        description:
          "There was a problem loading your subscription information.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPlan();
  }, []);

  const refreshPlan = () => {
    setIsLoading(true);
    setError(null);
    fetchUserPlan();
  };

  return {
    plan,
    isLoading,
    error,
    refreshPlan,
  };
}
