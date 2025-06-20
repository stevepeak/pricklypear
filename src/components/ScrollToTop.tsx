import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { isWeb } from '@/utils/platform';

export function ScrollToTop(): null {
  const { pathname } = useLocation();

  useEffect(() => {
    if (isWeb()) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
