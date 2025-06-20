import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Detects if the viewport is in “mobile” size.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const handleChange = () =>
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    mql.addEventListener('change', handleChange);
    handleChange(); // initial value

    return () => mql.removeEventListener('change', handleChange);
  }, []);

  return !!isMobile;
}
