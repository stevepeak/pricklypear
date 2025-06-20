import React, { useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useThread } from '@/hooks/useThread';
import { isWeb } from '@/utils/platform';

function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);
  const lastClickTime = useRef<number>(0);
  const DOUBLE_CLICK_DELAY = 300; // milliseconds

  // Extract thread ID from path like /threads/123
  const threadId =
    pathnames[0] === 'threads' && pathnames[1] ? pathnames[1] : undefined;
  const { data: thread, isLoading: loadingThread } = useThread(threadId);

  const handleBreadcrumbClick = () => {
    if (!isWeb()) return;
    const now = Date.now();
    if (now - lastClickTime.current < DOUBLE_CLICK_DELAY) {
      // Double click detected - open command menu
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    }
    lastClickTime.current = now;
  };

  const getThreadLabel = (value: string, idx: number) => {
    if (pathnames[0] === 'threads' && idx === 1) {
      if (loadingThread) {
        return (
          <React.Fragment>
            <Loader2 className="h-4 w-4 animate-spin text-primary inline-block align-middle" />
          </React.Fragment>
        );
      }
      return thread?.title || value;
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <Breadcrumb
      className="p-3 sticky top-0 z-[9] bg-secondary border-b"
      onClick={handleBreadcrumbClick}
    >
      <BreadcrumbList>
        <BreadcrumbItem>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarTrigger className="" />
              </TooltipTrigger>
              <TooltipContent>
                <span>Collapse sidebar</span>{' '}
                <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
                  <span className="text-xs">⌘</span>B
                </kbd>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </BreadcrumbItem>
        {pathnames.map((value, idx) => {
          const to = `/${pathnames.slice(0, idx + 1).join('/')}`;
          const isLast = idx === pathnames.length - 1;
          const label = getThreadLabel(value, idx);

          if (pathnames[0] === 'threads' && idx === 1 && loadingThread) {
            return (
              <React.Fragment key={to}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>{label}</BreadcrumbItem>
              </React.Fragment>
            );
          }

          return (
            <React.Fragment key={to}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <Link to={to} className="hover:underline">
                    {label}
                  </Link>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default Breadcrumbs;
