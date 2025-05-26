import React, { useState, useEffect } from "react";

import { getThreads } from "@/services/threadService";
import { useAuth } from "@/contexts/AuthContext";
import type { Thread, ThreadTopic } from "@/types/thread";
import { THREAD_TOPIC_INFO, getThreadTopicInfo } from "@/types/thread";
import ThreadsList from "@/components/threads/ThreadsList";
import ThreadsTable from "@/components/threads/ThreadsTable";
import CreateThreadDialog from "@/components/threads/CreateThreadDialog";
import ThreadViewToggle from "@/components/threads/ThreadViewToggle"; // DD-90
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Search, ListFilter } from "lucide-react";

const Threads = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // DD-90: default to "table" view
  const [view, setView] = useState<"cards" | "table">("table");

  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    ("open" | "closed" | "ai")[]
  >([]);
  const [filterParticipants, setFilterParticipants] = useState<string[]>([]);
  const [filterTopics, setFilterTopics] = useState<ThreadTopic[]>([]);

  // Load persisted view preference on mount
  useEffect(() => {
    const stored = localStorage.getItem("threads.view");
    if (stored === "cards" || stored === "table") {
      setView(stored);
    }
  }, []);

  useEffect(() => {
    const fetchThreads = async () => {
      setIsLoading(true);
      if (user) {
        const fetchedThreads = await getThreads();
        setThreads(fetchedThreads);
      }
      setIsLoading(false);
    };

    fetchThreads();
  }, [user]);

  const handleThreadCreated = (newThread: Thread) => {
    setThreads((prevThreads) => [newThread, ...prevThreads]);
  };

  const handleOpenCreateDialog = () => {
    setIsDialogOpen(true);
  };

  const toggleStatus = (status: "open" | "closed" | "ai") => {
    setFilterStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const toggleParticipant = (participant: string) => {
    setFilterParticipants((prev) =>
      prev.includes(participant)
        ? prev.filter((p) => p !== participant)
        : [...prev, participant],
    );
  };

  const toggleTopic = (topic: ThreadTopic) => {
    setFilterTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
  };

  const participantOptions = Array.from(
    new Set(threads.flatMap((t) => t.participants)),
  ).sort();

  // DD-90: accept the exact union type
  const handleViewChange = (value: "cards" | "table") => {
    setView(value);
    localStorage.setItem("threads.view", value);
  };

  const filteredThreads = threads.filter((thread) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      thread.title.toLowerCase().includes(searchLower) ||
      (thread.summary?.toLowerCase().includes(searchLower) ?? false) ||
      thread.participants.some((p) => p.toLowerCase().includes(searchLower)) ||
      thread.topic.toLowerCase().includes(searchLower);

    const matchesStatus =
      filterStatus.length === 0 ||
      filterStatus.some((status) => {
        if (status === "ai") return thread.ai;
        return thread.status === status;
      });

    const matchesParticipants =
      filterParticipants.length === 0 ||
      thread.participants.some((p) => filterParticipants.includes(p));

    const matchesTopic =
      filterTopics.length === 0 || filterTopics.includes(thread.topic);

    return (
      matchesSearch && matchesStatus && matchesParticipants && matchesTopic
    );
  });

  return (
    <div>
      <div className="flex justify-between">
        <div className="flex w-full max-w-xs relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            className="pl-9 pr-3 h-9 border-none shadow-none focus-visible:ring-0"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
            aria-label="Search threads"
          />
        </div>
        <div className="flex items-center gap-3 ml-8 pr-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent"
              >
                <ListFilter className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuCheckboxItem
                    checked={filterStatus.includes("open")}
                    onCheckedChange={() => toggleStatus("open")}
                    onSelect={(e) => e.preventDefault()}
                  >
                    Open
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterStatus.includes("closed")}
                    onCheckedChange={() => toggleStatus("closed")}
                    onSelect={(e) => e.preventDefault()}
                  >
                    Closed
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterStatus.includes("ai")}
                    onCheckedChange={() => toggleStatus("ai")}
                    onSelect={(e) => e.preventDefault()}
                  >
                    AI Chat
                  </DropdownMenuCheckboxItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Participants</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-48 overflow-y-auto">
                  {participantOptions.map((name) => (
                    <DropdownMenuCheckboxItem
                      key={name}
                      checked={filterParticipants.includes(name)}
                      onCheckedChange={() => toggleParticipant(name)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Topic</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-48 overflow-y-auto">
                  {Object.keys(THREAD_TOPIC_INFO).map((key) => {
                    const topic = key as ThreadTopic;
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
            </DropdownMenuContent>
          </DropdownMenu>
          <ThreadViewToggle value={view} onValueChange={handleViewChange} />
          <CreateThreadDialog
            onThreadCreated={handleThreadCreated}
            user={user}
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        </div>
      </div>

      {view === "cards" ? (
        <ThreadsList
          threads={filteredThreads}
          isLoading={isLoading}
          user={user}
          onNewThreadClick={handleOpenCreateDialog}
        />
      ) : (
        <ThreadsTable threads={filteredThreads} isLoading={isLoading} />
      )}
    </div>
  );
};

export default Threads;
