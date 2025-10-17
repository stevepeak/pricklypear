import { useEffect } from 'react';
import { useUnreadMessages } from './useUnreadMessages';
import { updateFaviconWithBadge, resetFavicon } from '@/utils/favicon';

const BASE_TITLE = 'PricklyPear';

/**
 * Hook to update browser tab title and favicon based on unread message count
 */
export const useTabNotifications = () => {
  const { totalUnread } = useUnreadMessages();

  useEffect(() => {
    // Update document title
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) ${BASE_TITLE}`;
    } else {
      document.title = BASE_TITLE;
    }

    // Update favicon with badge
    updateFaviconWithBadge(totalUnread);

    // Cleanup: reset to default when component unmounts
    return () => {
      document.title = BASE_TITLE;
      resetFavicon();
    };
  }, [totalUnread]);
};
