import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Syringe,
  Calendar,
  Heart,
  Activity,
  Search,
  FileText,
  BookOpen,
  HelpCircle,
  Info,
  User,
  Badge as BadgeIcon,
  Microscope,
  AlertTriangle
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

// Navigation items for different sections
const overviewItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
];

const healthItems = [
  {
    title: "Journal",
    url: "/journal", 
    icon: FileText,
  },
  {
    title: "Vaccinations",
    url: "/vaccinations",
    icon: Syringe,
    badge: "3"
  },
  {
    title: "Clinic Visits",
    url: "/clinic-visits",
    icon: Calendar,
  },
  {
    title: "Reproductive Health", 
    url: "/reproductive-health",
    icon: Heart,
  },
  {
    title: "Screenings",
    url: "/screenings",
    icon: Microscope,
  },
  {
    title: "Conditions",
    url: "/conditions",
    icon: AlertTriangle,
  },
];

const resourceItems = [
  {
    title: "Guides",
    url: "/guides",
    icon: BookOpen,
  },
  {
    title: "Support",
    url: "/support", 
    icon: HelpCircle,
  },
  {
    title: "FAQ",
    url: "/faq",
    icon: HelpCircle,
  },
  {
    title: "About",
    url: "/about",
    icon: Info,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50";

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <SidebarContent>
        {/* Search Bar */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sidebar-foreground/60" />
            <Input 
              placeholder="Search" 
              className="pl-9 bg-sidebar-accent/20 border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/60"
            />
          </div>
        </div>

        {/* Overview Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 px-4">Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {overviewItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-3 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Health Section - No label to match design */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {healthItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="mr-3 h-4 w-4" />
                      {!collapsed && (
                        <div className="flex items-center justify-between w-full">
                          <span>{item.title}</span>
                          {item.badge && (
                            <span className="ml-auto bg-sidebar-primary text-sidebar-primary-foreground px-2 py-0.5 rounded text-xs">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Resources Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 px-4">Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="mr-3 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Profile Footer */}
      <SidebarFooter>
        <div className="flex items-center gap-3 p-4 border-t border-sidebar-border">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
            A
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground">Ava Patel</p>
              <p className="text-xs text-sidebar-foreground/70">Parent</p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}