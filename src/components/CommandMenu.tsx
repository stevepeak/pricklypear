import React from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { SystemPromptDialog } from "@/components/commands/SystemPrompt";
import { DemoModeDialog } from "@/components/commands/DemoMode";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useConnections } from "@/hooks/useConnections";
import {
  Moon,
  Sun,
  MessageSquareText,
  MessageSquare,
  BookUser,
  Baby,
  FileText,
  Calendar,
  Receipt,
  Sparkles,
  BadgeCheck,
  Link2,
  LogOut,
  Settings,
} from "lucide-react";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const [isSystemPromptOpen, setIsSystemPromptOpen] = React.useState(false);
  const [isDemoModeOpen, setIsDemoModeOpen] = React.useState(false);
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { totalUnread, threadCounts } = useUnreadMessages();
  const { connections } = useConnections();

  // Calculate pending incoming connections
  const pendingIncomingCount = connections.filter(
    (c) => c.status === "pending" && c.user_id !== user?.id,
  ).length;

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const navItems = user
    ? [
        {
          path: "/threads",
          label: "Threads",
          icon: <MessageSquareText className="h-4 w-4 " />,
          badge: Object.keys(threadCounts).length || undefined,
        },
        {
          path: "/messages",
          label: "Messages",
          icon: <MessageSquare className="h-4 w-4 " />,
          badge: totalUnread || undefined,
        },
        {
          path: "/connections",
          label: "Connections",
          icon: <BookUser className="h-4 w-4 " />,
          badge: pendingIncomingCount || undefined,
        },
        {
          path: "/children",
          label: "Children Profiles",
          icon: <Baby className="h-4 w-4 " />,
        },
        {
          path: "/documents",
          label: "Documents",
          icon: <FileText className="h-4 w-4 " />,
        },
        {
          path: "/calendar",
          label: "Calendar",
          icon: <Calendar className="h-4 w-4 " />,
        },
        {
          path: "/expenses",
          label: "Expenses",
          icon: <Receipt className="h-4 w-4 " />,
        },
      ]
    : [];

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {navItems.map((item) => (
              <CommandItem
                key={item.path}
                onSelect={() => {
                  setOpen(false);
                  navigate(item.path);
                }}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {item.badge}
                  </span>
                )}
              </CommandItem>
            ))}
            <CommandItem
              onSelect={() => {
                setOpen(false);
                navigate("/feature-request");
              }}
            >
              <Sparkles className="h-4 w-4" />
              <span>Feature Request</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Account">
            <CommandItem
              onSelect={() => {
                setOpen(false);
                navigate("/account");
              }}
            >
              <BadgeCheck className="h-4 w-4" />
              <span>Account</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpen(false);
                navigate("/billing");
              }}
            >
              <FileText className="h-4 w-4" />
              <span>Billing</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpen(false);
                navigate("/integrations");
              }}
            >
              <Link2 className="h-4 w-4" />
              <span>Integrations</span>
            </CommandItem>
            <CommandItem onSelect={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem onSelect={toggleTheme}>
              {theme === "dark" ? (
                <>
                  <Sun className="h-4 w-4" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  <span>Dark Mode</span>
                </>
              )}
            </CommandItem>
          </CommandGroup>
          {user?.id === "09b77fc6-776c-4b4a-bd8c-96bb7997516e" && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Advanced">
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setIsDemoModeOpen(true);
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Demo Mode</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setIsSystemPromptOpen(true);
                  }}
                >
                  <Settings className="h-4 w-4" />
                  <span>Update System Prompt</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
      <SystemPromptDialog
        open={isSystemPromptOpen}
        onOpenChange={setIsSystemPromptOpen}
      />
      <DemoModeDialog open={isDemoModeOpen} onOpenChange={setIsDemoModeOpen} />
    </>
  );
}
