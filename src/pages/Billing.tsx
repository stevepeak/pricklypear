import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BadgePlus,
  BatteryFull,
  Crown,
  HeartHandshake,
  MessageCircle,
  TriangleAlert,
  UsersRound,
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useUserPlan } from "@/hooks/useUserPlan";
import { toast } from "sonner";

export default function Billing() {
  const [searchParams] = useSearchParams();
  const { plan, isLoading: planLoading } = useUserPlan();
  const { createCheckoutSession, openCustomerPortal, isLoading } =
    useSubscription();

  // Handle success/cancel messages from URL params
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "true") {
      toast("Subscription successful!", {
        description:
          "Welcome to Prickly Pro! You now have access to all features.",
      });
    } else if (canceled === "true") {
      toast("Subscription canceled", {
        description:
          "Your subscription was not completed. You can try again anytime.",
      });
    }
  }, [searchParams]);

  const handleUpgrade = () => {
    createCheckoutSession();
  };

  const handleManageSubscription = () => {
    openCustomerPortal();
  };

  if (planLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">
          Loading subscription information...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Choose Your Plan</h1>
          <p className="text-muted-foreground">
            Select the plan that best fits your needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Cacti Family Plan */}
          <Card className={`relative `}>
            {!plan && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-accent">
                Current Plan
              </Badge>
            )}
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <HeartHandshake className="h-8 w-8 text-red-700" />
              </div>
              <CardTitle className="text-xl">Cacti Family</CardTitle>
              <div className="text-3xl font-bold">Free</div>
              <p className="text-sm text-muted-foreground">
                Join conversation of another Prickly Pro members.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  <span>Join conversations of others</span>
                </li>
                <li className="flex items-center gap-2">
                  <UsersRound className="h-4 w-4 text-green-500" />
                  <span>Great for friends, family, kids, and new partners</span>
                </li>
                <li className="flex items-center gap-2">
                  <TriangleAlert className="h-4 w-4 text-red-500" />
                  <span>Cannot create threads, events, or files</span>
                </li>
              </ul>
              {!plan ? (
                <Button disabled className="w-full" variant="ghost">
                  Current Plan
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleManageSubscription}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Downgrade to Cacti Family"}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Prickly Pro Plan */}
          <Card className="relative">
            {plan && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                Current Plan
              </Badge>
            )}
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <Crown className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-xl">Prickly Pro</CardTitle>
              <div className="text-3xl font-bold">
                $15<span className="text-lg font-normal">/month</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Full access to all features
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <BadgePlus className="h-4 w-4 text-green-500" />
                  <span>Create AI-powered threads, events, and files</span>
                </li>
                <li className="flex items-center gap-2">
                  <BatteryFull className="h-4 w-4 text-green-500" />
                  <span>Unlimited usage</span>
                </li>
                <li className="flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4 text-green-500" />
                  <span>
                    Invite Cacti Family members to join your threads, free
                  </span>
                </li>
              </ul>
              {plan ? (
                <Button
                  variant="success"
                  className="w-full"
                  onClick={handleManageSubscription}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Manage Subscription"}
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  variant="success"
                >
                  {isLoading ? "Loading..." : "Upgrade to Prickly Pro"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            All plans include secure, encrypted messaging and data protection.
          </p>
          <p>
            You can upgrade, downgrade, or cancel your subscription at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
