import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile } from "@/hooks/useProfile";

interface Metric {
  id: string;
  value: string;
  label: string;
  unit?: string;
}

export function KeyMetrics() {
  const { profile, pregnancy } = useProfile();

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const metrics: Metric[] = [
    ...(pregnancy ? [{
      id: "gestational-age",
      value: pregnancy.current_week?.toString() || "-",
      unit: "w",
      label: "Gestational age"
    }] : []),
    ...(profile?.current_weight ? [{
      id: "current-weight", 
      value: profile.current_weight.toFixed(1),
      unit: "kg",
      label: "Current weight"
    }] : []),
    ...(profile?.blood_group ? [{
      id: "blood-group",
      value: profile.blood_group,
      unit: "",
      label: "Blood group"
    }] : []),
    ...(profile?.date_of_birth ? [{
      id: "age",
      value: calculateAge(profile.date_of_birth).toString(),
      unit: "years",
      label: "Age"
    }] : [])
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Key Metrics</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}