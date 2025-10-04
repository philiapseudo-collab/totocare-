import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Baby, Heart, Calendar, Stethoscope, FileText } from "lucide-react";

const Guides = () => {
  const pregnancyGuides = [
    {
      title: "First Trimester Care",
      description: "Essential information for weeks 1-12, including prenatal vitamins, early symptoms, and what to expect.",
      duration: "8 min read",
      topics: ["Nutrition", "Symptoms", "Prenatal Care"]
    },
    {
      title: "Second Trimester Milestones",
      description: "Understanding fetal development, anatomy scans, and managing common pregnancy changes in weeks 13-26.",
      duration: "10 min read",
      topics: ["Development", "Screenings", "Physical Changes"]
    },
    {
      title: "Third Trimester Preparation",
      description: "Getting ready for birth, signs of labor, and preparing your home for baby's arrival in weeks 27-40.",
      duration: "12 min read",
      topics: ["Birth Planning", "Labor Signs", "Preparation"]
    },
    {
      title: "Nutrition During Pregnancy",
      description: "Complete guide to healthy eating, essential nutrients, foods to avoid, and meal planning for expecting mothers.",
      duration: "15 min read",
      topics: ["Diet", "Supplements", "Meal Planning"]
    },
    {
      title: "Exercise & Activity Guidelines",
      description: "Safe exercises for each trimester, warning signs to stop, and maintaining fitness during pregnancy.",
      duration: "7 min read",
      topics: ["Exercise", "Safety", "Wellness"]
    }
  ];

  const infantGuides = [
    {
      title: "Newborn Care Basics",
      description: "Everything you need to know about caring for your newborn in the first month, including feeding, sleeping, and bathing.",
      duration: "12 min read",
      topics: ["Feeding", "Sleep", "Hygiene"]
    },
    {
      title: "Vaccination Schedule Explained",
      description: "Comprehensive guide to infant and childhood vaccinations, what they protect against, and when to schedule them.",
      duration: "10 min read",
      topics: ["Immunizations", "Schedule", "Safety"]
    },
    {
      title: "Developmental Milestones",
      description: "What to expect at each stage from birth to 12 months, including physical, cognitive, and social development.",
      duration: "14 min read",
      topics: ["Growth", "Development", "Tracking"]
    },
    {
      title: "Breastfeeding & Bottle Feeding",
      description: "Guidance on feeding options, techniques, schedules, and troubleshooting common feeding challenges.",
      duration: "18 min read",
      topics: ["Nutrition", "Techniques", "Troubleshooting"]
    },
    {
      title: "Sleep Training Methods",
      description: "Evidence-based approaches to establishing healthy sleep patterns and routines for your infant.",
      duration: "11 min read",
      topics: ["Sleep", "Routines", "Methods"]
    }
  ];

  const healthGuides = [
    {
      title: "Managing Gestational Diabetes",
      description: "Understanding diagnosis, monitoring blood sugar, diet modifications, and medication when needed.",
      duration: "16 min read",
      topics: ["Diabetes", "Diet", "Monitoring"]
    },
    {
      title: "Postpartum Recovery",
      description: "Physical and emotional recovery after birth, warning signs, and when to seek medical attention.",
      duration: "13 min read",
      topics: ["Recovery", "Mental Health", "Physical Healing"]
    },
    {
      title: "Common Pregnancy Complications",
      description: "Recognizing signs of preeclampsia, placenta issues, and other conditions requiring medical attention.",
      duration: "15 min read",
      topics: ["Complications", "Warning Signs", "Treatment"]
    },
    {
      title: "Infant Health Red Flags",
      description: "Critical symptoms in newborns and infants that require immediate medical attention.",
      duration: "9 min read",
      topics: ["Symptoms", "Emergency", "When to Call"]
    }
  ];

  const appGuides = [
    {
      title: "Getting Started with LEA",
      description: "Complete walkthrough of setting up your profile, adding entries, and navigating the dashboard.",
      duration: "5 min read",
      topics: ["Setup", "Navigation", "Basics"]
    },
    {
      title: "Using the Health Journal",
      description: "How to document your journey, use tags effectively, and export your entries for healthcare visits.",
      duration: "6 min read",
      topics: ["Journal", "Tracking", "Export"]
    },
    {
      title: "Managing Appointments & Reminders",
      description: "Setting up notifications, scheduling clinic visits, and staying on top of your health calendar.",
      duration: "4 min read",
      topics: ["Appointments", "Reminders", "Calendar"]
    },
    {
      title: "Understanding Health Analytics",
      description: "How to read your health trends, track progress, and share insights with your healthcare provider.",
      duration: "7 min read",
      topics: ["Analytics", "Trends", "Data"]
    }
  ];

  const GuideCard = ({ guide }: { guide: typeof pregnancyGuides[0] }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{guide.title}</CardTitle>
            <CardDescription>{guide.description}</CardDescription>
          </div>
          <Badge variant="secondary" className="ml-4">{guide.duration}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {guide.topics.map((topic) => (
            <Badge key={topic} variant="outline" className="text-xs">
              {topic}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto p-6">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Health Guides</h1>
          </div>
          <p className="text-muted-foreground">
            Evidence-based information to support your maternal and infant health journey
          </p>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <Tabs defaultValue="pregnancy" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="pregnancy" className="gap-2">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Pregnancy</span>
            </TabsTrigger>
            <TabsTrigger value="infant" className="gap-2">
              <Baby className="w-4 h-4" />
              <span className="hidden sm:inline">Infant Care</span>
            </TabsTrigger>
            <TabsTrigger value="health" className="gap-2">
              <Stethoscope className="w-4 h-4" />
              <span className="hidden sm:inline">Health Conditions</span>
            </TabsTrigger>
            <TabsTrigger value="app" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Using LEA</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pregnancy" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Pregnancy Guides</h2>
              <p className="text-muted-foreground mb-6">
                Comprehensive information for every stage of your pregnancy journey
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {pregnancyGuides.map((guide, index) => (
                <GuideCard key={index} guide={guide} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="infant" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Infant Care Guides</h2>
              <p className="text-muted-foreground mb-6">
                Expert guidance for caring for your newborn and growing infant
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {infantGuides.map((guide, index) => (
                <GuideCard key={index} guide={guide} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Health Condition Guides</h2>
              <p className="text-muted-foreground mb-6">
                Understanding and managing common health conditions during pregnancy and infancy
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {healthGuides.map((guide, index) => (
                <GuideCard key={index} guide={guide} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="app" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">App Usage Guides</h2>
              <p className="text-muted-foreground mb-6">
                Learn how to make the most of LEA's features
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {appGuides.map((guide, index) => (
                <GuideCard key={index} guide={guide} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Additional Resources */}
        <Card className="mt-12 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Need More Information?</CardTitle>
            <CardDescription>
              Can't find what you're looking for? Check our FAQ or contact support for personalized assistance.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <a href="/faq" className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-center">
              Browse FAQ
            </a>
            <a href="/support" className="inline-block px-6 py-3 border border-border rounded-md hover:bg-accent transition-colors text-center">
              Contact Support
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Guides;