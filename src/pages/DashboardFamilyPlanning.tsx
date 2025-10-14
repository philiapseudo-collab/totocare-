import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { Calendar, Heart, Pill, TrendingUp, Activity, Sun, Moon, Droplets, Bell, BookOpen } from 'lucide-react';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, format } from 'date-fns';

export default function DashboardFamilyPlanning() {
  const { profile } = useProfile();

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

  const phaseColor = 
    cyclePhase === 'Menstrual' ? 'text-red-500' :
    cyclePhase === 'Follicular' ? 'text-green-500' :
    cyclePhase === 'Ovulation' ? 'text-purple-500' : 'text-blue-500';

  const quickActions = [
    { icon: Calendar, label: 'Cycle Calendar', href: '/profile', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20' },
    { icon: Activity, label: 'Log Symptoms', href: '/symptom-checker', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/20' },
    { icon: Pill, label: 'Medications', href: '/medications', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
    { icon: TrendingUp, label: 'Health Analytics', href: '/analytics', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/20' },
    { icon: BookOpen, label: 'Health Guides', href: '/guides', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/20' },
    { icon: Droplets, label: 'Log Period', href: '/profile', color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-950/20' }
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

      {/* Cycle Overview Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-purple-500" />
              Cycle Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold mb-1">{cycleDay}</p>
            <p className={`text-sm font-medium ${phaseColor}`}>{cyclePhase} Phase</p>
            {latestCycle?.record_date && (
              <p className="text-xs text-muted-foreground mt-2">
                Last updated {format(new Date(latestCycle.record_date), 'MMM dd')}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sun className="h-5 w-5 text-orange-500" />
              Period Prediction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold mb-1">
              {latestCycle?.cycle_length ? latestCycle.cycle_length - cycleDay : '?'}
            </p>
            <p className="text-sm text-muted-foreground">days away</p>
            {latestCycle?.cycle_length && (
              <p className="text-xs text-muted-foreground mt-2">
                Based on {latestCycle.cycle_length}-day cycle
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Moon className="h-5 w-5 text-blue-500" />
              Fertile Window
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold mb-1">
              {cycleDay >= 10 && cycleDay <= 17 ? (
                <span className="text-green-600 dark:text-green-400">Active Now</span>
              ) : (
                <span className="text-muted-foreground">Not Active</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {cycleDay < 10 ? `Starts in ${10 - cycleDay} days` : 
               cycleDay > 17 ? 'Passed this cycle' : `Day ${cycleDay - 9} of 8`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Today's Cycle Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-semibold text-muted-foreground">Energy Level</p>
              <p>{
                cyclePhase === 'Follicular' ? '⚡ High - Great time for exercise' :
                cyclePhase === 'Ovulation' ? '🔥 Peak - Most energetic phase' :
                cyclePhase === 'Luteal' ? '💫 Moderate - Focus on self-care' :
                '💤 Lower - Rest and recover'
              }</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-muted-foreground">Mood</p>
              <p>{
                cyclePhase === 'Follicular' ? '😊 Optimistic and motivated' :
                cyclePhase === 'Ovulation' ? '🌟 Social and confident' :
                cyclePhase === 'Luteal' ? '🤔 May feel more introspective' :
                '💝 May need extra support'
              }</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-muted-foreground">Focus Areas</p>
              <p>{
                cyclePhase === 'Follicular' ? '🎯 Planning & new projects' :
                cyclePhase === 'Ovulation' ? '🤝 Social connections' :
                cyclePhase === 'Luteal' ? '🧘 Self-reflection & rest' :
                '💆 Gentle activities & comfort'
              }</p>
            </div>
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
                  className={`w-full h-24 flex flex-col items-center justify-center gap-2 ${action.bg} border-2 hover:scale-105 transition-transform`}
                >
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Health Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-500" />
            Health Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Pill className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Contraception Check</p>
              <p className="text-xs text-muted-foreground">Remember to take your daily medication</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Activity className="h-5 w-5 text-pink-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Track Your Symptoms</p>
              <p className="text-xs text-muted-foreground">Log any symptoms or changes you notice today</p>
            </div>
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