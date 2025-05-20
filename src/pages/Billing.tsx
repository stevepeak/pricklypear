import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Billing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Free for a limited time!</CardTitle>
        </CardHeader>
        <CardContent>
          Prickly Pear is currently <span className="font-semibold">free</span>{" "}
          for all users while we are in early access. Billing and paid plans
          will be announced soon. Enjoy all features at no cost for now!
        </CardContent>
      </Card>
    </div>
  );
}
