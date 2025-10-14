import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMedicationAlerts } from "@/hooks/useMedicationAlerts";
import { Loader2, AlertTriangle, CheckCircle2, AlertCircle, Bookmark, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MedicationAlert = () => {
  const [drugName, setDrugName] = useState("");
  const [patientType, setPatientType] = useState<"pregnancy" | "breastfeeding" | "infant">("pregnancy");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    category: string;
    risk_level: string;
    alert_message: string;
  } | null>(null);

  const { alerts, isLoading, saveAlert, updateBookmark, deleteAlert } = useMedicationAlerts();

  const handleCheck = async () => {
    if (!drugName.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('check-drug-safety', {
        body: { drugName: drugName.trim(), patientType }
      });

      if (error) throw error;

      setResult(data);
      
      // Save to history
      saveAlert({
        drug_name: drugName.trim(),
        category: data.category,
        risk_level: data.risk_level,
        alert_message: data.alert_message,
        is_bookmarked: false,
        patient_type: patientType,
      });
    } catch (error) {
      console.error('Error checking drug safety:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low risk":
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      case "Moderate caution":
        return <AlertCircle className="h-6 w-6 text-orange-600" />;
      case "High risk":
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      default:
        return <AlertCircle className="h-6 w-6 text-gray-600" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low risk":
        return "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800";
      case "Moderate caution":
        return "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800";
      case "High risk":
        return "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800";
      default:
        return "bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800";
    }
  };

  const bookmarkedAlerts = alerts?.filter(a => a.is_bookmarked) || [];
  const recentAlerts = alerts?.filter(a => !a.is_bookmarked).slice(0, 10) || [];

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Drug Safety Alert</h1>
        <p className="text-muted-foreground">
          Check drug safety for pregnancy, breastfeeding, or infant care
        </p>
      </div>

      {/* Disclaimer */}
      <Alert className="border-2 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          <strong>Disclaimer:</strong> Information provided is for awareness purposes only. 
          Always consult a healthcare professional before taking any medication.
        </AlertDescription>
      </Alert>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Check a Drug</CardTitle>
          <CardDescription>
            Enter the name of a drug, prescription, or substance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Patient Type</label>
              <Select value={patientType} onValueChange={(value: any) => setPatientType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pregnancy">During Pregnancy</SelectItem>
                  <SelectItem value="breastfeeding">While Breastfeeding</SelectItem>
                  <SelectItem value="infant">For Infant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Paracetamol, Ibuprofen, Alcohol"
                value={drugName}
                onChange={(e) => setDrugName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
                disabled={loading}
              />
              <Button onClick={handleCheck} disabled={loading || !drugName.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking
                  </>
                ) : (
                  'Check'
                )}
              </Button>
            </div>
          </div>

          {/* Result Display */}
          {result && (
            <Card className={`border-2 ${getRiskColor(result.risk_level)}`}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getRiskIcon(result.risk_level)}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{result.category}</Badge>
                      <Badge variant="secondary">{result.risk_level}</Badge>
                    </div>
                    <p className="text-lg font-medium leading-relaxed">
                      {result.alert_message}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Bookmarked Safe Drugs */}
      {bookmarkedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              Bookmarked Safe Drugs
            </CardTitle>
            <CardDescription>
              Your saved reference for quick access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookmarkedAlerts.map((alert) => (
                <Card key={alert.id} className="border">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="font-semibold">{alert.drug_name}</h4>
                          <Badge variant="outline" className="text-xs">{alert.category}</Badge>
                          <Badge variant="secondary" className="text-xs">{alert.risk_level}</Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {alert.patient_type === "pregnancy" ? "Pregnancy" : alert.patient_type === "breastfeeding" ? "Breastfeeding" : "Infant"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.alert_message}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateBookmark({ id: alert.id, is_bookmarked: false })}
                        >
                          <Bookmark className="h-4 w-4 fill-current" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAlert(alert.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search History */}
      {recentAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Searches</CardTitle>
            <CardDescription>
              Your drug safety check history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <Card key={alert.id} className="border">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="font-semibold">{alert.drug_name}</h4>
                          <Badge variant="outline" className="text-xs">{alert.category}</Badge>
                          <Badge variant="secondary" className="text-xs">{alert.risk_level}</Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {alert.patient_type === "pregnancy" ? "Pregnancy" : alert.patient_type === "breastfeeding" ? "Breastfeeding" : "Infant"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.alert_message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(alert.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateBookmark({ id: alert.id, is_bookmarked: true })}
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAlert(alert.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MedicationAlert;