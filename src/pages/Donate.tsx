import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Baby, Users } from "lucide-react";
import { useCampaigns } from "@/hooks/useCampaigns";
import { DonateDialog } from "@/components/forms/DonateDialog";
import { useAppTranslation } from "@/hooks/useAppTranslation";

const Donate = () => {
  const navigate = useNavigate();
  const { campaigns, loading } = useCampaigns();
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [donateDialogOpen, setDonateDialogOpen] = useState(false);
  const { t } = useAppTranslation();

  const maternalCampaigns = campaigns.filter(c => c.category === 'maternal');
  const infantCampaigns = campaigns.filter(c => c.category === 'infant');
  const femalehoodCampaigns = campaigns.filter(c => c.category === 'femalehood');

  const handleDonate = (campaign: any) => {
    setSelectedCampaign(campaign);
    setDonateDialogOpen(true);
  };

  const CampaignCard = ({ campaign }: { campaign: any }) => {
    const progress = campaign.target_amount 
      ? (campaign.current_amount / campaign.target_amount) * 100 
      : 0;

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{campaign.title}</CardTitle>
              <CardDescription>{campaign.description}</CardDescription>
            </div>
            <Badge variant="outline" className="ml-2">
              {campaign.category === 'maternal' ? t('donation.categoryMaternal') : 
               campaign.category === 'infant' ? t('donation.categoryInfant') : 
               t('donation.categoryFemalehood')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span data-i18n className="text-muted-foreground">{t('donation.raised')}</span>
              <span className="font-semibold">
                KES {campaign.current_amount?.toLocaleString() || 0} {t('donation.of')} {campaign.target_amount?.toLocaleString()}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {progress.toFixed(1)}{t('donation.fundedPercent')}
            </p>
          </div>
          <Button onClick={() => handleDonate(campaign)} className="w-full">
            <Heart className="w-4 h-4 mr-2" />
            {t('donation.button')}
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12" data-i18n>{t('donation.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 data-i18n className="text-4xl md:text-5xl font-bold mb-4">
            {t('donation.title')}
          </h1>
          <p data-i18n className="text-xl text-muted-foreground mb-8">
            {t('donation.description')}
          </p>
        </div>
      </section>

      {/* Campaigns Section */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="maternal" className="space-y-8">
            <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-3">
              <TabsTrigger value="maternal" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span data-i18n>{t('donation.maternalHealth')}</span>
              </TabsTrigger>
              <TabsTrigger value="infant" className="flex items-center gap-2">
                <Baby className="w-4 h-4" />
                <span data-i18n>{t('donation.infantHealth')}</span>
              </TabsTrigger>
              <TabsTrigger value="femalehood" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span data-i18n>{t('donation.femalehoodHealth')}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="maternal" className="space-y-6">
              <div className="text-center mb-8">
                <h2 data-i18n className="text-3xl font-bold mb-2">{t('donation.maternalCampaignsTitle')}</h2>
                <p data-i18n className="text-muted-foreground">
                  {t('donation.maternalCampaignsSubtitle')}
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {maternalCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="infant" className="space-y-6">
              <div className="text-center mb-8">
                <h2 data-i18n className="text-3xl font-bold mb-2">{t('donation.infantCampaignsTitle')}</h2>
                <p data-i18n className="text-muted-foreground">
                  {t('donation.infantCampaignsSubtitle')}
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {infantCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="femalehood" className="space-y-6">
              <div className="text-center mb-8">
                <h2 data-i18n className="text-3xl font-bold mb-2">{t('donation.femalehoodCampaignsTitle')}</h2>
                <p data-i18n className="text-muted-foreground">
                  {t('donation.femalehoodCampaignsSubtitle')}
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {femalehoodCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 px-6 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 data-i18n className="text-3xl font-bold mb-4">{t('donation.yourImpactTitle')}</h2>
          <p data-i18n className="text-lg text-muted-foreground mb-8">
            {t('donation.yourImpactSubtitle')}
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">
                {campaigns.reduce((sum, c) => sum + (c.current_amount || 0), 0).toLocaleString()}
              </div>
              <div data-i18n className="text-sm text-muted-foreground">{t('donation.totalRaised')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">{campaigns.length}</div>
              <div data-i18n className="text-sm text-muted-foreground">{t('donation.activeCampaigns')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <div data-i18n className="text-sm text-muted-foreground">{t('donation.goesToCare')}</div>
            </div>
          </div>
        </div>
      </section>

      {selectedCampaign && (
        <DonateDialog
          campaign={selectedCampaign}
          open={donateDialogOpen}
          onOpenChange={setDonateDialogOpen}
        />
      )}
    </div>
  );
};

export default Donate;
