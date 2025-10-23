import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Heart, Building2, Landmark, HandHeart, CheckCircle2, Sparkles } from 'lucide-react';
import { useCampaignParticipation } from '@/hooks/useCampaignParticipation';
import { useAuth } from '@/hooks/useAuth';

interface Campaign {
  id: string;
  title: string;
  description: string;
  category: string;
  classification: 'government' | 'ngo' | 'private';
  target_amount: number;
  current_amount: number;
  image_url?: string;
}

const Campaigns = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassification, setSelectedClassification] = useState<string>('government');
  const [participationStatus, setParticipationStatus] = useState<Record<string, boolean>>({});
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});
  const { checkParticipation, registerForCampaign, withdrawFromCampaign, getParticipantCount } = useCampaignParticipation();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (campaigns.length > 0 && user) {
      loadParticipationData();
    }
  }, [campaigns, user]);

  const loadParticipationData = async () => {
    const statusPromises = campaigns.map(async (campaign) => ({
      id: campaign.id,
      status: await checkParticipation(campaign.id),
      count: await getParticipantCount(campaign.id)
    }));

    const results = await Promise.all(statusPromises);
    const newStatus: Record<string, boolean> = {};
    const newCounts: Record<string, number> = {};
    
    results.forEach(result => {
      newStatus[result.id] = result.status;
      newCounts[result.id] = result.count;
    });

    setParticipationStatus(newStatus);
    setParticipantCounts(newCounts);
  };

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'published')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns((data as Campaign[]) || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (campaignId: string) => {
    const success = await registerForCampaign(campaignId);
    if (success) {
      await loadParticipationData();
    }
  };

  const handleWithdraw = async (campaignId: string) => {
    const success = await withdrawFromCampaign(campaignId);
    if (success) {
      await loadParticipationData();
    }
  };

  const handleDonate = (campaignId: string) => {
    navigate(`/donate?campaignId=${campaignId}`);
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClassification = campaign.classification === selectedClassification;
    return matchesSearch && matchesClassification;
  });

  const getClassificationIcon = (classification: string) => {
    switch (classification) {
      case 'government':
        return <Landmark className="h-5 w-5" />;
      case 'ngo':
        return <HandHeart className="h-5 w-5" />;
      case 'private':
        return <Building2 className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'government':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'ngo':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'private':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Sparkles className="h-64 w-64 text-primary animate-pulse" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent relative z-10">
            Join The Movement
          </h1>
          <p className="text-xl text-muted-foreground mb-6 relative z-10">
            Be part of transformative maternal and child health campaigns across Kenya
          </p>
          <div className="flex items-center justify-center gap-8 mb-8 relative z-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{campaigns.length}</div>
              <div className="text-sm text-muted-foreground">Active Campaigns</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {Object.values(participantCounts).reduce((a, b) => a + b, 0)}+
              </div>
              <div className="text-sm text-muted-foreground">Participants</div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-2xl mx-auto"
          />
        </div>

        {/* Classification Tabs */}
        <Tabs value={selectedClassification} onValueChange={setSelectedClassification} className="w-full">
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-3 mb-8 h-auto p-1">
            <TabsTrigger value="government" className="flex items-center gap-2 py-3">
              <Landmark className="h-4 w-4" />
              <span className="hidden sm:inline">Government</span>
              <Badge variant="secondary" className="ml-auto">
                {campaigns.filter(c => c.classification === 'government').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="ngo" className="flex items-center gap-2 py-3">
              <HandHeart className="h-4 w-4" />
              <span className="hidden sm:inline">NGO</span>
              <Badge variant="secondary" className="ml-auto">
                {campaigns.filter(c => c.classification === 'ngo').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="private" className="flex items-center gap-2 py-3">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Private</span>
              <Badge variant="secondary" className="ml-auto">
                {campaigns.filter(c => c.classification === 'private').length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedClassification} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {filteredCampaigns.map((campaign) => {
                const progress = (campaign.current_amount / campaign.target_amount) * 100;
                const isParticipating = participationStatus[campaign.id];
                const participantCount = participantCounts[campaign.id] || 0;

                return (
                  <Card 
                    key={campaign.id} 
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50 group"
                  >
                    <div className="relative">
                      {campaign.image_url && (
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={campaign.image_url} 
                            alt={campaign.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                      )}
                      <Badge 
                        className={`absolute top-3 right-3 ${getClassificationColor(campaign.classification)} backdrop-blur-sm`}
                      >
                        <span className="flex items-center gap-1">
                          {getClassificationIcon(campaign.classification)}
                          <span className="capitalize">{campaign.classification}</span>
                        </span>
                      </Badge>
                    </div>

                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {campaign.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">
                        {campaign.description}
                      </p>

                      {/* Participants */}
                      <div className="flex items-center gap-2 mb-4 text-sm">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">
                          {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
                        </span>
                      </div>
                      
                      {/* Progress */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Funding Progress</span>
                          <span className="font-bold text-primary">
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>KES {campaign.current_amount.toLocaleString()}</span>
                          <span>KES {campaign.target_amount.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        {isParticipating ? (
                          <>
                            <Button 
                              variant="outline"
                              className="w-full border-green-500 text-green-500 hover:bg-green-500/10"
                              disabled
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Registered
                            </Button>
                            <Button 
                              variant="ghost"
                              onClick={() => handleWithdraw(campaign.id)}
                              className="w-full text-xs"
                            >
                              Withdraw
                            </Button>
                          </>
                        ) : (
                          <Button 
                            onClick={() => handleRegister(campaign.id)}
                            className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                            disabled={!user}
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            Register to Participate
                          </Button>
                        )}
                        <Button 
                          onClick={() => handleDonate(campaign.id)}
                          variant="outline"
                          className="w-full"
                        >
                          Support Campaign
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredCampaigns.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No campaigns found in this category.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Campaigns;
