import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, AlertCircle } from "lucide-react";
import { useVaccinations } from "@/hooks/useVaccinations";
import { useVaccinationRecommendations } from "@/hooks/useVaccinationRecommendations";
import { useUpcomingInfantVaccinations } from "@/hooks/useUpcomingInfantVaccinations";
import { format } from "date-fns";
import { AddVaccinationDialog } from "@/components/forms/AddVaccinationDialog";
import { Separator } from "@/components/ui/separator";
import { VaccinationScheduleTable } from "@/components/VaccinationScheduleTable";
import { DeliveryNotification } from "@/components/DeliveryNotification";
import { toast } from "sonner";

const Vaccinations = () => {
  const {
    vaccinations,
    loading,
    refetch
  } = useVaccinations();
  
  const { recommendations, loading: loadingRecommendations } = useVaccinationRecommendations();
  
  // Get upcoming vaccinations based on infant age
  const {
    upcomingVaccinations,
    loading: loadingUpcoming,
    scheduleVaccination,
    markAsCompleted,
    refetch: refetchUpcoming
  } = useUpcomingInfantVaccinations();

  const handleScheduleVaccine = async (vaccinationData?: any) => {
    if (vaccinationData) {
      const success = await scheduleVaccination(vaccinationData);
      if (success) {
        toast.success('Vaccination scheduled successfully');
        refetch();
        refetchUpcoming();
      } else {
        toast.error('Failed to schedule vaccination');
      }
    } else {
      refetch();
      refetchUpcoming();
    }
  };

  const handleCompleteVaccine = async (vaccinationData?: any) => {
    if (vaccinationData) {
      const success = await markAsCompleted(vaccinationData);
      if (success) {
        toast.success('Vaccination marked as completed');
        refetch();
        refetchUpcoming();
      } else {
        toast.error('Failed to mark vaccination as completed');
      }
    } else {
      refetch();
      refetchUpcoming();
    }
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
        {/* Delivery Notification */}
        <DeliveryNotification />
        
        {/* Upcoming Vaccinations Section - Based on Infant Age */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Upcoming Vaccinations</CardTitle>
              <Badge variant="outline">{upcomingVaccinations.length} Due</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Automatically calculated based on infant age and immunization schedule
            </p>
          </CardHeader>
          <CardContent>
            {loadingUpcoming ? (
              <div className="text-center py-8 text-muted-foreground">Calculating upcoming vaccinations...</div>
            ) : upcomingVaccinations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">No upcoming vaccinations at this time.</p>
                <p className="text-sm text-muted-foreground">
                  {vaccinations.length === 0 
                    ? "Add an infant profile to see upcoming vaccinations based on their age."
                    : "All age-appropriate vaccinations are up to date!"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingVaccinations.map((vaccination, index) => (
                  <div key={`${vaccination.infant_id}-${vaccination.vaccine_name}-${index}`} className="border border-border rounded-lg p-4 bg-card hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground">{vaccination.vaccine_name}</h3>
                          <div className="flex flex-col gap-1 mt-1">
                            <p className="text-sm text-muted-foreground">
                              For: <span className="font-medium text-foreground">{vaccination.infant_name}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Dose {vaccination.dose_number} • Due at {vaccination.age_weeks ? `${vaccination.age_weeks} weeks` : `${vaccination.age_months} months`}
                            </p>
                            {vaccination.vaccine_details?.diseases && (
                              <p className="text-xs text-muted-foreground">
                                Protects against: {vaccination.vaccine_details.diseases.slice(0, 2).join(', ')}
                                {vaccination.vaccine_details.diseases.length > 2 && ` +${vaccination.vaccine_details.diseases.length - 2} more`}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-muted-foreground">Due Date</p>
                          <p className="font-semibold text-foreground">
                            {format(new Date(vaccination.due_date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleScheduleVaccine(vaccination)}
                          >
                            <Calendar className="w-3 h-3 mr-1" />
                            Schedule
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleCompleteVaccine(vaccination)}
                          >
                            Mark Done
                          </Button>
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
          onSchedule={() => {
            refetch();
            refetchUpcoming();
          }}
          onComplete={() => {
            refetch();
            refetchUpcoming();
          }}
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