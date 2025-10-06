import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHealthcareTopics, useHealthcareContent } from "@/hooks/useHealthcareTopics";
import { useAntenatalSchedule } from "@/hooks/useAntenatalSchedule";
import { useDangerSigns } from "@/hooks/useDangerSigns";
import { useProfile } from "@/hooks/useProfile";
import { 
  Heart, Baby, Stethoscope, Shield, Apple, Users, 
  AlertTriangle, CheckCircle, Clock, Activity
} from "lucide-react";
import { useState } from "react";

const Guides = () => {
  const { profile, pregnancy } = useProfile();
  const { topics, loading: topicsLoading } = useHealthcareTopics();
  const { visits, currentVisit, loading: scheduleLoading } = useAntenatalSchedule(pregnancy?.current_week);
  const { dangerSigns, loading: dangerSignsLoading } = useDangerSigns();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const { content, loading: contentLoading } = useHealthcareContent(selectedTopic || undefined);

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      antenatal_care: Heart,
      postnatal_care: Activity,
      infant_care: Baby,
      immunization: Shield,
      nutrition: Apple,
      family_planning: Users,
    };
    return icons[category] || Stethoscope;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      antenatal_care: "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400",
      postnatal_care: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
      infant_care: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
      immunization: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
      nutrition: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
      family_planning: "bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400",
    };
    return colors[category] || "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400";
  };

  const renderContent = (item: any) => {
    switch (item.content_type) {
      case 'list':
        return (
          <ul className="list-disc pl-6 space-y-2">
            {item.content.items?.map((listItem: string, idx: number) => (
              <li key={idx} className="text-muted-foreground">{listItem}</li>
            ))}
          </ul>
        );
      case 'warning':
        return (
          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <p className="text-sm text-destructive">{item.content.text}</p>
          </div>
        );
      case 'tip':
        return (
          <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
            <p className="text-sm text-foreground">{item.content.text}</p>
          </div>
        );
      default:
        return <p className="text-muted-foreground">{item.content.text}</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Mother & Child Health Guide
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Evidence-based healthcare information from the Ministry of Health Handbook
          </p>
        </div>

        {/* Current Status Cards */}
        {pregnancy && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Week {pregnancy.current_week}</div>
                <p className="text-xs text-muted-foreground">
                  {pregnancy.current_week && pregnancy.current_week <= 12 ? 'First' : 
                   pregnancy.current_week && pregnancy.current_week <= 26 ? 'Second' : 'Third'} Trimester
                </p>
              </CardContent>
            </Card>

            {currentVisit && (
              <Card className="border-primary/20 bg-gradient-to-br from-secondary/5 to-transparent">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    Next Recommended Visit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{currentVisit.visit_title}</div>
                  <p className="text-xs text-muted-foreground">
                    Weeks {currentVisit.gestational_week_min}-{currentVisit.gestational_week_max}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="border-destructive/20 bg-gradient-to-br from-destructive/5 to-transparent">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Danger Signs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dangerSigns.length}</div>
                <p className="text-xs text-muted-foreground">Important signs to watch</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Healthcare Topics */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7">
            <TabsTrigger value="all">All Topics</TabsTrigger>
            <TabsTrigger value="antenatal_care">Antenatal</TabsTrigger>
            <TabsTrigger value="postnatal_care">Postnatal</TabsTrigger>
            <TabsTrigger value="infant_care">Infant Care</TabsTrigger>
            <TabsTrigger value="immunization">Vaccination</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="danger_signs">Danger Signs</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {topicsLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {topics.map((topic) => {
                  const IconComponent = getCategoryIcon(topic.category);
                  return (
                    <Card
                      key={topic.id}
                      className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50"
                      onClick={() => setSelectedTopic(topic.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className={`p-3 rounded-lg ${getCategoryColor(topic.category)}`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {topic.category.replace('_', ' ')}
                          </Badge>
                        </div>
                        <CardTitle className="mt-4">{topic.title}</CardTitle>
                        {topic.subtitle && (
                          <CardDescription>{topic.subtitle}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <Button variant="ghost" size="sm" className="w-full">
                          Learn More →
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {['antenatal_care', 'postnatal_care', 'infant_care', 'immunization', 'nutrition'].map((category) => (
            <TabsContent key={category} value={category} className="space-y-6">
              {topicsLoading ? (
                <Skeleton className="h-64" />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {topics
                    .filter((t) => t.category === category)
                    .map((topic) => {
                      const IconComponent = getCategoryIcon(topic.category);
                      return (
                        <Card
                          key={topic.id}
                          className="hover:shadow-lg transition-all cursor-pointer"
                          onClick={() => setSelectedTopic(topic.id)}
                        >
                          <CardHeader>
                            <div className={`p-3 rounded-lg ${getCategoryColor(topic.category)} w-fit mb-4`}>
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <CardTitle>{topic.title}</CardTitle>
                            {topic.subtitle && (
                              <CardDescription>{topic.subtitle}</CardDescription>
                            )}
                          </CardHeader>
                          <CardContent>
                            <Button variant="outline" size="sm">
                              View Details →
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              )}
            </TabsContent>
          ))}

          {/* Danger Signs Tab */}
          <TabsContent value="danger_signs" className="space-y-6">
            {dangerSignsLoading ? (
              <Skeleton className="h-96" />
            ) : (
              <div className="space-y-4">
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      Important Warning Signs
                    </CardTitle>
                    <CardDescription>
                      Seek immediate medical attention if you experience any of these signs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {dangerSigns.map((sign) => (
                      <div
                        key={sign.id}
                        className="p-4 bg-background rounded-lg border-l-4 border-destructive space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold">{sign.danger_sign}</h4>
                          <Badge
                            variant={sign.severity === 'immediate' ? 'destructive' : 'outline'}
                            className="capitalize"
                          >
                            {sign.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <strong>Action:</strong> {sign.recommended_action}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {sign.patient_type.replace('_', ' ')} • {sign.timing}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Selected Topic Content Modal */}
        {selectedTopic && (
          <Card className="fixed inset-4 z-50 overflow-auto">
            <CardHeader className="sticky top-0 bg-background border-b">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>
                    {topics.find((t) => t.id === selectedTopic)?.title}
                  </CardTitle>
                  <CardDescription>
                    {topics.find((t) => t.id === selectedTopic)?.subtitle}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedTopic(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {contentLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-24" />
                </div>
              ) : content.length > 0 ? (
                content.map((item) => (
                  <div key={item.id} className="space-y-3">
                    <h3 className="text-lg font-semibold">{item.section_title}</h3>
                    {renderContent(item)}
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Content for this topic is being prepared. Check back soon!
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Additional Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Need More Help?</CardTitle>
            <CardDescription>
              Access additional resources and support
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button variant="outline" asChild>
              <a href="/faq">FAQ</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/support">Contact Support</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Guides;
