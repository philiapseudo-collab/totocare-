import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { useCycleTracking } from '@/hooks/useCycleTracking';
import { Calendar, Heart, Pill, TrendingUp, Activity, Sun, Moon, Droplets, Bell, BookOpen, HandHeart } from 'lucide-react';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Link } from 'react-router-dom';
import { differenceInDays, format, parseISO } from 'date-fns';

export default function DashboardFamilyPlanning() {
  const { profile } = useProfile();
  const { getCurrentCycleInfo, loading } = useCycleTracking();

  const currentInfo = getCurrentCycleInfo();

  const phaseColor = 
    currentInfo?.phase === 'Menstrual' ? 'text-red-500' :
    currentInfo?.phase === 'Follicular' ? 'text-green-500' :
    currentInfo?.phase === 'Ovulation' ? 'text-purple-500' : 'text-blue-500';

  // Show loading state
  if (loading || !currentInfo) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const daysUntilPeriod = currentInfo.predictions 
    ? differenceInDays(parseISO(currentInfo.predictions.nextPeriodDate), new Date())
    : null;

  const isInFertileWindow = currentInfo.predictions
    ? differenceInDays(new Date(), parseISO(currentInfo.predictions.fertileWindowStart)) >= 0 &&
      differenceInDays(parseISO(currentInfo.predictions.fertileWindowEnd), new Date()) >= 0
    : false;

  const quickActions = [
    { icon: Droplets, label: 'My Cycle', href: '/my-cycle', color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-950/20' },
    { icon: Activity, label: 'Log Symptoms', href: '/symptom-checker', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/20' },
    { icon: Pill, label: 'Medications', href: '/medications', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
    { icon: Calendar, label: 'Calendar', href: '/cycle-calendar', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20' },
    { icon: HandHeart, label: 'Donate', href: '/donate', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/20' }
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
              <p className="text-4xl font-bold mb-1">{currentInfo.cycleDay}</p>
              <p className={`text-sm font-medium ${phaseColor}`}>{currentInfo.phase} Phase</p>
              <p className="text-xs text-muted-foreground mt-2">
                Last updated {format(parseISO(currentInfo.lastPeriodStart), 'MMM dd')}
              </p>
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
              {daysUntilPeriod !== null && daysUntilPeriod > 0 ? daysUntilPeriod : 'Due today'}
            </p>
            <p className="text-sm text-muted-foreground">
              {daysUntilPeriod !== null && daysUntilPeriod > 0 ? 'days away' : ''}
            </p>
            {currentInfo.predictions && (
              <p className="text-xs text-muted-foreground mt-2">
                Expected: {format(parseISO(currentInfo.predictions.nextPeriodDate), 'MMM dd')}
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
              {isInFertileWindow ? (
                <span className="text-green-600 dark:text-green-400">Active Now</span>
              ) : (
                <span className="text-muted-foreground">Not Active</span>
              )}
            </p>
            {currentInfo.predictions && (
              <p className="text-xs text-muted-foreground">
                {format(parseISO(currentInfo.predictions.fertileWindowStart), 'MMM dd')} - {format(parseISO(currentInfo.predictions.fertileWindowEnd), 'MMM dd')}
              </p>
            )}
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
                currentInfo.phase === 'Follicular' ? '⚡ High - Great time for exercise' :
                currentInfo.phase === 'Ovulation' ? '🔥 Peak - Most energetic phase' :
                currentInfo.phase === 'Luteal' ? '💫 Moderate - Focus on self-care' :
                '💤 Lower - Rest and recover'
              }</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-muted-foreground">Mood</p>
              <p>{
                currentInfo.phase === 'Follicular' ? '😊 Optimistic and motivated' :
                currentInfo.phase === 'Ovulation' ? '🌟 Social and confident' :
                currentInfo.phase === 'Luteal' ? '🤔 May feel more introspective' :
                '💝 May need extra support'
              }</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-muted-foreground">Focus Areas</p>
              <p>{
                currentInfo.phase === 'Follicular' ? '🎯 Planning & new projects' :
                currentInfo.phase === 'Ovulation' ? '🤝 Social connections' :
                currentInfo.phase === 'Luteal' ? '🧘 Self-reflection & rest' :
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
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