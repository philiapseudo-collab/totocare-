import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Baby, Calendar, Activity, Heart, Weight, Clock, Clipboard, Package } from 'lucide-react';
import { DueDateCountdown } from '@/components/dashboard/DueDateCountdown';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Link } from 'react-router-dom';
import { DeliveryNotification } from '@/components/DeliveryNotification';

export default function DashboardPregnancy() {
  const { profile, pregnancy } = useProfile();
  const { t } = useAppTranslation();

  const quickActions = [
    { icon: Activity, label: 'Log Symptom', href: '/symptom-checker', color: 'text-pink-500' },
    { icon: Heart, label: 'Kick Counter', href: '/quick-add', color: 'text-red-500' },
    { icon: Weight, label: 'Weight Tracker', href: '/quick-add', color: 'text-blue-500' },
    { icon: Clock, label: 'Contraction Timer', href: '/quick-add', color: 'text-purple-500' },
    { icon: Clipboard, label: 'Checklist', href: '/checklist', color: 'text-green-500' },
    { icon: Package, label: 'Hospital Bag', href: '/checklist', color: 'text-orange-500' }
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <DeliveryNotification />

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          Welcome back, {profile?.first_name}!
        </h1>
        <p className="text-muted-foreground">
          Track your pregnancy journey and prepare for your baby's arrival
        </p>
      </div>

      {/* Due Date Countdown */}
      <DueDateCountdown />

      {/* Pregnancy Week & Daily Tip */}
      {pregnancy && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Baby className="h-5 w-5 text-pink-500" />
                Week {pregnancy.current_week}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your baby is about the size of a {
                  pregnancy.current_week <= 12 ? 'lime' :
                  pregnancy.current_week <= 24 ? 'papaya' :
                  pregnancy.current_week <= 36 ? 'pineapple' : 'watermelon'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Daily Pregnancy Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Stay hydrated and try gentle stretching exercises to help with any discomfort.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

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