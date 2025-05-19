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
            Connect your account to an external MCP server to enable chat
            integrations. This will allow you to sync messages and threads with
            your MCP chat server.
          </p>
          <Button disabled variant="outline">
            Connect MCP Server
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
