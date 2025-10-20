import { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  iconClassName?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  iconClassName = "text-muted-foreground"
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
      <div className={`mb-4 p-4 rounded-full bg-muted/50 ${iconClassName}`}>
        <Icon className="h-12 w-12" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-sm">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} className="gap-2">
          {action.label}
        </Button>
      )}
    </div>
  );
}
