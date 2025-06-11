// Centralized thread topic definitions, metadata, and helpers
// -----------------------------------------------------------
// 1. ThreadTopic - the single source of truth for every valid topic string.
// 2. THREAD_TOPIC_INFO - label + emoji metadata keyed by topic.
// 3. getThreadTopicInfo - convenience helper that gracefully falls back to "other".
//
// Whenever you add a new topic, update the union and THREAD_TOPIC_INFO below -
// every component and service picks them up automatically.

import { Database } from '@/integrations/supabase/types';

/** All valid thread topic identifiers used throughout the app. */
export type ThreadTopic = Database['public']['Enums']['thread_topic'];

export type ThreadControls = {
  requireAiApproval?: boolean;
};

export type ThreadStatus = Database['public']['Enums']['thread_status'];

export type Thread = {
  id: string;
  title: string;
  createdAt: Date;
  status: ThreadStatus;
  participants: string[];
  summary?: string | null;
  topic: ThreadTopic;
  controls?: ThreadControls;
  type: Database['public']['Enums']['thread_type'];
  createdBy?: {
    id: string;
    name: string;
  };
};

/** Display metadata (label and emoji icon) for every thread topic. */
export const THREAD_TOPIC_INFO: Record<
  ThreadTopic,
  { label: string; icon: string }
> = {
  travel: { label: 'Travel', icon: '✈️' },
  parenting_time: { label: 'Parenting Time', icon: '👨‍👩‍👧' },
  health: { label: 'Health', icon: '🏥' },
  education: { label: 'Education', icon: '🎓' },
  activity: { label: 'Activity', icon: '🏃' },
  legal: { label: 'Legal', icon: '⚖️' },
  expense: { label: 'Expense', icon: '💵' },
  other: { label: 'Other', icon: '📝' },
} as const;

/**
 * Retrieve label / icon information for a given thread topic.
 *
 * @param topic - The topic identifier (may be null/undefined).
 * @returns The topic's metadata, or the "other" metadata if the topic is null/undefined.
 */
export function getThreadTopicInfo(topic: ThreadTopic | null | undefined) {
  return THREAD_TOPIC_INFO[topic ?? 'other'];
}

export function isAIThread(thread: Thread): boolean {
  return thread.type === 'ai_chat';
}
