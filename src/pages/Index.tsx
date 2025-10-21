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
      title: "Fragmented Records",
      description: "Health data scattered everywhere—cycles, pregnancy, baby milestones all separate.",
      gradient: "from-red-500 to-orange-500"
    },
    {
      icon: Clock,
      title: "Missed Events",
      description: "Forgotten fertility windows, missed vaccinations, and skipped appointments.",
      gradient: "from-orange-500 to-amber-500"
    },
    {
      icon: Droplet,
      title: "Unpredictable Cycles",
      description: "Irregular periods and unknown fertile days make family planning difficult.",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      icon: TrendingDown,
      title: "Poor Tracking",
      description: "No easy way to monitor symptoms, cycles, or baby's development.",
      gradient: "from-blue-500 to-cyan-500"
    }
  ];

  const solutions = [
    {
      icon: Brain,
      title: "AI Cycle Predictions",
      description: "Learn your patterns to predict periods, ovulation & fertile windows accurately.",
      gradient: "from-primary to-primary/60"
    },
    {
      icon: Target,
      title: "Personalized Tracking",
      description: "Track cycles, pregnancy, and baby development with tailored insights.",
      gradient: "from-primary to-accent"
    },
    {
      icon: BellRing,
      title: "Smart Reminders",
      description: "Never miss fertility windows, medications, visits, or vaccinations.",
      gradient: "from-accent to-primary"
    },
    {
      icon: BarChart3,
      title: "Visual Analytics",
      description: "Beautiful charts for cycle patterns, pregnancy & infant growth.",
      gradient: "from-primary/80 to-primary"
    }
  ];

  const features = [
    {
      icon: Droplet,
      title: "Cycle Tracking",
      description: "Track periods, ovulation & symptoms with AI predictions.",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10"
    },
    {
      icon: CalendarDays,
      title: "Family Planning",
      description: "Plan or prevent pregnancy with fertility tracking.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: Baby,
      title: "Pregnancy Tracking",
      description: "Monitor due date, milestones & fetal development.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: HeartPulse,
      title: "Infant Monitor",
      description: "Track growth, milestones, feeding & sleep patterns.",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: Calendar,
      title: "Appointments",
      description: "Manage all visits, checkups & vaccinations.",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10"
    },
    {
      icon: Pill,
      title: "Medications",
      description: "Track pills, vitamins & supplements with reminders.",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10"
    }
  ];

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[500px] md:h-[700px] flex items-center justify-center overflow-hidden py-12 md:py-0">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-background/85 via-background/70 to-background/85" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/60" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4 animate-fade-in text-xs sm:text-sm">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            <span className="font-medium">Your Complete Health Companion</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 animate-fade-in leading-tight" style={{ animationDelay: "100ms" }}>
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
          
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 md:mb-10 max-w-2xl mx-auto animate-fade-in leading-relaxed" style={{ animationDelay: "200ms" }}>
            All-in-one platform for cycle tracking, family planning, pregnancy & infant care.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in" style={{ animationDelay: "300ms" }}>
            <Button size="default" onClick={() => navigate("/auth")} className="sm:text-base px-6 sm:px-10 py-4 sm:py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <Zap className="w-4 h-4 mr-2" />
              Start Free
            </Button>
            <Button size="default" variant="outline" onClick={() => navigate("/about")} className="sm:text-base px-6 sm:px-10 py-4 sm:py-6 border-2 hover:scale-105 transition-all">
              Learn More
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-4 sm:gap-8 mt-6 md:mt-12 text-xs sm:text-sm text-muted-foreground animate-fade-in flex-wrap" style={{ animationDelay: "400ms" }}>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Free</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Private</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-12 md:py-20 px-4 sm:px-6 bg-gradient-to-b from-background via-destructive/5 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 mb-3 text-xs sm:text-sm">
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
              <span className="font-medium text-destructive">Common Challenges</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
              <span className="bg-gradient-to-r from-destructive via-destructive/80 to-destructive bg-clip-text text-transparent">
                You Deserve Better
              </span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Health challenges women face daily
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {problems.map((problem, index) => {
              const Icon = problem.icon;
              return (
                <Card 
                  key={index} 
                  className="group border-2 border-destructive/20 hover:border-destructive/40 transition-all duration-300 hover:shadow-xl animate-fade-in hover-scale overflow-hidden relative"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${problem.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  <CardContent className="p-4 md:p-5 relative">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${problem.gradient} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold mb-2 group-hover:text-destructive transition-colors">{problem.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{problem.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-12 md:py-20 px-4 sm:px-6 bg-gradient-to-b from-background via-primary/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(var(--accent)/0.1),transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-10 md:mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-3 text-xs sm:text-sm">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
              <span className="font-medium text-primary">AI-Powered</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Smart Solutions
              </span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Personalized tools for every health phase
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {solutions.map((solution, index) => {
              const Icon = solution.icon;
              return (
                <Card 
                  key={index} 
                  className="group border-2 border-primary/20 hover:border-primary transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 animate-fade-in hover-scale overflow-hidden relative"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${solution.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <CardContent className="p-4 md:p-5 relative">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${solution.gradient} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold mb-2 group-hover:text-primary transition-colors">{solution.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{solution.description}</p>
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
          <div className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {[
              { value: "Free", label: "Forever", icon: CheckCircle2 },
              { value: "AI", label: "Powered", icon: Brain },
              { value: "24/7", label: "Available", icon: Clock },
              { value: "Secure", label: "Protected", icon: Shield }
            ].map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <div 
                  key={index} 
                  className="text-center p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-105 animate-fade-in"
                  style={{ animationDelay: `${(features.length * 60) + (index * 80)}ms` }}
                >
                  <StatIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary mx-auto mb-2" />
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary mb-0.5">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section className="py-12 md:py-20 px-4 sm:px-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 mb-3 animate-fade-in text-xs sm:text-sm">
            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            <span className="font-medium">Make a Difference</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Support Women's Health
            </span>
          </h2>
          
          <p className="text-sm sm:text-base text-muted-foreground mb-6 md:mb-8 max-w-xl mx-auto animate-fade-in" style={{ animationDelay: "200ms" }}>
            Help provide healthcare & support to mothers worldwide
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in" style={{ animationDelay: "300ms" }}>
            <Button size="default" onClick={() => navigate("/donate")} className="sm:text-base px-6 sm:px-8 py-4 sm:py-5 shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              <Heart className="w-4 h-4 mr-2" />
              Donate
            </Button>
            <Button size="default" onClick={() => navigate("/donate")} variant="outline" className="sm:text-base px-6 sm:px-8 py-4 sm:py-5 border-2 hover:scale-105 transition-all">
              View Campaigns
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4 sm:px-6 bg-gradient-to-br from-primary/5 via-accent/5 to-background relative overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 animate-fade-in">
            <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Ready to Start?
            </span>
          </h2>
          
          <p className="text-sm sm:text-base text-muted-foreground mb-6 md:mb-8 max-w-xl mx-auto animate-fade-in" style={{ animationDelay: "100ms" }}>
            Join women who trust LEA for complete health tracking
          </p>
          
          <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <Button size="default" onClick={() => navigate("/auth")} className="sm:text-base px-8 sm:px-10 py-5 sm:py-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
              <Sparkles className="w-4 h-4 mr-2" />
              Get Started Free
            </Button>
            <p className="text-xs sm:text-sm text-muted-foreground mt-3">Free forever • No credit card</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 md:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">LEA - Maternease</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Complete women's health tracking platform
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Product</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li><a href="/about" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="/guides" className="hover:text-foreground transition-colors">Guides</a></li>
              <li><a href="/faq" className="hover:text-foreground transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Support</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li><a href="/support" className="hover:text-foreground transition-colors">Contact</a></li>
              <li><a href="/support" className="hover:text-foreground transition-colors">Help Center</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Legal</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-6 md:mt-8 pt-6 md:pt-8 border-t border-border text-center text-xs sm:text-sm text-muted-foreground">
          © 2025 LEA - Maternease. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
