import { NavLink, useLocation } from "react-router-dom";
import { Home, Calendar, FileText, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Upcoming", path: "/upcoming", icon: Calendar },
  { name: "Journal", path: "/journal", icon: FileText },
  { name: "Profile", path: "/profile", icon: User },
];

export const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Don't show on auth pages or if not logged in
  if (!user || location.pathname.includes("/auth")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
