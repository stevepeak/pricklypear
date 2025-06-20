import { useViewport } from './useViewport';

const MOBILE_BREAKPOINT = 768;

/**
 * Responsive helper that returns `true` when the viewport
 * width is below the mobile breakpoint (works for web & native).
 */
export function useIsMobile(): boolean {
  const { width } = useViewport();
  return width < MOBILE_BREAKPOINT;
}
