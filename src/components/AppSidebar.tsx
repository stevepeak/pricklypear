import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarSeparator,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquare,
  LogIn,
  LogOut,
  Users,
  FileText,
  ChevronDownIcon,
  ChevronUpIcon,
  Sparkles,
  BadgeCheck,
  Calendar,
  Receipt,
  Link2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useConnections } from "@/hooks/useConnections";

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { totalUnread } = useUnreadMessages();
  const { connections } = useConnections();
  const { state } = useSidebar();

  // Calculate pending incoming connections
  const pendingIncomingCount = connections.filter(
    (c) => c.status === "pending" && c.user_id !== user.id,
  ).length;

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  const getUserInitials = () => {
    return (user.user_metadata.username || user.email).charAt(0).toUpperCase();
  };

  const navItems = user
    ? [
        {
          path: "/threads",
          label: "Threads",
          icon: <MessageSquare className="h-4 w-4 mr-2" />,
          badge: totalUnread > 0 ? totalUnread : undefined,
        },
        {
          path: "/connections",
          label: "Connections",
          icon: <Users className="h-4 w-4 mr-2" />,
          badge: pendingIncomingCount > 0 ? pendingIncomingCount : undefined,
        },
        {
          path: "/documents",
          label: "Documents (coming soon)",
          icon: <FileText className="h-4 w-4 mr-2" />,
        },
        {
          path: "/calendar",
          label: "Calendar (coming soon)",
          icon: <Calendar className="h-4 w-4 mr-2" />,
        },
        {
          path: "/expenses",
          label: "Expenses (coming soon)",
          icon: <Receipt className="h-4 w-4 mr-2" />,
        },
      ]
    : [];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex items-center space-x-2 px-2 py-4">
          <span className="mr-1">🌵</span>
          {state === "expanded" && <span>Prickly Pear</span>}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {/*
        <SidebarGroup>
          <SidebarGroupLabel>Starred</SidebarGroupLabel>
        </SidebarGroup>
        */}
        <SidebarGroup>
          {/* <SidebarGroupLabel>Tools</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.path}
                      className="flex items-center w-full justify-start mb-1"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.badge !== undefined && (
                    <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
              {/* Feature Request Button */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/feature-request"
                    className="flex items-center w-full justify-start mb-1"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span>Feature Request</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        {user ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-full px-2 py-2 flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.user_metadata?.avatar_url}
                        alt="User avatar"
                      />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <span className="truncate">
                      {user.user_metadata?.username || user.email}
                    </span>
                    <span className="ml-auto flex flex-col justify-center">
                      <ChevronUpIcon className="h-3 w-4" />
                      <ChevronDownIcon className="h-3 w-4 -mt-1" />
                    </span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="right"
                  className="w-[--radix-popper-anchor-width] mb-4"
                >
                  <div className="flex items-center gap-3 px-2 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.user_metadata?.avatar_url}
                        alt="User avatar"
                      />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate">
                        {user.user_metadata?.username ||
                          user.email ||
                          "My Account"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <div className="my-1">
                    <hr className="border-border" />
                  </div>
                  {/* 
                  <DropdownMenuItem className="flex items-center w-full">
                    <Sparkles className="h-4 w-4 mr-2" /> Upgrade plan
                  </DropdownMenuItem>
                  <div className="my-1">
                    <hr className="border-border" />
                  </div>
                  */}
                  <DropdownMenuItem
                    className="flex items-center w-full"
                    asChild
                  >
                    <Link to="/account" className="flex items-center w-full">
                      <BadgeCheck className="h-4 w-4 mr-2" /> Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center w-full"
                    asChild
                  >
                    <Link to="/billing" className="flex items-center w-full">
                      <FileText className="h-4 w-4 mr-2" /> Billing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center w-full">
                    <Link
                      className="flex items-center w-full"
                      to="/integrations"
                    >
                      <Link2 className="h-4 w-4 mr-4" /> Integrations
                    </Link>
                  </DropdownMenuItem>
                  <div className="my-1">
                    <hr className="border-border" />
                  </div>
                  <DropdownMenuItem
                    onSelect={handleLogout}
                    className="flex items-center w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <Button asChild className="w-full">
            <Link to="/auth">
              <LogIn className="h-4 w-4 mr-2" /> Sign In
            </Link>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
