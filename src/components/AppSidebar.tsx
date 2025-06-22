import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LogIn,
  LogOut,
  FileText,
  ChevronDownIcon,
  ChevronUpIcon,
  Sparkles,
  BadgeCheck,
  Calendar,
  Link2,
  MessageSquareText,
  BookUser,
  Baby,
  MessageSquare,
  DollarSign,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useConnections } from '@/hooks/useConnections';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { totalUnread, threadCounts } = useUnreadMessages();
  const { connections } = useConnections();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const { t } = useTranslation('sidebar');

  // Calculate pending incoming connections
  const pendingIncomingCount = connections.filter(
    (c) => c.status === 'pending' && c.id !== user.id
  ).length;

  const handleLogout = async () => {
    await signOut();
    toast(t('toastLoggedOut'), {
      description: t('toastLoggedOutDescription'),
    });
    navigate('/');
  };

  const getUserInitials = () => {
    return (user.user_metadata.username || user.email).charAt(0).toUpperCase();
  };

  const navItems = user
    ? [
        {
          path: '/threads',
          label: t('threads'),
          icon: <MessageSquareText className="h-4 w-4 mr-2" />,
          badge: Object.keys(threadCounts).length || undefined,
        },
        {
          path: '/messages',
          label: t('messages'),
          icon: <MessageSquare className="h-4 w-4 mr-2" />,
          badge: totalUnread || undefined,
        },
        {
          path: '/calendar',
          label: t('calendar'),
          icon: <Calendar className="h-4 w-4 mr-2" />,
        },
        {
          path: '/documents',
          label: t('documents'),
          icon: <FileText className="h-4 w-4 mr-2" />,
        },
        {
          path: '/expenses',
          label: t('expenses'),
          icon: <DollarSign className="h-4 w-4 mr-2" />,
        },
        {
          path: '/children',
          label: t('childrenProfiles'),
          icon: <Baby className="h-4 w-4 mr-2" />,
        },
        {
          path: '/connections',
          label: t('connections'),
          icon: <BookUser className="h-4 w-4 mr-2" />,
          badge: pendingIncomingCount || undefined,
        },
      ]
    : [];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex items-center space-x-2">
          <div
            className="inline-block w-8 h-8 min-w-8 min-h-8 bg-[url('../public/logo.png')] bg-center bg-cover bg-no-repeat mr-1"
            role="img"
            aria-label="Cactus"
          />
          {state === 'expanded' && (
            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap">{t('title')}</span>
            </div>
          )}
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
                  {state === 'collapsed' ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          asChild={false}
                          onClick={() => {
                            navigate(item.path);
                            if (isMobile) setOpenMobile(false);
                          }}
                          className="flex items-center w-full justify-start mb-1"
                        >
                          {item.icon}
                          {Array.isArray(item.label) ? (
                            <span className="flex items-center gap-2">
                              {item.label[0]}
                              {item.label[1]}
                            </span>
                          ) : (
                            <span>{item.label}</span>
                          )}
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={5}>
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <SidebarMenuButton
                      asChild={false}
                      onClick={() => {
                        navigate(item.path);
                        if (isMobile) setOpenMobile(false);
                      }}
                      className="flex items-center w-full justify-start mb-1"
                    >
                      {item.icon}
                      {Array.isArray(item.label) ? (
                        <span className="flex items-center gap-2">
                          {item.label[0]}
                          {item.label[1]}
                        </span>
                      ) : (
                        <span>{item.label}</span>
                      )}
                    </SidebarMenuButton>
                  )}
                  {item.badge !== undefined && (
                    <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
              {/* Feature Request Button */}
              <SidebarMenuItem>
                {state === 'collapsed' ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton
                        asChild={false}
                        onClick={() => {
                          navigate('/feature-request');
                          if (isMobile) setOpenMobile(false);
                        }}
                        className="flex items-center w-full justify-start mb-1"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        <span>{t('featureRequest')}</span>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={5}>
                      {t('featureRequest')}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <SidebarMenuButton
                    asChild={false}
                    onClick={() => {
                      navigate('/feature-request');
                      if (isMobile) setOpenMobile(false);
                    }}
                    className="flex items-center w-full justify-start mb-1"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span>{t('featureRequest')}</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
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
                      {user.user_metadata?.name || user.email}
                    </span>
                    <span className="ml-auto flex flex-col justify-center">
                      <ChevronUpIcon className="h-3 w-4" />
                      <ChevronDownIcon className="h-3 w-4 -mt-1" />
                    </span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="end"
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
                        {user.user_metadata?.name || user.email}
                      </span>
                      {user.user_metadata?.name && (
                        <span className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </span>
                      )}
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
                    <Link
                      to="/account"
                      className="flex items-center w-full"
                      onClick={() => isMobile && setOpenMobile(false)}
                    >
                      <BadgeCheck className="h-4 w-4 mr-2" /> {t('account')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center w-full"
                    asChild
                  >
                    <Link
                      to="/billing"
                      className="flex items-center w-full"
                      onClick={() => isMobile && setOpenMobile(false)}
                    >
                      <FileText className="h-4 w-4 mr-2" /> {t('billing')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center w-full">
                    <Link
                      className="flex items-center w-full"
                      to="/integrations"
                      onClick={() => isMobile && setOpenMobile(false)}
                    >
                      <Link2 className="h-4 w-4 mr-4" /> {t('integrations')}
                    </Link>
                  </DropdownMenuItem>
                  <div className="my-1">
                    <hr className="border-border" />
                  </div>
                  <DropdownMenuItem
                    onSelect={handleLogout}
                    className="flex items-center w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> {t('logOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <Button asChild className="w-full">
            <Link to="/auth">
              <LogIn className="h-4 w-4 mr-2" /> {t('signIn')}
            </Link>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
