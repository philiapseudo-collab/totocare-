import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile } from "@/hooks/useProfile";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Metric {
  id: string;
  value: string;
  label: string;
  unit?: string;
}

export function KeyMetrics() {
  const { profile, pregnancy } = useProfile();
  const [fetalDevelopment, setFetalDevelopment] = useState<string>("");
  const [loadingDevelopment, setLoadingDevelopment] = useState(false);

  useEffect(() => {
    const fetchFetalDevelopment = async () => {
      if (!pregnancy?.current_week) return;
      
      setLoadingDevelopment(true);
      try {
        const { data, error } = await supabase.functions.invoke('fetal-development', {
          body: { week: pregnancy.current_week }
        });

        if (error) throw error;
        setFetalDevelopment(data.development);
      } catch (error) {
        console.error('Error fetching fetal development:', error);
        setFetalDevelopment("Unable to load development information.");
      } finally {
        setLoadingDevelopment(false);
      }
    };

    fetchFetalDevelopment();
  }, [pregnancy?.current_week]);

  const metrics: Metric[] = [
    ...(pregnancy ? [{
      id: "gestational-age",
      value: pregnancy.current_week?.toString() || "-",
      unit: "w",
      label: "Gestational age"
    }] : []),
    ...(profile?.blood_group ? [{
      id: "blood-group",
      value: profile.blood_group,
      unit: "",
      label: "Blood group"
    }] : [])
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Health Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <div key={metric.id} className="text-center p-4 bg-secondary/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {metric.value}
                {metric.unit && <span className="text-lg ml-1">{metric.unit}</span>}
              </div>
              <p className="text-sm text-muted-foreground mt-1 break-words">{metric.label}</p>
            </div>
          ))}
        </div>

        {pregnancy && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground mb-2">
              Week {pregnancy.current_week} Fetal Development
            </h4>
            {loadingDevelopment ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading development info...</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {fetalDevelopment}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}