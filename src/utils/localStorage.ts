/**
 * Centralized localStorage keys to avoid magic strings throughout the codebase
 */
export const localStorageKeys = {
  SYSTEM_PROMPT_AI_CHAT: 'systemPrompt:ai-chat',
  SYSTEM_PROMPT_MESSAGE_REVIEW: 'systemPrompt:message-review',
  AUTO_ACCEPT_AI_SUGGESTIONS: 'autoAcceptAISuggestions',
  THREAD_DRAFT_PREFIX: 'thread-draft-',
} as const;

/**
 * Get an item from localStorage with type safety
 * Returns the default value if the item doesn't exist or can't be parsed
 */
export function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;

    // For string defaults, return the string directly
    if (typeof defaultValue === 'string') {
      return item as T;
    }

    // For boolean defaults, parse accordingly
    if (typeof defaultValue === 'boolean') {
      return (item === 'true') as T;
    }

    // For other types, try to parse as JSON
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Set an item in localStorage with type safety
 */
export function setLocalStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    if (typeof value === 'string') {
      localStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
}

/**
 * Remove an item from localStorage
 * Currently used internally by removeThreadDraft
 */
function removeLocalStorageItem(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error);
  }
}

/**
 * Get a thread draft from localStorage
 */
export function getThreadDraft(threadId: string): string {
  return getLocalStorageItem(
    `${localStorageKeys.THREAD_DRAFT_PREFIX}${threadId}`,
    ''
  );
}

/**
 * Set a thread draft in localStorage
 */
export function setThreadDraft(threadId: string, draft: string): void {
  setLocalStorageItem(
    `${localStorageKeys.THREAD_DRAFT_PREFIX}${threadId}`,
    draft
  );
}

/**
 * Remove a thread draft from localStorage
 */
export function removeThreadDraft(threadId: string): void {
  removeLocalStorageItem(`${localStorageKeys.THREAD_DRAFT_PREFIX}${threadId}`);
}
