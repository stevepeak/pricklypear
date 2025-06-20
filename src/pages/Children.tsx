import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Children() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Children Profiles (Coming Soon)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            Create and manage profiles for your children, including shared
            medical records, schedules, and important documents. This feature
            will help you keep all child-related information organized and
            accessible to authorized co-parents.
          </p>
          <p className="text-muted-foreground">
            You'll be able to track parenting time, custody arrangements, and
            securely share documents with other authorized caregivers. Stay
            tuned for updates as we work on making this feature available!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
