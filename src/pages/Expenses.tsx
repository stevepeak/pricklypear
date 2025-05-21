import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Expenses() {

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Expenses (Coming Soon)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            Track shared expenses, reimbursements, and financial records here.
            Expense management features will help ensure transparency and
            accountability.
          </p>
          <Button
            onClick={() =>
              toast("Expenses Feature Coming Soon!", {
                description: "Stay tuned for updates on expense management."
              })
            }
          >
            Show Toast
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
