import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Calendar, FileText, Activity, AlertTriangle, Clock, BookOpen, TrendingDown, Brain, Bell, BarChart3, Baby, Pill, LineChart, Droplet, Moon, Sun, Sparkles, Target, Shield, Zap, CheckCircle2, CalendarDays, HeartPulse, BellRing, ClipboardList } from "lucide-react";
import heroImage from "@/assets/hero-healthcare.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const problems = [
    {
      icon: AlertTriangle,
      title: "Fragmented Health Information",
      description: "Medical records scattered across facilities - pregnancy data, cycle history, and infant health tracking all in different places.",
      gradient: "from-red-500 to-orange-500"
    },
    {
      icon: Clock,
      title: "Missed Critical Events",
      description: "Forgotten fertility windows, missed vaccinations, skipped antenatal visits - busy lives lead to overlooked health milestones.",
      gradient: "from-orange-500 to-amber-500"
    },
    {
      icon: Droplet,
      title: "Unpredictable Cycles",
      description: "Irregular periods, unknown fertile days, and difficulty planning pregnancies without proper cycle tracking tools.",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      icon: BookOpen,
      title: "Limited Health Education",
      description: "Inadequate information about menstrual health, pregnancy stages, infant care, and family planning options.",
      gradient: "from-purple-500 to-violet-500"
    },
    {
      icon: TrendingDown,
      title: "Poor Health Monitoring",
      description: "Difficulty tracking symptoms, cycle patterns, fetal development, and infant growth without integrated tools.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Moon,
      title: "Lack of Personalization",
      description: "Generic advice that doesn't account for your unique cycle, pregnancy journey, or family planning goals.",
      gradient: "from-indigo-500 to-blue-500"
    }
  ];

  const solutions = [
    {
      icon: Brain,
      title: "AI-Powered Cycle Predictions",
      description: "Advanced algorithms learn your unique patterns to accurately predict periods, ovulation, and fertile windows for better family planning.",
      gradient: "from-primary to-primary/60"
    },
    {
      icon: Target,
      title: "Personalized Health Tracking",
      description: "Track everything from menstrual symptoms to pregnancy milestones and infant development with intelligent insights tailored to you.",
      gradient: "from-primary to-accent"
    },
    {
      icon: BellRing,
      title: "Smart Multi-Event Reminders",
      description: "Never miss fertility windows, medication doses, antenatal visits, or vaccinations with context-aware notifications.",
      gradient: "from-accent to-primary"
    },
    {
      icon: BarChart3,
      title: "Visual Health Analytics",
      description: "Beautiful charts showing cycle patterns, pregnancy progress, infant growth curves, and comprehensive health trends.",
      gradient: "from-primary/80 to-primary"
    },
    {
      icon: Sparkles,
      title: "Intelligent Symptom Analysis",
      description: "AI-powered assessment of symptoms across all phases - from menstrual tracking to pregnancy monitoring and infant care.",
      gradient: "from-primary to-secondary"
    },
    {
      icon: FileText,
      title: "Unified Health Records",
      description: "One secure place for all your data: cycle history, pregnancy records, infant milestones, medications, and appointments.",
      gradient: "from-secondary to-primary"
    }
  ];

  const features = [
    {
      icon: Droplet,
      title: "Advanced Cycle Tracking",
      description: "Track periods, ovulation, fertile windows, and symptoms with AI-powered predictions that learn your unique patterns.",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10"
    },
    {
      icon: CalendarDays,
      title: "Family Planning Tools",
      description: "Plan or prevent pregnancy with accurate fertility tracking, ovulation predictions, and personalized insights.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: Baby,
      title: "Pregnancy Journey Tracking",
      description: "Monitor due date countdown, gestational age, trimester milestones, fetal development, and maternal health.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: HeartPulse,
      title: "Infant Development Monitor",
      description: "Track growth curves, developmental milestones, feeding patterns, and sleep schedules for your little one.",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: Calendar,
      title: "Smart Appointment System",
      description: "Manage antenatal visits, gynecology appointments, pediatric checkups, and vaccinations in one place.",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10"
    },
    {
      icon: Pill,
      title: "Medication Management",
      description: "Track birth control, prenatal vitamins, medications, and supplements with customizable reminder schedules.",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10"
    },
    {
      icon: Activity,
      title: "AI Symptom Checker",
      description: "Analyze menstrual symptoms, pregnancy concerns, and infant health issues with intelligent severity assessment.",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      icon: LineChart,
      title: "Comprehensive Analytics",
      description: "Visualize cycle patterns, pregnancy progress, infant growth, and health trends with interactive charts.",
      color: "text-teal-500",
      bgColor: "bg-teal-500/10"
    },
    {
      icon: ClipboardList,
      title: "Health Journal",
      description: "Document your menstrual experiences, pregnancy journey, birth story, and parenting moments.",
      color: "text-violet-500",
      bgColor: "bg-violet-500/10"
    }
  ];

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[700px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-background/98 via-primary/10 to-background/95" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Your Complete Women's Health Companion</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Track Your Cycle,
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Plan Your Family,
            </span>
            <br />
            <span className="bg-gradient-to-r from-foreground via-secondary to-foreground bg-clip-text text-transparent">
              Nurture Your Baby
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-fade-in leading-relaxed" style={{ animationDelay: "200ms" }}>
            LEA - Maternease is your all-in-one platform for menstrual tracking, family planning, pregnancy monitoring, and infant care. 
            <span className="text-primary font-semibold block mt-2">Empowering every stage of your journey.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "300ms" }}>
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <Zap className="w-5 h-5 mr-2" />
              Start Free Today
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/about")} className="text-lg px-10 py-6 border-2 hover:scale-105 transition-all">
              Explore Features
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "400ms" }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Free Forever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>100% Private</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-background via-destructive/5 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 mb-6">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">Real Challenges Women Face</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-destructive via-destructive/80 to-destructive bg-clip-text text-transparent">
                You Deserve Better
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              From menstrual tracking to motherhood, women face unique health challenges that shouldn't be managed alone. 
              <span className="text-foreground font-semibold block mt-2">These obstacles stand in your way:</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map((problem, index) => {
              const Icon = problem.icon;
              return (
                <Card 
                  key={index} 
                  className="group border-2 border-destructive/20 hover:border-destructive/40 transition-all duration-500 hover:shadow-2xl hover:shadow-destructive/10 animate-fade-in hover-scale cursor-pointer overflow-hidden relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${problem.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  <CardContent className="p-6 relative">
                    <div className={`w-14 h-14 bg-gradient-to-br ${problem.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-destructive transition-colors">{problem.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{problem.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-background via-primary/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(var(--accent)/0.1),transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-20 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Powered by Advanced AI</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                LEA Has The Answers
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Intelligent, personalized solutions designed for every phase of your reproductive health journey.
              <span className="text-foreground font-semibold block mt-2">From your first period to your baby's first steps.</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((solution, index) => {
              const Icon = solution.icon;
              return (
                <Card 
                  key={index} 
                  className="group border-2 border-primary/20 hover:border-primary transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 animate-fade-in hover-scale cursor-pointer overflow-hidden relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${solution.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <CardContent className="p-6 relative">
                    <div className={`w-16 h-16 bg-gradient-to-br ${solution.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{solution.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{solution.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-background via-muted/30 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Everything You Need, Beautifully Integrated</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Comprehensive Features
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Track your cycle, plan your family, monitor your pregnancy, and nurture your baby—all with powerful tools designed for women.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="group border-2 hover:border-primary transition-all duration-500 hover:shadow-2xl animate-fade-in hover-scale cursor-pointer overflow-hidden relative"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-6 relative">
                    <div className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-7 h-7 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "100%", label: "Free to Use", icon: CheckCircle2 },
              { value: "AI", label: "Powered Insights", icon: Brain },
              { value: "24/7", label: "Always Available", icon: Clock },
              { value: "Secure", label: "Your Data Protected", icon: Shield }
            ].map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <div 
                  key={index} 
                  className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-105 animate-fade-in"
                  style={{ animationDelay: `${(features.length * 80) + (index * 100)}ms` }}
                >
                  <StatIcon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6 animate-fade-in">
            <Heart className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Make a Difference</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Support Women's Health Worldwide
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "200ms" }}>
            Your donation provides critical maternal healthcare, family planning resources, and life-saving support to mothers and babies in need.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "300ms" }}>
            <Button size="lg" onClick={() => navigate("/donate")} className="text-lg px-10 py-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              <Heart className="w-5 h-5 mr-2" />
              Donate Now
            </Button>
            <Button size="lg" onClick={() => navigate("/donate")} variant="outline" className="text-lg px-10 py-6 border-2 hover:scale-105 transition-all">
              View Campaigns
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary/5 via-accent/5 to-background relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="max-w-5xl mx-auto text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Ready to Take Control of Your Health?
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "100ms" }}>
            Join thousands of women who trust LEA for cycle tracking, family planning, pregnancy monitoring, and infant care.
          </p>
          
          <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-12 py-7 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all">
              <Sparkles className="w-5 h-5 mr-2" />
              Create Your Free Account
            </Button>
            <p className="text-sm text-muted-foreground mt-4">No credit card required • Free forever • Get started in 30 seconds</p>
          </div>
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
