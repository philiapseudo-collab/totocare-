import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile } from "@/hooks/useProfile";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Calendar, Droplet } from "lucide-react";
import { VisualHealthCard } from "@/components/VisualHealthCard";
import { useAppTranslation } from "@/hooks/useAppTranslation";

interface Metric {
  id: string;
  value: string;
  label: string;
  unit?: string;
}

export function KeyMetrics() {
  const { t } = useAppTranslation();
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
        <CardTitle className="text-lg font-semibold" data-i18n="healthStats.title">📊 {t("healthStats.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {pregnancy && (
            <VisualHealthCard
              icon={Calendar}
              emoji="🤰"
              title={t("healthStats.pregnancyWeek")}
              value={pregnancy.current_week?.toString() || "-"}
              unit={t("healthStats.weeks")}
              color="blue"
            />
          )}
          {profile?.blood_group && (
            <VisualHealthCard
              icon={Droplet}
              emoji="🩸"
              title={t("healthStats.bloodType")}
              value={profile.blood_group}
              color="red"
            />
          )}
        </div>

        {pregnancy && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">👶</span>
              <h4 className="text-sm font-semibold text-foreground" data-i18n="healthStats.babyDevelopment">
                {t("healthStats.babyDevelopment", { week: pregnancy.current_week })}
              </h4>
            </div>
            {loadingDevelopment ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm" data-i18n="healthStats.loadingInfo">{t("healthStats.loadingInfo")}</span>
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