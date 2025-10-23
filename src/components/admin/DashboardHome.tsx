import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, FileText, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const DashboardHome = () => {
  const { admin } = useAdminAuth();
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    publishedCampaigns: 0,
    draftCampaigns: 0,
    totalViews: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [admin]);

  const fetchDashboardData = async () => {
    try {
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (campaigns) {
        const total = campaigns.length;
        const published = campaigns.filter(c => c.status === 'published').length;
        const draft = campaigns.filter(c => c.status === 'draft').length;
        const views = campaigns.reduce((sum, c) => sum + (c.views_count || 0), 0);

        setStats({
          totalCampaigns: total,
          publishedCampaigns: published,
          draftCampaigns: draft,
          totalViews: views
        });

        setRecentActivity(campaigns);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Campaigns',
      value: stats.totalCampaigns,
      icon: FileText,
      description: 'All campaigns created'
    },
    {
      title: 'Published',
      value: stats.publishedCampaigns,
      icon: TrendingUp,
      description: 'Currently active'
    },
    {
      title: 'Drafts',
      value: stats.draftCampaigns,
      icon: Activity,
      description: 'Pending publication'
    },
    {
      title: 'Total Views',
      value: stats.totalViews,
      icon: Eye,
      description: 'Across all campaigns'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {admin?.name}!</h1>
        <p className="text-muted-foreground mt-2">
          Here's an overview of your campaign management dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
          <CardDescription>Latest 5 campaigns created</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No campaigns created yet. Create your first campaign!
            </p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{campaign.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {campaign.category} • {campaign.condition_type}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        campaign.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(campaign.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
