import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { CheckCircle2, Calendar as CalendarIcon, Syringe, Stethoscope, FlaskConical, Clock } from "lucide-react";
import { format } from "date-fns";

interface ChecklistItem {
  id: string;
  type: "appointment" | "vaccination" | "screening";
  title: string;
  description?: string;
  date: string;
  status: string;
  originalDate: string;
}

const Checklist = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [reschedulingItem, setReschedulingItem] = useState<string | null>(null);

  const fetchTodaysItems = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Fetch appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', profile.id)
        .gte('appointment_date', todayStr)
        .lte('appointment_date', todayStr + 'T23:59:59')
        .eq('status', 'scheduled');

      // Fetch vaccinations
      const { data: vaccinations } = await supabase
        .from('vaccinations')
        .select('*')
        .eq('patient_id', profile.id)
        .eq('scheduled_date', todayStr)
        .in('status', ['due', 'overdue']);

      // Fetch screenings
      const { data: screenings } = await supabase
        .from('screenings')
        .select('*')
        .eq('patient_id', profile.id)
        .eq('scheduled_date', todayStr)
        .in('status', ['due']);

      // Combine all items
      const allItems: ChecklistItem[] = [
        ...(appointments || []).map(apt => ({
          id: apt.id,
          type: 'appointment' as const,
          title: apt.appointment_type,
          description: apt.notes,
          date: format(new Date(apt.appointment_date), 'MMM dd, yyyy h:mm a'),
          status: apt.status,
          originalDate: apt.appointment_date,
        })),
        ...(vaccinations || []).map(vac => ({
          id: vac.id,
          type: 'vaccination' as const,
          title: vac.vaccine_name,
          description: vac.notes,
          date: format(new Date(vac.scheduled_date), 'MMM dd, yyyy'),
          status: vac.status,
          originalDate: vac.scheduled_date,
        })),
        ...(screenings || []).map(scr => ({
          id: scr.id,
          type: 'screening' as const,
          title: scr.screening_type,
          description: scr.notes,
          date: format(new Date(scr.scheduled_date), 'MMM dd, yyyy'),
          status: scr.status,
          originalDate: scr.scheduled_date,
        })),
      ];

      setItems(allItems);
    } catch (error: any) {
      toast.error('Failed to load checklist items');
      console.error('Error fetching checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaysItems();
  }, [user]);

  const handleToggleComplete = async (item: ChecklistItem) => {
    const isCompleted = completedItems.has(item.id);
    
    try {
      const newStatus = isCompleted ? 
        (item.type === 'vaccination' ? 'due' : item.type === 'screening' ? 'due' : 'scheduled') : 
        'completed';
      
      const table = item.type === 'appointment' ? 'appointments' : 
                    item.type === 'vaccination' ? 'vaccinations' : 'screenings';
      
      const updateData: any = { status: newStatus };
      
      if (item.type === 'appointment') {
        // No completed_date field for appointments
      } else if (item.type === 'vaccination') {
        updateData.administered_date = isCompleted ? null : new Date().toISOString().split('T')[0];
      } else if (item.type === 'screening') {
        updateData.completed_date = isCompleted ? null : new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', item.id);

      if (error) throw error;

      // Update local state
      setCompletedItems(prev => {
        const newSet = new Set(prev);
        if (isCompleted) {
          newSet.delete(item.id);
        } else {
          newSet.add(item.id);
        }
        return newSet;
      });

      toast.success(isCompleted ? 'Marked as incomplete' : 'Marked as complete');
      fetchTodaysItems();
    } catch (error: any) {
      toast.error('Failed to update status');
      console.error('Error updating status:', error);
    }
  };

  const handleReschedule = async (item: ChecklistItem, newDate: Date) => {
    try {
      const table = item.type === 'appointment' ? 'appointments' : 
                    item.type === 'vaccination' ? 'vaccinations' : 'screenings';
      
      const dateField = item.type === 'appointment' ? 'appointment_date' : 'scheduled_date';
      const newDateStr = item.type === 'appointment' 
        ? newDate.toISOString()
        : newDate.toISOString().split('T')[0];

      const { error } = await supabase
        .from(table)
        .update({ [dateField]: newDateStr })
        .eq('id', item.id);

      if (error) throw error;

      toast.success('Successfully rescheduled');
      setReschedulingItem(null);
      fetchTodaysItems();
    } catch (error: any) {
      toast.error('Failed to reschedule');
      console.error('Error rescheduling:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'vaccination':
        return <Syringe className="w-5 h-5 text-blue-500" />;
      case 'appointment':
        return <Stethoscope className="w-5 h-5 text-green-500" />;
      case 'screening':
        return <FlaskConical className="w-5 h-5 text-purple-500" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string, isCompleted: boolean) => {
    if (isCompleted) {
      return <Badge className="bg-green-500">Completed</Badge>;
    }
    
    const statusText = status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return <Badge variant="outline">{statusText}</Badge>;
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Today's Checklist</h1>
          <p className="text-muted-foreground">Review and manage your tasks for today</p>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Today's Checklist</h1>
        <p className="text-muted-foreground">
          {format(new Date(), 'EEEE, MMMM dd, yyyy')}
        </p>
      </div>

      {/* Summary Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tasks Today</p>
              <p className="text-3xl font-bold">{items.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-3xl font-bold text-green-600">{completedItems.size}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-3xl font-bold text-orange-600">{items.length - completedItems.size}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Tasks & Appointments
          </CardTitle>
          <CardDescription>
            Check off items as you complete them or reschedule as needed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No tasks for today</h3>
              <p className="text-muted-foreground">Enjoy your day! Check back tomorrow.</p>
            </div>
          ) : (
            items.map((item) => {
              const isCompleted = completedItems.has(item.id);
              const isRescheduling = reschedulingItem === item.id;

              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                    isCompleted 
                      ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900' 
                      : 'bg-card border-border hover:border-primary/50'
                  }`}
                >
                  {/* Checkbox */}
                  <div className="pt-1">
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={() => handleToggleComplete(item)}
                      className="w-5 h-5"
                    />
                  </div>

                  {/* Icon */}
                  <div className="pt-1">
                    {getIcon(item.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div>
                      <h4 className={`font-semibold ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{item.date}</span>
                      </div>
                      {getStatusBadge(item.status, isCompleted)}
                      <Badge variant="secondary" className="capitalize">
                        {item.type}
                      </Badge>
                    </div>
                  </div>

                  {/* Reschedule Button */}
                  {!isCompleted && (
                    <div>
                      <Popover open={isRescheduling} onOpenChange={(open) => setReschedulingItem(open ? item.id : null)}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            Reschedule
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar
                            mode="single"
                            selected={new Date(item.originalDate)}
                            onSelect={(date) => date && handleReschedule(item, date)}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Checklist;
