import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SmartBackButtonProps {
  className?: string;
  fallbackPath?: string;
}

export const SmartBackButton = ({ className, fallbackPath = "/" }: SmartBackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1 && document.referrer) {
      navigate(-1);
    } else {
      // If no history, go to fallback path
      navigate(fallbackPath);
    }
  };

  // Don't show back button on home page
  if (location.pathname === "/") {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={cn("gap-2", className)}
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
};
