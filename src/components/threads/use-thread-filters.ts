import { useState, useEffect } from "react";
import type { Thread, ThreadTopic } from "@/types/thread";

export function useThreadFilters(threads: Thread[]) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    ("Open" | "Closed" | "Archived")[]
  >([]);
  const [filterParticipants, setFilterParticipants] = useState<string[]>([]);
  const [filterTopics, setFilterTopics] = useState<ThreadTopic[]>([]);

  const isFiltering =
    search.trim() !== "" ||
    filterStatus.length > 0 ||
    filterParticipants.length > 0 ||
    filterTopics.length > 0;

  // Load persisted filters on mount
  useEffect(() => {
    const storedFilters = localStorage.getItem("threads.filters");
    if (storedFilters) {
      try {
        const parsed = JSON.parse(storedFilters);
        if (typeof parsed.search === "string") setSearch(parsed.search);
        if (Array.isArray(parsed.filterStatus))
          setFilterStatus(parsed.filterStatus);
        if (Array.isArray(parsed.filterParticipants))
          setFilterParticipants(parsed.filterParticipants);
        if (Array.isArray(parsed.filterTopics))
          setFilterTopics(parsed.filterTopics);
      } catch {
        // ignore JSON parse errors
      }
    }
  }, []);

  // Persist filters to localStorage whenever they change
  useEffect(() => {
    const filters = {
      ...(search.trim() && { search }),
      ...(filterStatus.length > 0 && { filterStatus }),
      ...(filterParticipants.length > 0 && { filterParticipants }),
      ...(filterTopics.length > 0 && { filterTopics }),
    };
    if (Object.keys(filters).length > 0) {
      localStorage.setItem("threads.filters", JSON.stringify(filters));
    } else {
      localStorage.removeItem("threads.filters");
    }
  }, [search, filterStatus, filterParticipants, filterTopics]);

  const toggleStatus = (status: "Open" | "Closed" | "Archived") => {
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

  const clearFilters = () => {
    setSearch("");
    setFilterStatus([]);
    setFilterParticipants([]);
    setFilterTopics([]);
  };

  const participantOptions = Array.from(
    new Set(threads.flatMap((t) => t.participants)),
  ).sort();

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

  return {
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    filterParticipants,
    setFilterParticipants,
    filterTopics,
    setFilterTopics,
    isFiltering,
    toggleStatus,
    toggleParticipant,
    toggleTopic,
    clearFilters,
    participantOptions,
    filteredThreads,
  };
}
