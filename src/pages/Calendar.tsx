import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Calendar() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Calendar (Coming Soon)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            Manage your parenting schedule, important dates, and events here.
            Calendar integration will help you stay organized and ensure
            everyone is on the same page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
