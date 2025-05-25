import React, { useState, useEffect } from "react";

import { getThreads } from "@/services/threadService";
import { useAuth } from "@/contexts/AuthContext";
import type { Thread } from "@/types/thread";
import ThreadsList from "@/components/threads/ThreadsList";
import ThreadsTable from "@/components/threads/ThreadsTable";
import CreateThreadDialog from "@/components/threads/CreateThreadDialog";
import ThreadViewToggle from "@/components/threads/ThreadViewToggle"; // DD-90
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Threads = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // DD-90: default to "table" view
  const [view, setView] = useState<"cards" | "table">("table");

  const { user } = useAuth();

  const [search, setSearch] = useState("");

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

  // DD-90: accept the exact union type
  const handleViewChange = (value: "cards" | "table") => {
    setView(value);
    localStorage.setItem("threads.view", value);
  };

  const filteredThreads = threads.filter((thread) => {
    const searchLower = search.toLowerCase();
    return (
      thread.title.toLowerCase().includes(searchLower) ||
      (thread.summary?.toLowerCase().includes(searchLower) ?? false) ||
      thread.participants.some((p) => p.toLowerCase().includes(searchLower)) ||
      thread.topic.toLowerCase().includes(searchLower)
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
            placeholder="Search threads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
            aria-label="Search threads"
          />
        </div>
        <div className="flex items-center gap-3 ml-8 pr-8">
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
