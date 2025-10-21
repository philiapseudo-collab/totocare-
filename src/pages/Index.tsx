import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Calendar, FileText, Activity, Shield, Users } from "lucide-react";
import heroImage from "@/assets/hero-healthcare.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: Heart,
      title: "Comprehensive Care Tracking",
      description: "Monitor vaccinations, appointments, and health conditions for mother and infant in one place."
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Never miss important appointments with intelligent reminders and upcoming event tracking."
    },
    {
      icon: FileText,
      title: "Health Journal",
      description: "Document your journey with detailed notes, symptoms, and daily reflections."
    },
    {
      icon: Activity,
      title: "Health Analytics",
      description: "Track pregnancy progress, infant growth, and health trends with visual insights."
    },
    {
      icon: Shield,
      title: "Private & Secure",
      description: "Your health data is protected with enterprise-grade security and encryption."
    },
    {
      icon: Users,
      title: "Family-Centered",
      description: "Manage health records for both mother and infant with easy profile switching."
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
            <Button size="lg" variant="outline" onClick={() => navigate("/onboarding")} className="text-lg px-8">
              Getting Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/about")} className="text-lg px-8">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need for Maternal & Infant Care</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed to support your family's health journey from pregnancy through early childhood.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-2 hover:border-primary transition-colors">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
              Create Your Free Account
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/onboarding")} className="text-lg px-8">
              Getting Started
            </Button>
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
              <li><a href="/onboarding" className="hover:text-foreground">Getting Started</a></li>
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
