import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

export function useGoogleAnalytics(): void {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== 'function') return;
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: location.pathname,
    });
  }, [location.pathname]);
}
