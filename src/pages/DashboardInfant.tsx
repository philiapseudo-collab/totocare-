import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Baby, Milk, Clock, TrendingUp, Calendar, Camera, Smile, Heart } from 'lucide-react';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInMonths, differenceInWeeks } from 'date-fns';

export default function DashboardInfant() {
  const { profile } = useProfile();
  const { t } = useAppTranslation();

  // Fetch infant data
  const { data: infant } = useQuery({
    queryKey: ['infant', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      const { data } = await supabase
        .from('infants')
        .select('*')
        .eq('mother_id', profile.id)
        .order('birth_date', { ascending: false })
        .limit(1)
        .single();
      return data;
    },
    enabled: !!profile?.id
  });

  const babyAge = infant?.birth_date ? 
    differenceInMonths(new Date(), new Date(infant.birth_date)) > 0 ?
      `${differenceInMonths(new Date(), new Date(infant.birth_date))} months old` :
      `${differenceInWeeks(new Date(), new Date(infant.birth_date))} weeks old`
    : null;

  const quickLogs = [
    { icon: Milk, label: 'Feed', href: '/quick-add', color: 'text-blue-500' },
    { icon: Clock, label: 'Sleep', href: '/quick-add', color: 'text-purple-500' },
    { icon: Baby, label: 'Diaper', href: '/quick-add', color: 'text-green-500' },
    { icon: Smile, label: 'Milestone', href: '/journal', color: 'text-yellow-500' },
    { icon: TrendingUp, label: 'Growth', href: '/analytics', color: 'text-pink-500' },
    { icon: Camera, label: 'Photo Journal', href: '/journal', color: 'text-orange-500' }
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          Welcome back, {profile?.first_name}!
        </h1>
        <p className="text-muted-foreground">
          Track your baby's growth, health, and precious moments
        </p>
      </div>

      {/* Baby Info Card */}
      {infant && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Baby className="h-6 w-6 text-blue-500" />
              {infant.first_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Age</p>
                <p className="font-semibold">{babyAge}</p>
              </div>
              {infant.current_weight && (
                <div>
                  <p className="text-muted-foreground">Weight</p>
                  <p className="font-semibold">{infant.current_weight} kg</p>
                </div>
              )}
              {infant.current_height && (
                <div>
                  <p className="text-muted-foreground">Height</p>
                  <p className="font-semibold">{infant.current_height} cm</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Gender</p>
                <p className="font-semibold">{infant.gender || 'Not set'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Track feeding, sleep, and diaper changes throughout the day
          </p>
        </CardContent>
      </Card>

      {/* Quick Log Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickLogs.map((action) => (
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

      {/* Postpartum Health Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Your Postpartum Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Don't forget to take care of yourself too!
          </p>
          <Link to="/profile">
            <Button variant="outline" size="sm">
              Log Your Health
            </Button>
          </Link>
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