import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Info, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCycleData } from '@/hooks/useCycleData';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';

export default function CycleOnboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useCycleData();
  const [step, setStep] = useState(1);
  const [lastPeriodDate, setLastPeriodDate] = useState<Date>();
  const [periodDuration, setPeriodDuration] = useState(5);
  const [cycleLength, setCycleLength] = useState(28);
  const [dontKnowLength, setDontKnowLength] = useState(false);

  const handleComplete = async () => {
    if (!lastPeriodDate) {
      toast.error('Please select your last period start date');
      return;
    }

    const dateString = format(lastPeriodDate, 'yyyy-MM-dd');
    const finalCycleLength = dontKnowLength ? 28 : cycleLength;

    try {
      await completeOnboarding(dateString, periodDuration, finalCycleLength);
      toast.success('Cycle tracking setup complete!');
      navigate('/my-cycle');
    } catch (error) {
      toast.error('Failed to save cycle data');
      console.error(error);
    }
  };

  const handleSkip = () => {
    navigate('/my-cycle');
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Let's Track Your Cycle</h1>
          <span className="text-sm text-muted-foreground">Step {step} of 3</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>When did your last period start?</CardTitle>
            <CardDescription>Select the first day you started bleeding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={lastPeriodDate}
                onSelect={setLastPeriodDate}
                disabled={(date) => date > new Date() || date < subDays(new Date(), 60)}
                className="rounded-md border"
              />
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleSkip}
                className="flex-1"
              >
                Skip for Now
              </Button>
              <Button 
                onClick={() => setStep(2)}
                disabled={!lastPeriodDate}
                className="flex-1"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>How long was your period?</CardTitle>
            <CardDescription>How many days did you bleed?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-5xl font-bold text-primary">{periodDuration}</span>
                <span className="text-2xl text-muted-foreground ml-2">days</span>
              </div>

              <Slider
                value={[periodDuration]}
                onValueChange={(value) => setPeriodDuration(value[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1 day</span>
                <span>10 days</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)}
                className="flex-1"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Do you know your cycle length?</CardTitle>
            <CardDescription>
              From first day of one period to first day of the next (typically 28 days)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-5xl font-bold text-primary">{cycleLength}</span>
                <span className="text-2xl text-muted-foreground ml-2">days</span>
              </div>

              <Slider
                value={[cycleLength]}
                onValueChange={(value) => {
                  setCycleLength(value[0]);
                  setDontKnowLength(false);
                }}
                min={21}
                max={40}
                step={1}
                className="w-full"
                disabled={dontKnowLength}
              />

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>21 days</span>
                <span>40 days</span>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Checkbox 
                  id="dont-know"
                  checked={dontKnowLength}
                  onCheckedChange={(checked) => {
                    setDontKnowLength(checked as boolean);
                    if (checked) setCycleLength(28);
                  }}
                />
                <Label htmlFor="dont-know" className="text-sm cursor-pointer">
                  I don't know (we'll use 28 days as default)
                </Label>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  <strong>Cycle length</strong> is different from period length. 
                  It's the total days from the start of one period to the start of the next period.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setStep(2)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={handleComplete}
                className="flex-1"
              >
                Finish Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
