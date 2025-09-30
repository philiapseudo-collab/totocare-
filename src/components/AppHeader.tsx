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
  AlertTriangle,
  LogOut,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

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

export function AppHeader() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">N</span>
          </div>
          <span className="font-semibold text-foreground hidden sm:block">NurtureCare</span>
          <span className="font-semibold text-foreground sm:hidden">NC</span>
        </div>

        {/* Main Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            {/* Dashboard */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 ${
                      isActive ? 'bg-accent text-accent-foreground' : ''
                    }`
                  }
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </NavLink>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Health Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>Health</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                  {healthItems.map((item) => (
                    <li key={item.title}>
                      <NavigationMenuLink asChild>
                        <NavLink
                          to={item.url}
                          className={({ isActive }) =>
                            `block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                              isActive ? 'bg-accent text-accent-foreground' : ''
                            }`
                          }
                        >
                          <div className="flex items-center gap-2 text-sm font-medium leading-none">
                            <item.icon className="h-4 w-4" />
                            {item.title}
                            {item.badge && (
                              <span className="ml-auto bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                            {item.title === "Journal" && "Track daily health entries"}
                            {item.title === "Vaccinations" && "Manage vaccination schedules"}
                            {item.title === "Clinic Visits" && "Schedule and track appointments"}
                            {item.title === "Reproductive Health" && "Monitor reproductive wellness"}
                            {item.title === "Screenings" && "Track health screenings"}
                            {item.title === "Conditions" && "Monitor health conditions"}
                          </p>
                        </NavLink>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Resources Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                  {resourceItems.map((item) => (
                    <li key={item.title}>
                      <NavigationMenuLink asChild>
                        <NavLink
                          to={item.url}
                          className={({ isActive }) =>
                            `block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                              isActive ? 'bg-accent text-accent-foreground' : ''
                            }`
                          }
                        >
                          <div className="flex items-center gap-2 text-sm font-medium leading-none">
                            <item.icon className="h-4 w-4" />
                            {item.title}
                          </div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                            {item.title === "Guides" && "Educational health guides"}
                            {item.title === "Support" && "Get help and assistance"}
                            {item.title === "FAQ" && "Frequently asked questions"}
                            {item.title === "About" && "Learn more about NurtureCare"}
                          </p>
                        </NavLink>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 hidden xl:flex">
              <span>📋</span>
              <span className="hidden xl:inline">Today's Checklist</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2 hidden xl:flex">
              <span>👶</span>
              <span className="hidden xl:inline">Add Infant</span>
            </Button>
            <Button className="bg-status-scheduled hover:bg-status-scheduled/90 gap-2" size="sm" asChild>
              <NavLink to="/journal">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Journal</span>
              </NavLink>
            </Button>
          </div>
          
          {/* Mobile Action Button */}
          <div className="lg:hidden">
            <Button className="bg-status-scheduled hover:bg-status-scheduled/90" size="sm" asChild>
              <NavLink to="/journal">
                <FileText className="h-4 w-4" />
              </NavLink>
            </Button>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  A
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Ava Patel</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Parent
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Navigation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <NavLink to="/" className="flex items-center">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuLabel className="text-xs text-muted-foreground">Health</DropdownMenuLabel>
              {healthItems.map((item) => (
                <DropdownMenuItem key={item.title} asChild>
                  <NavLink to={item.url} className="flex items-center">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                    {item.badge && (
                      <span className="ml-auto bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">Resources</DropdownMenuLabel>
              {resourceItems.map((item) => (
                <DropdownMenuItem key={item.title} asChild>
                  <NavLink to={item.url} className="flex items-center">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </NavLink>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}