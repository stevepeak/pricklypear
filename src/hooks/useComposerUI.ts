import { useState, useEffect } from 'react';
import {
  getLocalStorageItem,
  setLocalStorageItem,
  localStorageKeys,
} from '@/utils/localStorage';

interface UseComposerUIProps {
  messagesEndRef?: React.RefObject<HTMLDivElement>;
}

export function useComposerUI({ messagesEndRef }: UseComposerUIProps) {
  const [autoAccept, setAutoAccept] = useState(() =>
    getLocalStorageItem(localStorageKeys.AUTO_ACCEPT_AI_SUGGESTIONS, false)
  );
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);

  // Show 'Jump to latest message' button if bottom is not visible
  useEffect(() => {
    const handleScroll = () => {
      if (!messagesEndRef?.current) return;
      const rect = messagesEndRef.current.getBoundingClientRect();
      const atBottom = rect.bottom <= window.innerHeight - 40;
      setShowJumpToLatest(!atBottom);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [messagesEndRef]);

  const handleToggleAutoAccept = (value: boolean) => {
    setAutoAccept(value);
    setLocalStorageItem(localStorageKeys.AUTO_ACCEPT_AI_SUGGESTIONS, value);
  };

  const handleJumpToLatest = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return {
    autoAccept,
    showJumpToLatest,
    handleToggleAutoAccept,
    handleJumpToLatest,
  };
}
