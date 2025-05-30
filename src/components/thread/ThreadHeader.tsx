import { Bot, Loader2, Lock, Users, BotMessageSquare, Headset } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getThreadTopicInfo, type Thread, isAIThread } from "@/types/thread";
import { AvatarName } from "@/components/ui/avatar-name";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface ThreadHeaderProps {
  thread: Thread;
  isGeneratingSummary: boolean;
}

const ThreadHeader = ({ thread, isGeneratingSummary }: ThreadHeaderProps) => {
  const { label, icon } = getThreadTopicInfo(thread.topic);
  const topicLabel = `${icon} ${label}`;

  return (
    <div className="sticky top-12 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/90 p-6">
      {/* Mobile summary ghost icon trigger */}
      <div className="md:hidden absolute right-6 top-6 z-10">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Show summary">
              <BotMessageSquare className="size-6 text-muted-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>AI Summary</SheetTitle>
              <SheetDescription>
                {isGeneratingSummary ? (
                  <span className="flex items-center gap-2 text-xs">
                    <Loader2 className="h-3 w-3 animate-spin" /> Generating
                    summary...
                  </span>
                ) : (
                  <span className="text-sm">{thread.summary ?? ""}</span>
                )}
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
        {/* Left Side */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            {thread.status === "Closed" && (
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0.5 font-semibold"
              >
                Closed
              </Badge>
            )}
            {isAIThread(thread) ? (
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-800 border-purple-200"
              >
                <Bot className="h-3 w-3 mr-1" />
                AI Chat
              </Badge>
            ) : thread.type === "customer_support" ? (
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-800 border-blue-200"
              >
                <Headset className="h-3 w-3 mr-1" />
                Customer Support
              </Badge>
            ) : (
              <>
                <Badge variant="outline" className="bg-white">
                  {topicLabel}
                </Badge>
                {(thread.controls?.requireAiApproval ?? true) && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 border-blue-200"
                  >
                    AI-Moderated
                  </Badge>
                )}
              </>
            )}

            <span className="text-sm text-muted-foreground">
              Created {thread.createdAt.toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-2xl font-bold break-words">{thread.title}</h1>
          {!isAIThread(thread) && (
            <div className="flex flex-col space-y-2 mt-2">
              {thread.participants && thread.participants.length > 0 ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Participants:</span>
                  <div className="flex flex-wrap gap-4">
                    {thread.participants.map((participant) => (
                      <AvatarName
                        key={participant}
                        name={participant}
                        size="xs"
                        /* border already applied inside the component */
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No other participants
                </div>
              )}
            </div>
          )}
        </div>
        {/* Right Side: summary only on md+ */}
        <div className="md:w-1/2 flex flex-col gap-2 min-w-0 hidden md:flex">
          <div className="text-muted-foreground text-sm break-words">
            {isGeneratingSummary ? (
              <p className="text-xs flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Generating summary...
              </p>
            ) : (
              <p>{thread.summary ?? ""}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadHeader;
