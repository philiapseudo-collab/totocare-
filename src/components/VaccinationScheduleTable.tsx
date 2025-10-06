import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { differenceInWeeks, addDays } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VaccinationScheduleTableProps {
  onSchedule?: (vaccine: string, dose: number) => void;
  onComplete?: (vaccine: string, dose: number) => void;
}

export const VaccinationScheduleTable = ({ onSchedule, onComplete }: VaccinationScheduleTableProps) => {
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useProfile();

  // Fetch immunization schedule from database
  useEffect(() => {
    fetchScheduleData();
  }, []);

  // Fetch existing vaccinations and setup realtime
  useEffect(() => {
    if (!profile?.id) return;
    
    fetchVaccinations();
    
    // Setup realtime subscription
    const channel = supabase
      .channel('vaccinations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vaccinations'
        },
        () => {
          fetchVaccinations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const fetchScheduleData = async () => {
    try {
      const { data, error } = await supabase
        .from('immunization_schedule')
        .select('*')
        .order('age_weeks', { ascending: true, nullsFirst: false })
        .order('age_months', { ascending: true, nullsFirst: false });

      if (error) throw error;
      
      // Group by vaccine name
      const grouped = (data || []).reduce((acc: any, item: any) => {
        if (!acc[item.vaccine_name]) {
          acc[item.vaccine_name] = {
            vaccine: item.vaccine_name,
            doses: [],
            details: item.vaccine_details
          };
        }
        acc[item.vaccine_name].doses.push({
          doseNumber: item.dose_number,
          ageWeeks: item.age_weeks,
          ageMonths: item.age_months,
          timing: item.vaccine_details?.timing || 
                  (item.age_months ? `At ${item.age_months} months` : `At ${item.age_weeks} weeks`)
        });
        return acc;
      }, {});

      setScheduleData(Object.values(grouped));
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Failed to load vaccination schedule');
    } finally {
      setLoading(false);
    }
  };

  const fetchVaccinations = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('vaccinations')
        .select('*')
        .eq('patient_id', profile.id);

      if (error) throw error;
      setVaccinations(data || []);
    } catch (error) {
      console.error('Error fetching vaccinations:', error);
    }
  };

  const handleSchedule = async (vaccine: string, dose: number) => {
    if (!profile?.id) {
      toast.error('Please log in to schedule vaccinations');
      return;
    }

    try {
      const scheduledDate = addDays(new Date(), 7); // Schedule for next week by default

      const { error } = await supabase
        .from('vaccinations')
        .insert({
          vaccine_name: vaccine,
          patient_id: profile.id,
          patient_type: 'infant',
          scheduled_date: scheduledDate.toISOString().split('T')[0],
          status: 'due'
        });

      if (error) throw error;
      
      toast.success(`${vaccine} - Dose ${dose} scheduled`);
      onSchedule?.(vaccine, dose);
    } catch (error) {
      console.error('Error scheduling vaccination:', error);
      toast.error('Failed to schedule vaccination');
    }
  };

  const handleComplete = async (vaccine: string, dose: number) => {
    if (!profile?.id) {
      toast.error('Please log in to mark vaccinations');
      return;
    }

    try {
      // Check if vaccination exists
      const existing = vaccinations.find(
        v => v.vaccine_name === vaccine && v.status !== 'completed'
      );

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('vaccinations')
          .update({
            status: 'completed',
            administered_date: new Date().toISOString().split('T')[0]
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new completed record
        const { error } = await supabase
          .from('vaccinations')
          .insert({
            vaccine_name: vaccine,
            patient_id: profile.id,
            patient_type: 'infant',
            scheduled_date: new Date().toISOString().split('T')[0],
            administered_date: new Date().toISOString().split('T')[0],
            status: 'completed'
          });

        if (error) throw error;
      }
      
      toast.success(`${vaccine} - Dose ${dose} marked as completed`);
      onComplete?.(vaccine, dose);
    } catch (error) {
      console.error('Error completing vaccination:', error);
      toast.error('Failed to mark vaccination as completed');
    }
  };

  const getDoseStatus = (vaccine: string, dose: number) => {
    const vaccination = vaccinations.find(
      v => v.vaccine_name === vaccine && v.status !== 'overdue'
    );
    
    if (!vaccination) return undefined;
    
    if (vaccination.status === 'completed') return 'completed';
    if (vaccination.status === 'due') return 'scheduled';
    return undefined;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Kenya Routine Immunization Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading schedule...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Kenya Routine Immunization Schedule</CardTitle>
        <p className="text-sm text-muted-foreground">
          Official vaccination schedule - Mark doses as scheduled or completed
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-bold">Vaccine</TableHead>
                <TableHead className="font-bold">Diseases Prevented</TableHead>
                <TableHead className="font-bold">Number of Doses</TableHead>
                <TableHead className="font-bold">Age of Administration</TableHead>
                <TableHead className="font-bold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduleData.map((vaccine, index) => {
                const diseases = vaccine.details?.diseases || [];
                return (
                  <TableRow key={index} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{vaccine.vaccine}</TableCell>
                    <TableCell>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {diseases.map((disease: string, i: number) => (
                          <li key={i}>{disease}</li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell className="text-center">{vaccine.doses.length}</TableCell>
                    <TableCell>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {vaccine.doses.map((dose: any, i: number) => {
                          const status = getDoseStatus(vaccine.vaccine, dose.doseNumber);
                          return (
                            <li key={i} className="mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span>{dose.timing}</span>
                                {status && (
                                  <Badge 
                                    variant={status === 'completed' ? 'default' : 'outline'}
                                    className="text-xs"
                                  >
                                    {status === 'completed' ? 'Completed' : 'Scheduled'}
                                  </Badge>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {vaccine.doses.map((dose: any, i: number) => {
                          const status = getDoseStatus(vaccine.vaccine, dose.doseNumber);
                          return (
                            <div key={i} className="flex gap-1 items-center">
                              <span className="text-xs font-medium min-w-[50px]">Dose {dose.doseNumber}:</span>
                              {status === 'completed' ? (
                                <Badge variant="default" className="text-xs">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Done
                                </Badge>
                              ) : (
                                <div className="flex gap-1">
                                  {status === 'scheduled' ? (
                                    <>
                                      <Badge variant="outline" className="text-xs">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        Scheduled
                                      </Badge>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 px-2 text-xs"
                                        onClick={() => handleComplete(vaccine.vaccine, dose.doseNumber)}
                                      >
                                        <CheckCircle2 className="w-3 h-3" />
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 px-2 text-xs"
                                        onClick={() => handleSchedule(vaccine.vaccine, dose.doseNumber)}
                                      >
                                        <Calendar className="w-3 h-3 mr-1" />
                                        Schedule
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 px-2 text-xs"
                                        onClick={() => handleComplete(vaccine.vaccine, dose.doseNumber)}
                                      >
                                        <CheckCircle2 className="w-3 h-3" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
