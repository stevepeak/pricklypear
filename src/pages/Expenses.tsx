import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
        </CardContent>
      </Card>
    </div>
  );
}
