import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const routeNameMap: Record<string, string> = {
  dashboard: "Dashboard",
  analytics: "Analytics",
  profile: "Profile",
  "profile-setup": "Profile Setup",
  journal: "Journal",
  checklist: "Checklist",
  "quick-add": "Quick Add",
  upcoming: "Upcoming",
  "recent-activity": "Recent Activity",
  "add-infant": "Add Infant",
  vaccinations: "Vaccinations",
  conditions: "Conditions",
  medications: "Medications",
  "notification-settings": "Notification Settings",
  donate: "Donate",
  guides: "Guides",
  support: "Support",
  faq: "FAQ",
  about: "About",
  "checklist-detail": "Checklist Detail",
  "symptom-checker": "Symptom Checker",
  "medication-alert": "Medication Alert",
  "medication-analytics": "Medication Analytics",
  "my-cycle": "My Cycle",
  "cycle-onboarding": "Cycle Setup",
  "cycle-calendar": "Cycle Calendar",
  onboarding: "Getting Started",
  auth: "Sign In",
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  if (pathSegments.length === 0) {
    return null; // Don't show breadcrumbs on home page
  }

  const breadcrumbs = [
    { name: "Home", path: "/" },
    ...pathSegments.map((segment, index) => {
      const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
      const name = routeNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      return { name, path };
    }),
  ];

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={crumb.path} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
              {isLast ? (
                <span className="font-medium text-foreground">{crumb.name}</span>
              ) : (
                <Link
                  to={crumb.path}
                  className={cn(
                    "hover:text-foreground transition-colors",
                    index === 0 && "flex items-center gap-1"
                  )}
                >
                  {index === 0 && <Home className="h-4 w-4" />}
                  {crumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
