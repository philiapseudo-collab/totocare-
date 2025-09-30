import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Droplet, Pill, Heart, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  progress?: { current: number; total: number };
  status: "due" | "completed" | "track";
  icon: React.ReactNode;
}

export function TodaysChecklist() {
  const checklistItems: ChecklistItem[] = [
    {
      id: "hydration",
      title: "Hydration",
      description: "8 glasses of water",
      progress: { current: 0, total: 8 },
      status: "track",
      icon: <Droplet className="w-4 h-4 text-blue-500" />
    },
    {
      id: "prenatal-vitamin",
      title: "Prenatal vitamin", 
      description: "Once daily",
      status: "due",
      icon: <Pill className="w-4 h-4 text-orange-500" />
    },
    {
      id: "fetal-movement",
      title: "Fetal movement",
      description: "Count kicks",
      status: "track",
      icon: <Heart className="w-4 h-4 text-pink-500" />
    }
  ];

  const getStatusBadge = (status: string, progress?: { current: number; total: number }) => {
    if (progress) {
      return <Badge variant="outline" className="text-muted-foreground">{progress.current}/{progress.total}</Badge>;
    }
    
    switch (status) {
      case "due":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Due</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
      case "track":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Track</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Today's Checklist</CardTitle>
            <p className="text-sm text-muted-foreground">Quick tasks to keep you on track</p>
          </div>
          <Link to="/checklist-detail">
            <Button variant="ghost" size="sm">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {checklistItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div className="flex items-center gap-3 flex-1">
              {item.icon}
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
            <div className="ml-4">
              {getStatusBadge(item.status, item.progress)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}