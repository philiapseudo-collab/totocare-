import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, AlertTriangle, CheckCircle, History, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSymptomHistory } from '@/hooks/useSymptomHistory';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface AnalysisResult {
  severity_level: 'normal' | 'monitor' | 'urgent';
  assessment: string;
  explanation: string;
  recommendation: string;
}

export default function SymptomChecker() {
  const navigate = useNavigate();
  const [symptom, setSymptom] = useState('');
  const [patientType, setPatientType] = useState<'pregnancy' | 'breastfeeding' | 'infant'>('pregnancy');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const { symptoms, isLoading, saveSymptom, deleteSymptom } = useSymptomHistory();

  const handleCheck = async () => {
    if (!symptom.trim()) {
      toast.error('Please describe your symptom');
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-symptom', {
        body: { symptomDescription: symptom, patientType }
      });

      if (error) throw error;

      setResult(data);
    } catch (error: any) {
      toast.error('Failed to analyze symptom. Please try again.');
      console.error('Symptom analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (result) {
      saveSymptom.mutate({
        symptom_description: symptom,
        ai_assessment: result.assessment,
        severity_level: result.severity_level,
        ai_explanation: `${result.explanation}\n\nRecommendation: ${result.recommendation}`
      });
    }
  };

  const getSeverityIcon = (level: string) => {
    switch (level) {
      case 'normal':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'monitor':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'urgent':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'normal':
        return 'border-green-500/30 bg-green-500/10 dark:border-green-500/50 dark:bg-green-500/20';
      case 'monitor':
        return 'border-yellow-500/30 bg-yellow-500/10 dark:border-yellow-500/50 dark:bg-yellow-500/20';
      case 'urgent':
        return 'border-red-500/30 bg-red-500/10 dark:border-red-500/50 dark:bg-red-500/20';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Symptom Checker</h1>
            <p className="text-muted-foreground mt-1">
              Check symptoms for pregnancy, breastfeeding, or infant care
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
            className="gap-2"
          >
            <History className="h-4 w-4" />
            History
          </Button>
        </div>

        {/* Disclaimer */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important Notice</AlertTitle>
          <AlertDescription>
            This symptom checker provides general guidance based on Kenya Ministry of Health guidelines.
            It is not a substitute for professional medical advice, diagnosis, or treatment.
            Always consult your healthcare provider for medical concerns.
          </AlertDescription>
        </Alert>

        {/* Main Input Card */}
        <Card>
          <CardHeader>
            <CardTitle>Describe Your Symptom</CardTitle>
            <CardDescription>
              Be as specific as possible about the symptoms you're experiencing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            
            <Textarea
              placeholder={
                patientType === 'pregnancy' 
                  ? "Example: I'm experiencing heavy bleeding..." 
                  : patientType === 'breastfeeding'
                  ? "Example: I have breast pain and fever..."
                  : "Example: Baby has a high fever and rash..."
              }
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              className="min-h-[120px]"
              disabled={analyzing}
            />
            <Button 
              onClick={handleCheck} 
              disabled={analyzing || !symptom.trim()}
              className="w-full"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Check Symptom'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card className={`${getSeverityColor(result.severity_level)} border-2`}>
            <CardHeader>
              <div className="flex items-center gap-2">
                {getSeverityIcon(result.severity_level)}
                <CardTitle className="text-xl">Analysis Results</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Assessment</h3>
                <p className="text-foreground">{result.assessment}</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  Explanation
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Based on Kenya Ministry of Health guidelines and medical best practices</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h3>
                <p className="text-foreground">{result.explanation}</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-2">Recommended Action</h3>
                <p className="text-foreground">{result.recommendation}</p>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={handleSave} variant="outline" className="flex-1">
                  Save to History
                </Button>
                <Button onClick={() => { setSymptom(''); setResult(null); }} variant="secondary" className="flex-1">
                  Check Another Symptom
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Section */}
        {showHistory && (
          <Card>
            <CardHeader>
              <CardTitle>Symptom History</CardTitle>
              <CardDescription>
                Your previously checked symptoms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : symptoms && symptoms.length > 0 ? (
                <div className="space-y-4">
                  {symptoms.map((entry) => (
                    <Card key={entry.id} className={`${getSeverityColor(entry.severity_level)}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getSeverityIcon(entry.severity_level)}
                              <span className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="font-medium mb-1">{entry.symptom_description}</p>
                            <p className="text-sm text-muted-foreground">{entry.ai_assessment}</p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="shrink-0">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete symptom entry?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete this symptom entry from your history.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteSymptom.mutate(entry.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No symptom history yet</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
