import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Calendar, Heart, Pill, TrendingUp, Activity, Sun, Moon, Droplets } from 'lucide-react';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays } from 'date-fns';

export default function DashboardFamilyPlanning() {
  const { profile } = useProfile();
  const { t } = useAppTranslation();

  // Fetch latest reproductive health data
  const { data: latestCycle } = useQuery({
    queryKey: ['cycle', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      const { data } = await supabase
        .from('reproductive_health')
        .select('*')
        .eq('mother_id', profile.id)
        .order('record_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!profile?.id
  });

  const cycleDay = latestCycle?.menstrual_cycle_day || 1;
  const cyclePhase = 
    cycleDay <= 5 ? 'Menstrual' :
    cycleDay <= 13 ? 'Follicular' :
    cycleDay <= 17 ? 'Ovulation' : 'Luteal';

  const quickActions = [
    { icon: Calendar, label: 'View Calendar', href: '/profile', color: 'text-purple-500' },
    { icon: Activity, label: 'Log Symptoms', href: '/symptom-checker', color: 'text-pink-500' },
    { icon: Pill, label: 'Medications', href: '/medications', color: 'text-blue-500' },
    { icon: TrendingUp, label: 'View Insights', href: '/analytics', color: 'text-green-500' },
    { icon: Heart, label: 'Health Check', href: '/profile', color: 'text-red-500' },
    { icon: Droplets, label: 'Log Period', href: '/profile', color: 'text-pink-600' }
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          Welcome back, {profile?.first_name}!
        </h1>
        <p className="text-muted-foreground">
          Track your cycle, manage contraception, and plan your family journey
        </p>
      </div>

      {/* Cycle Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-purple-500" />
              Cycle Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{cycleDay}</p>
            <p className="text-sm text-muted-foreground">{cyclePhase} Phase</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sun className="h-5 w-5 text-yellow-500" />
              Period Prediction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {latestCycle?.cycle_length ? latestCycle.cycle_length - cycleDay : '?'}
            </p>
            <p className="text-sm text-muted-foreground">days away</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Moon className="h-5 w-5 text-blue-500" />
              Fertile Window
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">
              {cycleDay >= 10 && cycleDay <= 17 ? 'Active Now' : 'Not Active'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {cycleDay < 10 ? `Starts in ${10 - cycleDay} days` : 
               cycleDay > 17 ? 'Passed this cycle' : 'Day ' + (cycleDay - 9) + ' of 8'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Today's Cycle Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Energy Level:</strong> {
              cyclePhase === 'Follicular' ? 'High - Great time for exercise' :
              cyclePhase === 'Ovulation' ? 'Peak - Most energetic phase' :
              cyclePhase === 'Luteal' ? 'Moderate - Focus on self-care' :
              'Lower - Rest and recover'
            }</p>
            <p><strong>Mood:</strong> {
              cyclePhase === 'Follicular' ? 'Optimistic and motivated' :
              cyclePhase === 'Ovulation' ? 'Social and confident' :
              cyclePhase === 'Luteal' ? 'May feel more introspective' :
              'May need extra support'
            }</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <Link key={action.label} to={action.href}>
                <Button 
                  variant="outline" 
                  className="w-full h-24 flex flex-col items-center justify-center gap-2"
                >
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                  <span className="text-sm">{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <UpcomingEvents />
        <RecentActivity />
      </div>
    </div>
  );
}