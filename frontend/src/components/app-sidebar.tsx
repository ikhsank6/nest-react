import * as React from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import {
  SquareTerminal,
  LayoutDashboard,
  Users,
  Shield,
  Database,
  ChevronRight,
  LogOut,
  Command,
  ChevronsUpDown,
  Settings2,
  Sparkles,
  BadgeCheck,
  CreditCard,
  Bell,
  Menu,
  FileText,
  FolderOpen,
  Settings,
  Home,
  Box,
  Layers,
  PieChart,
  BarChart,
  Image,
  Newspaper,
  Info,
  type LucideIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore, type AuthMenu } from "@/stores/auth.store"
import { authService } from "@/services/auth.service"
import { profileService } from "@/services/profile.service"

// Icon map for dynamic menu rendering
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Shield,
  Database,
  SquareTerminal,
  Settings2,
  Menu,
  FileText,
  FolderOpen,
  Settings,
  Home,
  Box,
  Layers,
  PieChart,
  BarChart,
  Bell,
  Image,
  Newspaper,
  Info,
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const { user, menus } = useAuthStore()
  const navigate = useNavigate()
  const { isMobile } = useSidebar()
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false)
  const [avatarBlobUrl, setAvatarBlobUrl] = React.useState<string | undefined>(undefined)

  // Fetch avatar with auth token using profileService
  React.useEffect(() => {
    let isMounted = true;
    let currentBlobUrl: string | null = null;
    
    const fetchAvatar = async () => {
      if (!user?.avatar || !user?.uuid) {
        setAvatarBlobUrl(undefined);
        return;
      }

      const blob = await profileService.getAvatarBlob(user.uuid);
      if (isMounted && blob && blob instanceof Blob) {
        const blobUrl = URL.createObjectURL(blob);
        currentBlobUrl = blobUrl;
        setAvatarBlobUrl(blobUrl);
      }
    };

    fetchAvatar();

    return () => {
      isMounted = false;
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [user?.avatar, user?.uuid]);

  const handleLogout = () => {
    authService.logout()
    navigate("/login")
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {menus.map((menu: AuthMenu) => {
              const Icon = menu.icon ? iconMap[menu.icon] || SquareTerminal : SquareTerminal
              const hasChildren = menu.children && menu.children.length > 0
              
              // Check if current path matches menu or any of its children
              const isChildActive = menu.children?.some((child: AuthMenu) => 
                child.path && location.pathname.startsWith(child.path)
              )
              const isMenuActive = menu.path ? location.pathname.startsWith(menu.path) : false
              const isActive = isMenuActive || isChildActive

              if (hasChildren) {
                return (
                  <Collapsible
                    key={menu.uuid}
                    asChild
                    defaultOpen={isActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={menu.name} isActive={isActive}>
                          <Icon />
                          <span>{menu.name}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {menu.children?.map((subItem: AuthMenu) => {
                            const isSubActive = subItem.path ? location.pathname.startsWith(subItem.path) : false
                            return (
                              <SidebarMenuSubItem key={subItem.uuid}>
                                <SidebarMenuSubButton asChild isActive={isSubActive}>
                                  <Link to={subItem.path || "#"}>
                                    <span>{subItem.name}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              }

              return (
                <SidebarMenuItem key={menu.uuid}>
                  <SidebarMenuButton
                    asChild
                    tooltip={menu.name}
                    isActive={isActive}
                  >
                    <Link to={menu.path || "#"}>
                      <Icon />
                      <span>{menu.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.avatar ? avatarBlobUrl : undefined} alt={user?.name} />
                    <AvatarFallback className="rounded-lg">{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.avatar ? avatarBlobUrl : undefined} alt={user?.name} />
                      <AvatarFallback className="rounded-lg">{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.name}</span>
                      <span className="truncate text-xs">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Sparkles className="mr-2 size-4" />
                    Upgrade to Pro
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={() => navigate('/profile')}>
                    <BadgeCheck className="mr-2 size-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings2 className="mr-2 size-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="mr-2 size-4" />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate('/notifications')}>
                    <Bell className="mr-2 size-4" />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onSelect={(e) => {
                    e.preventDefault()
                    setShowLogoutDialog(true)
                  }}
                >
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin keluar dari akun Anda? Anda perlu login kembali untuk mengakses dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              Ya, Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  )
}
