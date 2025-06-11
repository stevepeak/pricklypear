import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalMessages } from '@/contexts/GlobalMessagesContext';

export const useGlobalNavigation = () => {
  const navigate = useNavigate();
  const { registerNavigationCallback } = useGlobalMessages();

  useEffect(() => {
    return registerNavigationCallback((path: string) => {
      navigate(path);
    });
  }, [navigate, registerNavigationCallback]);
};
