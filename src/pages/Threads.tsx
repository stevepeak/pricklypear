import React, { useState, useEffect } from 'react';

import { getThreads } from '@/services/threadService';
import { useAuth } from '@/contexts/AuthContext';
import type { Thread, ThreadTopic } from '@/types/thread';
import { THREAD_TOPIC_INFO, getThreadTopicInfo } from '@/types/thread';
import ThreadsList from '@/components/threads/ThreadsList';
import ThreadsTable from '@/components/threads/ThreadsTable';
import CreateThreadDialog from '@/components/threads/CreateThreadDialog';
import ThreadViewToggle from '@/components/threads/ThreadViewToggle'; // DD-90
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Search, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThreadFilters } from '@/components/threads/use-thread-filters';
import { z } from 'zod';
import {
  SearchBar,
  SearchBarLeft,
  SearchBarRight,
} from '@/components/ui/search-bar';

const Threads = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // DD-90: default to "table" view
  const [view, setView] = useState<'cards' | 'table'>(
    window.innerWidth < 768 ? 'cards' : 'table'
  );

  const { user } = useAuth();

  // Use custom filter hook
  const {
    search,
    setSearch,
    filterStatus,
    filterParticipants,
    filterTopics,
    isFiltering,
    toggleStatus,
    toggleParticipant,
    toggleTopic,
    clearFilters,
    participantOptions,
    filteredThreads,
  } = useThreadFilters(threads);

  // Load persisted view preference and filters on mount
  useEffect(() => {
    const viewSchema = z.enum(['cards', 'table']);
    const storedView = localStorage.getItem('threads.view');
    const result = viewSchema.safeParse(storedView);
    if (result.success) {
      setView(result.data);
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
  const handleViewChange = (value: 'cards' | 'table') => {
    setView(value);
    localStorage.setItem('threads.view', value);
  };

  return (
    <>
      <SearchBar>
        <SearchBarLeft>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            className="pl-9 pr-3 h-9 border-none"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
            aria-label="Search threads"
          />
        </SearchBarLeft>
        <SearchBarRight>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="flex items-center justify-center p-2"
              >
                <div className="relative">
                  <ListFilter className="h-4 w-4" />
                  {isFiltering && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full border border-white" />
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuCheckboxItem
                      checked={filterStatus.includes('Open')}
                      onCheckedChange={() => toggleStatus('Open')}
                      onSelect={(e) => e.preventDefault()}
                    >
                      Open
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterStatus.includes('Closed')}
                      onCheckedChange={() => toggleStatus('Closed')}
                      onSelect={(e) => e.preventDefault()}
                    >
                      Closed
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterStatus.includes('Archived')}
                      onCheckedChange={() => toggleStatus('Archived')}
                      onSelect={(e) => e.preventDefault()}
                    >
                      Archived
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Participants</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
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
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Topic</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
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
                </DropdownMenuPortal>
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
          <ThreadViewToggle value={view} onValueChange={handleViewChange} />
          <CreateThreadDialog
            onThreadCreated={handleThreadCreated}
            user={user}
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        </SearchBarRight>
      </SearchBar>

      {view === 'cards' ? (
        <ThreadsList
          threads={filteredThreads}
          isLoading={isLoading}
          user={user}
          onNewThreadClick={handleOpenCreateDialog}
        />
      ) : (
        <ThreadsTable threads={filteredThreads} isLoading={isLoading} />
      )}
      {isFiltering && (
        <div className="flex justify-center items-center border-t gap-2 text-xs text-muted-foreground">
          {threads.length - filteredThreads.length > 0 && (
            <span>
              <strong>{threads.length - filteredThreads.length} threads</strong>{' '}
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
    </>
  );
};

export default Threads;
