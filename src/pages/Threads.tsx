import React, { useState, useEffect } from "react";

import { getThreads } from "@/services/threadService";
import { useAuth } from "@/contexts/AuthContext";
import type { Thread } from "@/types/thread";
import ThreadsList from "@/components/ThreadsList";
import ThreadsTable from "@/components/ThreadsTable";
import CreateThreadDialog from "@/components/thread/CreateThreadDialog";
import ThreadViewToggle from "@/components/thread/ThreadViewToggle"; // DD-90

const Threads = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // DD-90: default to “table” view
  const [view, setView] = useState<"cards" | "table">("table");

  const { user } = useAuth();

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

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Threads</h1>

        <div className="flex items-center gap-3">
          <ThreadViewToggle value={view} onValueChange={handleViewChange} />

          {user && (
            <CreateThreadDialog
              onThreadCreated={handleThreadCreated}
              user={user}
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
            />
          )}
        </div>
      </div>

      {view === "cards" ? (
        <ThreadsList
          threads={threads}
          isLoading={isLoading}
          user={user}
          onNewThreadClick={handleOpenCreateDialog}
        />
      ) : (
        <ThreadsTable threads={threads} isLoading={isLoading} />
      )}
    </div>
  );
};

export default Threads;
