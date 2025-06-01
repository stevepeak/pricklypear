import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getThread } from "@/services/threadService";
import { handleError } from "@/services/messageService/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);
  const [threadTitle, setThreadTitle] = useState<string | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);

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
          handleError(e, "fetchThreadTitle");
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
  }, [location.pathname, pathnames]);

  return (
    <Breadcrumb className="p-3 sticky top-0 z-20 bg-background border-b">
      <BreadcrumbList>
        <BreadcrumbItem>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarTrigger className="" />
              </TooltipTrigger>
              <TooltipContent>
                <span>Collapse sidebar</span>{" "}
                <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
                  <span className="text-xs">⌘</span>B
                </kbd>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </BreadcrumbItem>
        {pathnames.map((value, idx) => {
          const to = `/${pathnames.slice(0, idx + 1).join("/")}`;
          const isLast = idx === pathnames.length - 1;
          let label = value;
          if (pathnames[0] === "threads" && idx === 1 && threadTitle) {
            label = threadTitle;
          } else if (pathnames[0] === "threads" && idx === 1 && loadingThread) {
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
