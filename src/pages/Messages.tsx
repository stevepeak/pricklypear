import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ListFilter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { Message } from "@/types/message";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import ThreadTopicBadge from "@/components/thread/ThreadTopicBadge";
import type { ThreadTopic } from "@/types/thread";
import { getThreadTopicInfo } from "@/types/thread";
import type { Database } from "@/integrations/supabase/types";
import { useMessagesFilters } from "@/hooks/use-messages-filters";

const formatCompactTime = (date: Date) => {
  const distance = formatDistanceToNow(date, { addSuffix: false });
  const [number, unit] = distance.replace("about ", "").split(" ");

  // Map of units to their short forms
  const unitMap: Record<string, string> = {
    minute: "m",
    minutes: "m",
    hour: "h",
    hours: "h",
    day: "d",
    days: "d",
    month: "mo",
    months: "mo",
    year: "y",
    years: "y",
  };

  if (!unitMap[unit]) {
    return "just now";
  }

  return `${number}${unitMap[unit]} ago`;
};

type ListMessage = {
  threadId: string;
  threadTitle: string;
  threadTopic: ThreadTopic;
  threadType: Database["public"]["Enums"]["thread_type"];
  id: string;
  text: string;
  senderName: string;
  timestamp: Date;
  type: Message["type"];
  readAt: Date | null;
};

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ListMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    search,
    setSearch,
    filterParticipants,
    filterTypes,
    filterThreads,
    filterTopics,
    isFiltering,
    toggleParticipant,
    toggleType,
    toggleThread,
    toggleTopic,
    clearFilters,
    participantOptions,
    typeOptions,
    threadOptions,
    topicOptions,
    filteredMessages,
  } = useMessagesFilters(messages);

  const loadMessages = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select(
          `
          id,
          text,
          timestamp,
          type,
          thread:threads!inner(
            id,
            title,
            topic,
            type
          ),
          reads:message_read_receipts(
            read_at
          ),
          from:profiles!inner(
            name
          )
        `,
        )
        .eq("thread.status", "Open")
        .eq("reads.user_id", user.id)
        .neq("user_id", user.id)
        .order("timestamp", { ascending: false })
        .limit(100);

      if (messagesError) throw messagesError;

      const processedMessages = messagesData.map((message) => ({
        threadId: message.thread.id,
        threadTitle: message.thread.title,
        threadTopic: message.thread.topic,
        threadType: message.thread.type,
        id: message.id,
        text: message.text,
        senderName: message.from.name,
        timestamp: new Date(message.timestamp),
        type: message.type,
        readAt: message.reads[0]?.read_at
          ? new Date(message.reads[0].read_at)
          : null,
      }));

      setMessages(processedMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Set up real-time updates
  useRealtimeMessages({
    onMessageReceived: async (message) => {
      // Fetch additional message details to convert to ListMessage
      const { data: messageData, error: messageError } = await supabase
        .from("messages")
        .select(
          `
          thread:threads!inner(
            id,
            title,
            topic,
            type
          ),
          from:profiles!inner(
            name
          )
        `,
        )
        .eq("id", message.id)
        .single();

      if (messageError || !messageData) {
        console.error("Failed to fetch message details:", messageError);
        return;
      }

      const listMessage: ListMessage = {
        threadId: messageData.thread.id,
        threadTitle: messageData.thread.title,
        threadTopic: messageData.thread.topic,
        threadType: messageData.thread.type,
        id: message.id,
        text: message.text,
        senderName: messageData.from.name,
        timestamp: message.timestamp,
        type: message.type,
        readAt: null,
      };

      // Add new message to the list if it's not already there
      setMessages((prev) => {
        if (prev.some((m) => m.id === listMessage.id)) {
          return prev;
        }
        return [listMessage, ...prev];
      });
    },
    onUnreadCountsUpdated: (_, threadCounts) => {
      // Update read status of messages
      setMessages((prev) =>
        prev.map((message) => ({
          ...message,
          readAt:
            threadCounts[message.threadId] === 0 ? new Date() : message.readAt,
        })),
      );
    },
  });

  useEffect(() => {
    if (!user) return;
    loadMessages();
  }, [user, loadMessages]);

  const handleMessageClick = (threadId: string) => {
    navigate(`/threads/${threadId}`);
  };

  return (
    <div>
      <div className="sticky top-[3.75rem] z-[8] flex items-center justify-between border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/90 px-4 py-2 pr-4">
        <div className="flex w-full max-w-xs relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            className="pl-9 pr-3 h-9 border-none shadow-none focus-visible:ring-0"
            placeholder="Search messages"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
            aria-label="Search"
          />
        </div>
        <div className="flex gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="focus-visible:ring-0"
              >
                <div className="relative">
                  <ListFilter />
                  {isFiltering && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full border border-white shadow" />
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Participants</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-48 overflow-y-auto">
                  {participantOptions.map((participant) => (
                    <DropdownMenuCheckboxItem
                      key={participant}
                      checked={filterParticipants.includes(participant)}
                      onCheckedChange={() => toggleParticipant(participant)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {participant}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Type</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-48 overflow-y-auto">
                  {typeOptions.map((type) => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={filterTypes.includes(type)}
                      onCheckedChange={() => toggleType(type)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {type
                        .split("_")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Topic</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-48 overflow-y-auto">
                  {topicOptions.map((topic) => {
                    const info = getThreadTopicInfo(topic);
                    return (
                      <DropdownMenuCheckboxItem
                        key={topic}
                        checked={filterTopics.includes(topic)}
                        onCheckedChange={() => toggleTopic(topic)}
                        onSelect={(e) => e.preventDefault()}
                      >
                        <span className="mr-2">{info.icon}</span>
                        {info.label}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Thread</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-48 overflow-y-auto">
                  {threadOptions.map((thread) => (
                    <DropdownMenuCheckboxItem
                      key={thread}
                      checked={filterThreads.includes(thread)}
                      onCheckedChange={() => toggleThread(thread)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {thread}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              {isFiltering && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-muted-foreground"
                    onSelect={clearFilters}
                  >
                    Clear filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 py-2 font-semibold whitespace-nowrap">
              Time
            </TableHead>
            <TableHead className="px-4 py-2 font-semibold whitespace-nowrap">
              Sender
            </TableHead>
            <TableHead className="px-4 py-2 font-semibold whitespace-nowrap">
              Thread
            </TableHead>
            <TableHead className="px-4 py-2 font-semibold whitespace-nowrap">
              Message
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Loading messages...
              </TableCell>
            </TableRow>
          ) : filteredMessages.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                {search
                  ? "No messages found matching your search."
                  : "No messages found."}
              </TableCell>
            </TableRow>
          ) : (
            filteredMessages.map((message) => (
              <TableRow
                key={message.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleMessageClick(message.threadId)}
              >
                <TableCell>
                  <div className="flex items-center">
                    {!message.readAt && (
                      <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                    )}
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-muted-foreground">
                          {formatCompactTime(message.timestamp)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {message.timestamp.toLocaleString()}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>
                        {message.senderName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{message.senderName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ThreadTopicBadge
                      thread={{
                        id: message.threadId,
                        title: message.threadTitle,
                        topic: message.threadTopic,
                        type: message.threadType,
                        createdAt: message.timestamp,
                        status: "Open",
                        participants: [],
                      }}
                    />
                    {message.threadTitle}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-md truncate">
                    {!message.readAt ? (
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                        Click to view message
                      </span>
                    ) : (
                      message.text
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {isFiltering && (
        <div className="flex justify-center items-center gap-2 mt-4 text-xs text-muted-foreground">
          {messages.length - filteredMessages.length > 0 && (
            <span>
              <strong>
                {messages.length - filteredMessages.length} messages
              </strong>{" "}
              hidden by filters.
            </span>
          )}
          <Button
            variant="link"
            className="text-muted-foreground text-xs"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
