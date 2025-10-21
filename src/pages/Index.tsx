import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Calendar, FileText, Activity, Shield, Users, AlertTriangle, Clock, BookOpen, TrendingDown, Brain, Bell, BarChart3, Baby, Pill, LineChart } from "lucide-react";
import heroImage from "@/assets/hero-healthcare.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const problems = [
    {
      icon: AlertTriangle,
      title: "Fragmented Health Information",
      description: "Medical records scattered across different facilities, making it difficult to track maternal and infant health comprehensively."
    },
    {
      icon: Clock,
      title: "Missed Appointments & Vaccinations",
      description: "Busy schedules and lack of reminders lead to missed critical checkups, putting mother and baby at risk."
    },
    {
      icon: BookOpen,
      title: "Limited Health Education Access",
      description: "Inadequate information about pregnancy stages, infant care, and warning signs of complications."
    },
    {
      icon: TrendingDown,
      title: "Poor Health Monitoring",
      description: "Difficulty tracking symptoms, medications, and growth milestones without proper tools and guidance."
    }
  ];

  const solutions = [
    {
      icon: Brain,
      title: "AI-Powered Health Insights",
      description: "Get personalized recommendations and early warning signs through intelligent symptom analysis and health tracking."
    },
    {
      icon: Bell,
      title: "Smart Reminder System",
      description: "Never miss medications, appointments, or vaccinations with customizable notifications and pre-alerts."
    },
    {
      icon: BarChart3,
      title: "Comprehensive Analytics",
      description: "Visualize pregnancy progress, infant growth curves, and health trends with intuitive charts and reports."
    },
    {
      icon: FileText,
      title: "Centralized Health Records",
      description: "All medical information in one secure place, accessible anytime and shareable with healthcare providers."
    }
  ];

  const features = [
    {
      icon: Baby,
      title: "Pregnancy & Infant Tracking",
      description: "Monitor due date countdown, gestational age, trimester milestones, and infant development stages."
    },
    {
      icon: Calendar,
      title: "Appointment Management",
      description: "Schedule and track antenatal visits, vaccinations, and follow-up appointments with intelligent reminders."
    },
    {
      icon: Pill,
      title: "Medication Adherence",
      description: "Set custom medication schedules with multiple daily reminders and track adherence patterns over time."
    },
    {
      icon: Activity,
      title: "Symptom Checker",
      description: "AI-powered symptom analysis to assess severity and provide guidance on when to seek medical attention."
    },
    {
      icon: LineChart,
      title: "Growth & Health Analytics",
      description: "Track weight, height, blood pressure, and other vital signs with visual progress charts and insights."
    },
    {
      icon: Heart,
      title: "Journal & Community",
      description: "Document your journey, share experiences, and support maternal health campaigns through donations."
    }
  ];

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Your Family's Health Journey,
            <span className="text-primary block mt-2">All in One Place</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            LEA - Maternease helps you track, manage, and understand your maternal and infant health with confidence and ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/about")} className="text-lg px-8">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-destructive to-destructive/60 bg-clip-text text-transparent">
              The Challenges Women Face
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Navigating maternal and infant healthcare shouldn't be complicated. Yet, millions of women struggle with these critical issues daily.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {problems.map((problem, index) => {
              const Icon = problem.icon;
              return (
                <Card 
                  key={index} 
                  className="border-2 border-destructive/20 hover:border-destructive/40 transition-all duration-300 hover:shadow-lg animate-fade-in hover-scale"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6 text-destructive" />
                      </div>
                      <div>
                        <CardTitle className="text-xl mb-2">{problem.title}</CardTitle>
                        <p className="text-muted-foreground">{problem.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              LEA's Smart Solutions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We've built powerful tools to address every challenge, giving you confidence and control over your family's health journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {solutions.map((solution, index) => {
              const Icon = solution.icon;
              return (
                <Card 
                  key={index} 
                  className="border-2 border-primary/20 hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 animate-fade-in hover-scale"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center shrink-0">
                        <Icon className="w-7 h-7 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{solution.title}</h3>
                        <p className="text-muted-foreground">{solution.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful Features for Complete Care
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to track, manage, and understand maternal and infant health — all in one beautifully designed platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg animate-fade-in hover-scale group"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Support Maternal & Infant Health</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Your donation can save lives. Help us provide critical care for mothers and babies in need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/donate")} className="text-lg px-8" variant="default">
              <Heart className="w-5 h-5 mr-2" />
              Donate Now
            </Button>
            <Button size="lg" onClick={() => navigate("/donate")} className="text-lg px-8" variant="outline">
              View Campaigns
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of families who trust LEA for their health management.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
            Create Your Free Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">LEA - Maternease</h3>
            <p className="text-sm text-muted-foreground">
              Empowering families with comprehensive maternal and infant health tracking.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/about" className="hover:text-foreground">About</a></li>
              <li><a href="/guides" className="hover:text-foreground">Guides</a></li>
              <li><a href="/faq" className="hover:text-foreground">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/support" className="hover:text-foreground">Contact</a></li>
              <li><a href="/support" className="hover:text-foreground">Help Center</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © 2025 LEA - Maternease. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
