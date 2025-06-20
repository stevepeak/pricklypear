import { useState, useEffect } from "react";
import type { ListMessage } from "@/types/message";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import type { ThreadTopic } from "@/types/thread";
import { Constants } from "@/integrations/supabase/types";

export function useMessagesFilters(messages: ListMessage[]) {
  const [search, setSearch] = useState("");
  const [filterParticipants, setFilterParticipants] = useState<string[]>([]);
  const [filterTypes, setFilterTypes] = useState<
    Database["public"]["Enums"]["thread_type"][]
  >([]);
  const [filterThreads, setFilterThreads] = useState<string[]>([]);
  const [filterTopics, setFilterTopics] = useState<ThreadTopic[]>([]);

  const isFiltering =
    search.trim() !== "" ||
    filterParticipants.length > 0 ||
    filterTypes.length > 0 ||
    filterThreads.length > 0 ||
    filterTopics.length > 0;

  // Load persisted filters on mount
  useEffect(() => {
    const storedFilters = localStorage.getItem("messages.filters");
    const filtersSchema = z.object({
      search: z.string().optional().default(""),
      filterParticipants: z.array(z.string()).optional().default([]),
      filterTypes: z.array(z.string()).optional().default([]),
      filterThreads: z.array(z.string()).optional().default([]),
      filterTopics: z.array(z.string()).optional().default([]),
    });
    if (storedFilters) {
      const parsed = filtersSchema.safeParse(JSON.parse(storedFilters));
      if (parsed.success) {
        const {
          search,
          filterParticipants,
          filterTypes,
          filterThreads,
          filterTopics,
        } = parsed.data;
        setSearch(search);
        setFilterParticipants(filterParticipants);
        setFilterTypes(
          filterTypes as Database["public"]["Enums"]["thread_type"][],
        );
        setFilterThreads(filterThreads);
        setFilterTopics(filterTopics as ThreadTopic[]);
      } else {
        localStorage.removeItem("messages.filters");
        setSearch("");
        setFilterParticipants([]);
        setFilterTypes([]);
        setFilterThreads([]);
        setFilterTopics([]);
      }
    }
  }, []);

  // Persist filters to localStorage whenever they change
  useEffect(() => {
    const filters = {
      ...(search.trim() && { search }),
      ...(filterParticipants.length > 0 && { filterParticipants }),
      ...(filterTypes.length > 0 && { filterTypes }),
      ...(filterThreads.length > 0 && { filterThreads }),
      ...(filterTopics.length > 0 && { filterTopics }),
    };
    if (Object.keys(filters).length > 0) {
      localStorage.setItem("messages.filters", JSON.stringify(filters));
    } else {
      localStorage.removeItem("messages.filters");
    }
  }, [search, filterParticipants, filterTypes, filterThreads, filterTopics]);

  const toggleParticipant = (participant: string) => {
    setFilterParticipants((prev) =>
      prev.includes(participant)
        ? prev.filter((p) => p !== participant)
        : [...prev, participant],
    );
  };

  const toggleType = (type: Database["public"]["Enums"]["thread_type"]) => {
    setFilterTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const toggleThread = (threadTitle: string) => {
    setFilterThreads((prev) =>
      prev.includes(threadTitle)
        ? prev.filter((t) => t !== threadTitle)
        : [...prev, threadTitle],
    );
  };

  const toggleTopic = (topic: ThreadTopic) => {
    setFilterTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
  };

  const clearFilters = () => {
    setSearch("");
    setFilterParticipants([]);
    setFilterTypes([]);
    setFilterThreads([]);
    setFilterTopics([]);
  };

  const participantOptions = Array.from(
    new Set(messages.map((m) => m.sender?.name)),
  ).sort();

  const typeOptions = Constants.public.Enums.thread_type;

  const threadOptions = Array.from(
    new Set(messages.map((m) => m.threadTitle)),
  ).sort();

  const topicOptions = Constants.public.Enums.thread_topic;

  const filteredMessages = messages.filter((message) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      message.text.toLowerCase().includes(searchLower) ||
      message.sender?.name?.toLowerCase().includes(searchLower) ||
      message.threadTitle.toLowerCase().includes(searchLower);

    const matchesParticipants =
      filterParticipants.length === 0 ||
      filterParticipants.includes(message.sender?.name || "someone");

    const matchesTypes =
      filterTypes.length === 0 || filterTypes.includes(message.threadType);

    const matchesThreads =
      filterThreads.length === 0 || filterThreads.includes(message.threadTitle);

    const matchesTopics =
      filterTopics.length === 0 || filterTopics.includes(message.threadTopic);

    return (
      matchesSearch &&
      matchesParticipants &&
      matchesTypes &&
      matchesThreads &&
      matchesTopics
    );
  });

  return {
    search,
    setSearch,
    filterParticipants,
    setFilterParticipants,
    filterTypes,
    setFilterTypes,
    filterThreads,
    setFilterThreads,
    filterTopics,
    setFilterTopics,
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
  };
}
