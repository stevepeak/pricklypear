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
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Message } from "@/types/message";
import type { Thread } from "@/types/thread";
import { formatThreadTimestamp } from "@/utils/formatTimestamp";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useConnections } from "@/hooks/useConnections";
import { supabase } from "@/integrations/supabase/client";

export default function Messages() {
  const { user } = useAuth();
  const { connections } = useConnections();
  const [messages, setMessages] = useState<Message[]>([]);
  const [threads, setThreads] = useState<Record<string, Thread>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterThreads, setFilterThreads] = useState<string[]>([]);

  const loadMessages = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      // Get all threads first
      const { data: threadsData, error: threadsError } = await supabase
        .from("threads")
        .select("*")
        .not("status", "eq", "Closed")
        .not("status", "eq", "Archived");

      if (threadsError) throw threadsError;

      const threadsMap: Record<string, Thread> = {};
      for (const thread of threadsData) {
        threadsMap[thread.id] = {
          id: thread.id,
          title: thread.title,
          createdAt: new Date(thread.created_at),
          status: thread.status,
          participants: [], // We'll need to fetch this separately if needed
          topic: thread.topic,
          type: thread.type,
          controls: thread.controls as Thread["controls"],
          summary: thread.summary,
        };
      }
      setThreads(threadsMap);

      // Get all messages
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .order("timestamp", { ascending: false });

      if (messagesError) throw messagesError;

      // Get read receipts for all messages
      const { data: readReceipts, error: readReceiptsError } = await supabase
        .from("message_read_receipts")
        .select("*")
        .eq("user_id", user.id);

      if (readReceiptsError) throw readReceiptsError;

      const readReceiptsMap = new Map(
        readReceipts?.map((receipt) => [receipt.message_id, receipt.read_at]) ||
          [],
      );

      const processedMessages = await Promise.all(
        messagesData.map(async (msg) => {
          const connection = connections.find(
            (conn) =>
              conn.otherUserId === msg.user_id || conn.user_id === msg.user_id,
          );
          return {
            id: msg.id,
            text: (msg.text || "").trim(),
            sender: connection?.name || "Unknown User",
            timestamp: new Date(msg.timestamp || ""),
            threadId: msg.thread_id || "",
            isCurrentUser: msg.user_id === user.id,
            type: msg.type,
            details: msg.details as Record<string, unknown>,
            readAt: readReceiptsMap.get(msg.id)
              ? new Date(readReceiptsMap.get(msg.id)!)
              : null,
          };
        }),
      );

      setMessages(processedMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, connections]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Filter messages based on search and thread filters
  const filtered = messages.filter((message) => {
    const matchesSearch = search
      ? message.text.toLowerCase().includes(search.toLowerCase()) ||
        message.sender.toLowerCase().includes(search.toLowerCase()) ||
        threads[message.threadId]?.title
          .toLowerCase()
          .includes(search.toLowerCase())
      : true;

    const matchesThread = filterThreads.length
      ? filterThreads.includes(message.threadId)
      : true;

    return matchesSearch && matchesThread;
  });

  const isFiltering = search.trim() !== "" || filterThreads.length > 0;

  const toggleFilterThread = (threadId: string) => {
    setFilterThreads((prev) =>
      prev.includes(threadId)
        ? prev.filter((id) => id !== threadId)
        : [...prev, threadId],
    );
  };

  const clearFilters = () => {
    setSearch("");
    setFilterThreads([]);
  };

  return (
    <div>
      <div className="sticky top-12 z-10 flex items-center justify-between border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/90 px-4 py-2 pr-4">
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
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem className="font-semibold">
                Filter by Thread
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {Object.values(threads).map((thread) => (
                <DropdownMenuCheckboxItem
                  key={thread.id}
                  checked={filterThreads.includes(thread.id)}
                  onCheckedChange={() => toggleFilterThread(thread.id)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {thread.title}
                </DropdownMenuCheckboxItem>
              ))}
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
          ) : filtered.length === 0 ? (
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
            filtered.map((message) => (
              <TableRow
                key={message.id}
                className={cn(message.readAt && "bg-muted/50")}
              >
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-muted-foreground">
                        {formatThreadTimestamp(message.timestamp)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {message.timestamp.toLocaleString()}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>
                        {message.sender.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{message.sender}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {threads[message.threadId]?.title || "Unknown Thread"}
                </TableCell>
                <TableCell>
                  <div className="max-w-md truncate">{message.text}</div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {isFiltering && (
        <div className="flex justify-center mt-4">
          <Button
            variant="ghost"
            className="text-muted-foreground"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
