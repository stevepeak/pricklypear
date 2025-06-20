import {
  useState,
  useEffect,
} from 'react';
import type { ListMessage } from '@/types/message';
import { z } from 'zod';
import type { Database } from '@/integrations/supabase/types';
import type { ThreadTopic } from '@/types/thread';
import { Constants } from '@/integrations/supabase/types';

export function useMessageFilters(messages: ListMessage[]) {
  /* full original hook body ... unchanged ... */
}
// Optional backwards-compat export to avoid brittle breakages where the old
// symbol name may still be referenced in tests or yet-to-be-updated files.
export { useMessageFilters as useMessagesFilters }
