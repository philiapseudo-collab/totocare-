import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Phone, Shield, Info } from "lucide-react";
import { useAppTranslation } from "@/hooks/useAppTranslation";

interface RiskAssessmentPanelProps {
  level: string;
  score: number;
  factors: string[];
  activeConditions: number;
  activeMedications: number;
}

export function RiskAssessmentPanel({ 
  level, 
  score, 
  factors, 
  activeConditions,
  activeMedications 
}: RiskAssessmentPanelProps) {
  const { t } = useAppTranslation();

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskIcon = (level: string) => {
    if (level === 'low') return <Shield className="h-5 w-5" />;
    return <AlertTriangle className="h-5 w-5" />;
  };

  const getRecommendations = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical':
        return ['Immediate medical attention required', 'Contact healthcare provider today', 'Do not delay care'];
      case 'high':
        return ['Increased monitoring recommended', 'Consult specialist', 'More frequent visits needed'];
      case 'moderate':
        return ['Regular monitoring advised', 'Follow care plan closely', 'Report any changes'];
      case 'low':
        return ['Continue routine care', 'Maintain healthy lifestyle', 'Keep scheduled appointments'];
      default:
        return ['Consult with your healthcare provider'];
    }
  };

  const shouldShowContactButton = level === 'high' || level === 'critical';

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {getRiskIcon(level)}
            Risk Assessment
          </span>
          <Badge className={getRiskColor(level)} variant="default">
            {level.toUpperCase()}
          </Badge>
        </CardTitle>
        <CardDescription>Health risk evaluation and recommendations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">Risk Score</span>
          <span className="text-2xl font-bold">{score}</span>
        </div>

        {factors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Identified Risk Factors:</h4>
            <ul className="space-y-2">
              {factors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 mt-0.5 text-orange-500 flex-shrink-0" />
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">Active Conditions</div>
            <div className="text-2xl font-bold">{activeConditions}</div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">Medications</div>
            <div className="text-2xl font-bold">{activeMedications}</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Info className="h-4 w-4" />
            Recommendations:
          </h4>
          <ul className="space-y-1.5">
            {getRecommendations(level).map((rec, idx) => (
              <li key={idx} className="text-sm text-muted-foreground pl-6">
                • {rec}
              </li>
            ))}
          </ul>
        </div>

        {shouldShowContactButton && (
          <Button className="w-full" variant="default">
            <Phone className="h-4 w-4 mr-2" />
            Contact Healthcare Provider
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
