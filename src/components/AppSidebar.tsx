import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationBadge } from "@/components/ui/notification-badge";
import {
  MessageSquare,
  LogIn,
  LogOut,
  Users,
  Settings,
  FileText,
  Search,
  ChevronDownIcon,
  ChevronUpIcon,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { totalUnread } = useUnreadMessages();
  const [profileEmoji, setProfileEmoji] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadEmoji = async () => {
      if (!user) {
        setProfileEmoji(null);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("profile_emoji")
        .eq("id", user.id)
        .maybeSingle();
      if (!error && data) {
        setProfileEmoji(data.profile_emoji ?? null);
      }
    };
    loadEmoji();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  const getUserInitials = () => {
    if (!user) return "?";
    const displayName = user.user_metadata?.username || user.email;
    if (!displayName) return "?";
    if (user.user_metadata?.username) {
      return displayName.charAt(0).toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "?";
  };

  const navItems = user
    ? [
        {
          path: "/threads",
          label: "Threads",
          icon: <MessageSquare className="h-4 w-4 mr-2" />,
        },
        {
          path: "/connections",
          label: "Connections",
          icon: <Users className="h-4 w-4 mr-2" />,
        },
        {
          path: "/documents",
          label: "Documents",
          icon: <FileText className="h-4 w-4 mr-2" />,
        },
      ]
    : [];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar>
      <SidebarHeader>
        <Link to="/" className="flex items-center space-x-2 px-2 py-4">
          <span className="font-bold flex items-center">
            <span className="mr-1">🌵</span> Prickly Pear
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Starred</SidebarGroupLabel>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
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
                      {item.path === "/threads" && totalUnread > 0 && (
                        <NotificationBadge label={totalUnread} className="ml-2">
                          {""}
                        </NotificationBadge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
                      {profileEmoji ? (
                        <span className="text-xl flex items-center justify-center w-full h-full">
                          {profileEmoji}
                        </span>
                      ) : (
                        <>
                          <AvatarImage
                            src={user.user_metadata?.avatar_url}
                            alt="User avatar"
                          />
                          <AvatarFallback>{getUserInitials()}</AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <span className="truncate">
                      {user.user_metadata?.username ||
                        user.email ||
                        "My Account"}
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
                      {profileEmoji ? (
                        <span className="text-xl flex items-center justify-center w-full h-full">
                          {profileEmoji}
                        </span>
                      ) : (
                        <>
                          <AvatarImage
                            src={user.user_metadata?.avatar_url}
                            alt="User avatar"
                          />
                          <AvatarFallback>{getUserInitials()}</AvatarFallback>
                        </>
                      )}
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
                  <DropdownMenuItem className="flex items-center w-full">
                    <Sparkles className="h-4 w-4 mr-2" /> Upgrade plan
                  </DropdownMenuItem>
                  <div className="my-1">
                    <hr className="border-border" />
                  </div>
                  <DropdownMenuItem
                    className="flex items-center w-full"
                    asChild
                  >
                    <Link to="/account" className="flex items-center w-full">
                      <BadgeCheck className="h-4 w-4 mr-2" /> Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center w-full">
                    <FileText className="h-4 w-4 mr-2" /> Billing
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
