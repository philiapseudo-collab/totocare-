import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, AlertCircle } from "lucide-react";
import { useVaccinations } from "@/hooks/useVaccinations";
import { useVaccinationRecommendations } from "@/hooks/useVaccinationRecommendations";
import { format } from "date-fns";
import { AddVaccinationDialog } from "@/components/forms/AddVaccinationDialog";
import { Separator } from "@/components/ui/separator";
import { VaccinationScheduleTable } from "@/components/VaccinationScheduleTable";
import { toast } from "sonner";
const Vaccinations = () => {
  const {
    vaccinations,
    loading,
    refetch
  } = useVaccinations();
  
  const { recommendations, loading: loadingRecommendations } = useVaccinationRecommendations();

  const handleScheduleVaccine = (vaccine: string, dose: number) => {
    toast.success(`${vaccine} - Dose ${dose} marked as scheduled`);
  };

  const handleCompleteVaccine = (vaccine: string, dose: number) => {
    toast.success(`${vaccine} - Dose ${dose} marked as completed`);
  };

  return <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
              <span>Home</span>
              <span>›</span>
              <span>Dashboard</span>
              <span>›</span>
              <span className="text-foreground font-medium">Vaccinations • 3 Due</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Due Vaccinations</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              Export
            </Button>
            <AddVaccinationDialog trigger={<Button size="sm" className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vaccination
                </Button>} onSuccess={refetch} />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Due Vaccinations Section - Now at the top */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Due Vaccinations</CardTitle>
              <div className="flex space-x-2">
                <Badge variant="outline">Due</Badge>
                <Badge variant="outline">Overdue</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading vaccinations...</div>
            ) : vaccinations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No vaccinations found</p>
                <AddVaccinationDialog 
                  trigger={
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Vaccination
                    </Button>
                  } 
                  onSuccess={refetch} 
                />
              </div>
            ) : (
              <div className="space-y-3">
                {vaccinations.map(vaccination => (
                  <div key={vaccination.id} className="border border-border rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        {vaccination.status === "overdue" ? (
                          <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
                        ) : (
                          <Calendar className="w-5 h-5 text-warning flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium">{vaccination.vaccine_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {vaccination.patient_type}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="text-left sm:text-right">
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-medium">
                            {vaccination.administered_date 
                              ? format(new Date(vaccination.administered_date), 'MMM dd, yyyy')
                              : format(new Date(vaccination.scheduled_date), 'MMM dd, yyyy')
                            }
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {vaccination.status === "completed" ? (
                            <Badge variant="default">Completed</Badge>
                          ) : (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleScheduleVaccine(vaccination.vaccine_name, 1)}
                              >
                                <Calendar className="w-3 h-3 mr-1" />
                                Schedule
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleCompleteVaccine(vaccination.vaccine_name, 1)}
                              >
                                Mark Done
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Kenya Vaccination Schedule Table */}
        <VaccinationScheduleTable 
          onSchedule={handleScheduleVaccine}
          onComplete={handleCompleteVaccine}
        />

        {/* Suggested Vaccinations */}
        {!loadingRecommendations && recommendations.length > 0 && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Suggested Vaccinations (Kenya Schedule)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Based on infant age and gestational age
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 bg-muted/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-medium">{rec.vaccine_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          For: {rec.patient_name} ({rec.patient_type})
                          {rec.age_months !== null && ` • ${rec.age_months} months`}
                          {rec.gestational_timing && ` • ${rec.gestational_timing}`}
                          {rec.dose_number && ` • Dose ${rec.dose_number}`}
                        </p>
                      </div>
                      <AddVaccinationDialog
                        trigger={
                          <Button size="sm" variant="default">
                            <Plus className="w-4 h-4 mr-2" />
                            Add to Schedule
                          </Button>
                        }
                        onSuccess={refetch}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>;
};
export default Vaccinations;