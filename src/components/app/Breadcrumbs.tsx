import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Loader2, ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import { toast } from "sonner";
import { getThread, getThreads } from "@/services/threadService";
import type { Thread } from "@/types/thread";

function Breadcrumbs() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathnames = location.pathname.split("/").filter(Boolean);
  const [threadTitle, setThreadTitle] = useState<string | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function fetchThreadTitle() {
      if (
        pathnames[0] === "threads" &&
        pathnames[1] &&
        pathnames.length === 2
      ) {
        setLoadingThread(true);
        try {
          const thread = await getThread(pathnames[1]);
          if (!ignore) {
            if (thread) {
              setThreadTitle(thread.title);
            } else {
              setThreadTitle(null);
              toast("Thread not found", {
                description: "Could not load thread title.",
              });
            }
          }
        } catch (e) {
          if (!ignore) {
            setThreadTitle(null);
            toast("Error", { description: "Failed to load thread title." });
          }
        } finally {
          if (!ignore) setLoadingThread(false);
        }
      } else {
        setThreadTitle(null);
      }
    }
    fetchThreadTitle();
    return () => {
      ignore = true;
    };
  }, [location.pathname]);

  useEffect(() => {
    let ignore = false;
    async function fetchThreads() {
      if (
        pathnames[0] === "threads" &&
        pathnames[1] &&
        pathnames.length === 2
      ) {
        setLoadingThreads(true);
        try {
          const allThreads = await getThreads();
          if (!ignore) {
            setThreads(allThreads);
          }
        } catch (e) {
          if (!ignore) {
            toast("Error", {
              description: "Failed to load threads for navigation.",
            });
          }
        } finally {
          if (!ignore) setLoadingThreads(false);
        }
      } else {
        setThreads([]);
      }
    }
    fetchThreads();
    return () => {
      ignore = true;
    };
  }, [location.pathname]);

  // Find current, previous, and next thread
  let navControls = null;
  if (
    pathnames[0] === "threads" &&
    pathnames[1] &&
    pathnames.length === 2 &&
    threads.length > 0
  ) {
    const idx = threads.findIndex((t) => t.id === pathnames[1]);
    const prevThread = idx > 0 ? threads[idx - 1] : null;
    const nextThread = idx < threads.length - 1 ? threads[idx + 1] : null;
    navControls = (
      <div className="flex items-center gap-1 ml-4">
        <button
          disabled={!prevThread}
          onClick={() => prevThread && navigate(`/threads/${prevThread.id}`)}
          className="p-1 rounded hover:bg-accent disabled:opacity-50"
          aria-label="Previous thread"
        >
          <ChevronUpIcon className="w-5 h-5" />
        </button>
        <button
          disabled={!nextThread}
          onClick={() => nextThread && navigate(`/threads/${nextThread.id}`)}
          className="p-1 rounded hover:bg-accent disabled:opacity-50"
          aria-label="Next thread"
        >
          <ChevronDownIcon className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <Breadcrumb className="p-3 sticky top-0 z-20 bg-white">
      <div className="flex w-full items-center justify-between">
        <BreadcrumbList>
          <BreadcrumbItem>
            <SidebarTrigger className="" />
          </BreadcrumbItem>
          {pathnames.map((value, idx) => {
            const to = `/${pathnames.slice(0, idx + 1).join("/")}`;
            const isLast = idx === pathnames.length - 1;
            let label = value;
            if (pathnames[0] === "threads" && idx === 1 && threadTitle) {
              label = threadTitle;
            } else if (
              pathnames[0] === "threads" &&
              idx === 1 &&
              loadingThread
            ) {
              return (
                <React.Fragment key={to}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <Loader2 className="h-4 w-4 animate-spin text-primary inline-block align-middle" />
                  </BreadcrumbItem>
                </React.Fragment>
              );
            } else {
              label = label.charAt(0).toUpperCase() + label.slice(1);
            }
            return (
              <React.Fragment key={to}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={to}>{label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
        {/* Thread navigation controls */}
        {navControls}
      </div>
    </Breadcrumb>
  );
}

export default Breadcrumbs;
