import { useState, useEffect, useMemo, useCallback } from 'react';
import { z } from 'zod';

import type { ListMessage } from '@/types/message';
import type { Database } from '@/integrations/supabase/types';
import type { ThreadTopic } from '@/types/thread';

type MessageType = Database['public']['Enums']['thread_type'];

const filtersSchema = z.object({
  search: z.string().optional().default(''),
  filterParticipants: z.array(z.string()).optional().default([]),
  filterTypes: z.array(z.string()).optional().default([]),
  filterThreads: z.array(z.string()).optional().default([]),
  filterTopics: z.array(z.string()).optional().default([]),
});

export function useMessageFilters(messages: ListMessage[]) {
  /* -------------------------------------------------------------------- */
  /* Persist & Restore filters                                             */
  /* -------------------------------------------------------------------- */
  const loadFiltersFromStorage = () => {
    const stored = localStorage.getItem('messages.filters');
    if (!stored) {
      return {
        search: '',
        filterParticipants: [] as string[],
        filterTypes: [] as MessageType[],
        filterThreads: [] as string[],
        filterTopics: [] as ThreadTopic[],
      };
    }

    const parsed = filtersSchema.safeParse(JSON.parse(stored));
    if (!parsed.success) {
      localStorage.removeItem('messages.filters');
      return {
        search: '',
        filterParticipants: [] as string[],
        filterTypes: [] as MessageType[],
        filterThreads: [] as string[],
        filterTopics: [] as ThreadTopic[],
      };
    }

    return {
      search: parsed.data.search,
      filterParticipants: parsed.data.filterParticipants,
      filterTypes: parsed.data.filterTypes as MessageType[],
      filterThreads: parsed.data.filterThreads,
      filterTopics: parsed.data.filterTopics as ThreadTopic[],
    };
  };

  const initialFilters = loadFiltersFromStorage();
  const [search, setSearch] = useState(initialFilters.search);
  const [filterParticipants, setFilterParticipants] = useState<string[]>(
    initialFilters.filterParticipants
  );
  const [filterTypes, setFilterTypes] = useState<MessageType[]>(
    initialFilters.filterTypes
  );
  const [filterThreads, setFilterThreads] = useState<string[]>(
    initialFilters.filterThreads
  );
  const [filterTopics, setFilterTopics] = useState<ThreadTopic[]>(
    initialFilters.filterTopics
  );

  useEffect(() => {
    const filters = {
      ...(search.trim() && { search }),
      ...(filterParticipants.length > 0 && { filterParticipants }),
      ...(filterTypes.length > 0 && { filterTypes }),
      ...(filterThreads.length > 0 && { filterThreads }),
      ...(filterTopics.length > 0 && { filterTopics }),
    };

    if (Object.keys(filters).length === 0) {
      localStorage.removeItem('messages.filters');
    } else {
      localStorage.setItem('messages.filters', JSON.stringify(filters));
    }
  }, [search, filterParticipants, filterTypes, filterThreads, filterTopics]);

  /* -------------------------------------------------------------------- */
  /* Derived option lists                                                  */
  /* -------------------------------------------------------------------- */
  const participantOptions = useMemo(() => {
    const set = new Set<string>();
    for (const m of messages) {
      if (m.sender?.name) set.add(m.sender.name);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [messages]);

  const threadOptions = useMemo(() => {
    const set = new Set<string>(messages.map((m) => m.threadTitle));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [messages]);

  const topicOptions = useMemo(() => {
    const set = new Set<ThreadTopic>(messages.map((m) => m.threadTopic));
    return Array.from(set);
  }, [messages]);

  /* -------------------------------------------------------------------- */
  /* Toggle helpers                                                       */
  /* -------------------------------------------------------------------- */
  const toggle = useCallback(
    <T>(value: T, list: T[], setter: (next: T[]) => void) => {
      setter(
        list.includes(value)
          ? list.filter((v) => v !== value)
          : [...list, value]
      );
    },
    []
  );

  const toggleParticipant = (name: string) =>
    toggle(name, filterParticipants, setFilterParticipants);

  const toggleType = (type: MessageType) =>
    toggle(type, filterTypes, setFilterTypes);

  const toggleThread = (thread: string) =>
    toggle(thread, filterThreads, setFilterThreads);

  const toggleTopic = (topic: ThreadTopic) =>
    toggle(topic, filterTopics, setFilterTopics);

  /* -------------------------------------------------------------------- */
  /* Filtering logic                                                      */
  /* -------------------------------------------------------------------- */
  const isFiltering =
    search.trim() !== '' ||
    filterParticipants.length > 0 ||
    filterTypes.length > 0 ||
    filterThreads.length > 0 ||
    filterTopics.length > 0;

  const filteredMessages = useMemo(() => {
    const lower = search.trim().toLowerCase();

    return messages.filter((msg) => {
      const matchesSearch =
        lower === '' ||
        msg.text.toLowerCase().includes(lower) ||
        msg.threadTitle.toLowerCase().includes(lower) ||
        (msg.sender?.name?.toLowerCase() ?? '').includes(lower);

      const matchesParticipants =
        filterParticipants.length === 0 ||
        (msg.sender?.name
          ? filterParticipants.includes(msg.sender.name)
          : false);

      const matchesTypes =
        filterTypes.length === 0 || filterTypes.includes(msg.threadType);

      const matchesThreads =
        filterThreads.length === 0 || filterThreads.includes(msg.threadTitle);

      const matchesTopics =
        filterTopics.length === 0 || filterTopics.includes(msg.threadTopic);

      return (
        matchesSearch &&
        matchesParticipants &&
        matchesTypes &&
        matchesThreads &&
        matchesTopics
      );
    });
  }, [
    messages,
    search,
    filterParticipants,
    filterTypes,
    filterThreads,
    filterTopics,
  ]);

  /* -------------------------------------------------------------------- */
  /* API                                                                   */
  /* -------------------------------------------------------------------- */
  const clearFilters = () => {
    setSearch('');
    setFilterParticipants([]);
    setFilterTypes([]);
    setFilterThreads([]);
    setFilterTopics([]);
  };

  return {
    /* state */
    search,
    setSearch,
    filterParticipants,
    filterTypes,
    filterThreads,
    filterTopics,

    /* helpers */
    toggleParticipant,
    toggleType,
    toggleThread,
    toggleTopic,
    clearFilters,

    /* derived */
    isFiltering,
    participantOptions,
    threadOptions,
    topicOptions,
    filteredMessages,
  };
}
