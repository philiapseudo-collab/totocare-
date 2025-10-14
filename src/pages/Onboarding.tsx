import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Baby, Heart, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useAppTranslation } from '@/hooks/useAppTranslation';

type JourneyType = 'pregnant' | 'infant' | 'family_planning';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useAppTranslation();
  const [loading, setLoading] = useState(false);

  const handleJourneySelect = async (journey: JourneyType) => {
    if (!user) return;
    
    setLoading(true);
    
    // Navigate immediately for better UX
    navigate('/');
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        toast.error('Profile not found');
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          user_journey: journey,
          profile_completed: true 
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Welcome to your personalized dashboard!');
    } catch (error) {
      console.error('Error setting journey:', error);
      toast.error('Failed to set up your journey. Please try again.');
      navigate('/onboarding');
    } finally {
      setLoading(false);
    }
  };

  const journeyOptions = [
    {
      id: 'pregnant' as JourneyType,
      icon: Baby,
      title: "I'm Pregnant",
      description: "Track your pregnancy journey, appointments, and baby's development",
      color: 'text-pink-500',
      bgColor: 'bg-pink-50 dark:bg-pink-950/20',
      borderColor: 'border-pink-200 dark:border-pink-800'
    },
    {
      id: 'infant' as JourneyType,
      icon: Heart,
      title: 'I Have a Baby/Infant',
      description: 'Track feeding, sleep, milestones, and postpartum health',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      id: 'family_planning' as JourneyType,
      icon: Calendar,
      title: 'Family Planning & Cycle Tracking',
      description: 'Period tracking, contraception management, and planning for the future',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="w-full max-w-4xl space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <img 
              src="/src/assets/lea-baby-logo.png" 
              alt="NurtureCare Logo" 
              className="h-20 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Welcome! Let's personalize your experience
          </h1>
          <p className="text-xl text-muted-foreground">
            Tell us where you are in your journey
          </p>
        </div>

        {/* Journey Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {journeyOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card 
                key={option.id}
                className={`${option.bgColor} ${option.borderColor} border-2 transition-all hover:scale-105 hover:shadow-lg cursor-pointer`}
                onClick={() => !loading && handleJourneySelect(option.id)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-full ${option.bgColor}`}>
                      <Icon className={`h-12 w-12 ${option.color}`} />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{option.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-center text-base">
                    {option.description}
                  </CardDescription>
                  <Button 
                    className="w-full" 
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? 'Setting up...' : 'Continue'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tagline */}
        <p className="text-center text-sm text-muted-foreground">
          Your Complete Maternal & Family Health Companion
        </p>
      </div>
    </div>
  );
}