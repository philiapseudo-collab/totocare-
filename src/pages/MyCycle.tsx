import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Heart, Settings, Plus, Droplets, Moon, Sun } from 'lucide-react';
import { useCycleTracking } from '@/hooks/useCycleTracking';
import { differenceInDays, format, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';

export default function MyCycle() {
  const navigate = useNavigate();
  const { 
    cycles, 
    loading, 
    isFirstTime, 
    addCycle,
    getCurrentCycleInfo 
  } = useCycleTracking();

  const [showStartPeriodDialog, setShowStartPeriodDialog] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date>();

  useEffect(() => {
    if (!loading && isFirstTime) {
      navigate('/cycle-onboarding');
    }
  }, [loading, isFirstTime, navigate]);

  const currentInfo = getCurrentCycleInfo();

  const handleStartPeriod = async (date?: Date) => {
    const periodDate = date || new Date();
    const dateString = format(periodDate, 'yyyy-MM-dd');

    try {
      addCycle({
        periodStartDate: dateString
      });
      toast.success('Period started logged successfully');
      setShowStartPeriodDialog(false);
    } catch (error) {
      toast.error('Failed to log period start');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading cycle data...</p>
        </div>
      </div>
    );
  }

  const daysUntilPeriod = currentInfo?.predictions 
    ? differenceInDays(parseISO(currentInfo.predictions.nextPeriodDate), new Date())
    : null;

  const isInFertileWindow = currentInfo?.predictions
    ? differenceInDays(new Date(), parseISO(currentInfo.predictions.fertileWindowStart)) >= 0 &&
      differenceInDays(parseISO(currentInfo.predictions.fertileWindowEnd), new Date()) >= 0
    : false;

  const phaseColor = 
    currentInfo?.phase === 'Menstrual' ? 'text-red-500' :
    currentInfo?.phase === 'Follicular' ? 'text-green-500' :
    currentInfo?.phase === 'Ovulation' ? 'text-purple-500' : 'text-blue-500';

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Cycle</h1>
          <p className="text-muted-foreground">Track your period and fertility</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => navigate('/cycle-settings')}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Current Cycle Overview */}
      {currentInfo && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarIcon className="h-5 w-5 text-purple-500" />
                Cycle Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold mb-1">{currentInfo.cycleDay}</p>
              <p className={`text-sm font-medium ${phaseColor}`}>{currentInfo.phase} Phase</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sun className="h-5 w-5 text-orange-500" />
                Next Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold mb-1">
                {daysUntilPeriod !== null ? daysUntilPeriod : '?'}
              </p>
              <p className="text-sm text-muted-foreground">days away</p>
              {currentInfo?.predictions && (
                <p className="text-xs text-muted-foreground mt-2">
                  Expected: {format(parseISO(currentInfo.predictions.nextPeriodDate), 'MMM dd')}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Moon className="h-5 w-5 text-blue-500" />
                Fertile Window
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold mb-1">
                {isInFertileWindow ? (
                  <span className="text-green-600 dark:text-green-400">Active Now</span>
                ) : (
                  <span className="text-muted-foreground">Not Active</span>
                )}
              </p>
              {currentInfo?.predictions && (
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(currentInfo.predictions.fertileWindowStart), 'MMM dd')} - {format(parseISO(currentInfo.predictions.fertileWindowEnd), 'MMM dd')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Log Period
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Start Period */}
          <Dialog open={showStartPeriodDialog} onOpenChange={setShowStartPeriodDialog}>
            <DialogTrigger asChild>
              <Button className="w-full" size="lg">
                <Droplets className="mr-2 h-5 w-5" />
                Period Started Today
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>When did your period start?</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Calendar
                  mode="single"
                  selected={selectedStartDate}
                  onSelect={setSelectedStartDate}
                  disabled={(date) => date > new Date()}
                  className="rounded-md border mx-auto"
                />
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => handleStartPeriod(new Date())}
                    className="flex-1"
                  >
                    Started Today
                  </Button>
                  <Button 
                    onClick={() => handleStartPeriod(selectedStartDate)}
                    disabled={!selectedStartDate}
                    className="flex-1"
                  >
                    Confirm Date
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/cycle-history')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Past Periods
          </Button>
        </CardContent>
      </Card>

      {/* Cycle History */}
      {cycles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Cycles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cycles.filter(c => c.menstrual_cycle_day === 1).slice(-5).reverse().map((cycle) => (
                <div key={cycle.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">
                      {format(parseISO(cycle.record_date), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Period start
                      {cycle.cycle_length && ` • ${cycle.cycle_length}-day cycle`}
                    </p>
                  </div>
                  <Droplets className="h-5 w-5 text-pink-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
