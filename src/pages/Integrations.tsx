import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Integrations() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>
            MCP Server{" "}
            <Badge variant="secondary" className="ml-2">
              Coming soon
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            Expose our MCP server to integrate The Prickly Pear with external
            services. This enables seamless communication between your MCP
            server(s) and The Prickly Pear platform, allowing for message
            synchronization and thread management across both systems.
          </p>
          <p className="mb-4 text-muted-foreground">
            The Prickly Pear platform will also provide its own MCP server
            implementation, allowing you to connect your external services
            directly to our platform. This bidirectional integration capability
            ensures that you can maintain your existing workflows while
            leveraging The Prickly Pear's powerful communication and moderation
            features.
          </p>
          <Button disabled variant="outline">
            Connect MCP Server
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
