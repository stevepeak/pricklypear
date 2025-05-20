import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Integrations() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>MCP Server Integration (Coming Soon)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            Expose your MCP server to integrate The Prickly Pear with external
            services. This enables seamless communication between your MCP
            server and The Prickly Pear platform, allowing for message
            synchronization and thread management across both systems.
          </p>
          <Button disabled variant="outline">
            Connect MCP Server
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
