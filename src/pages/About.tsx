import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Target, Users, Award } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Care-Centered",
      description: "Every feature is designed with the wellbeing of mothers and infants at the forefront."
    },
    {
      icon: Target,
      title: "Accuracy",
      description: "Reliable tracking and evidence-based health information you can trust."
    },
    {
      icon: Users,
      title: "Family-Focused",
      description: "Supporting the entire family unit through maternal and infant health journeys."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Committed to providing the highest quality health tracking experience."
    }
  ];

  const team = [
    {
      role: "Healthcare Professionals",
      description: "Our medical advisors ensure all features align with current healthcare best practices."
    },
    {
      role: "Technology Experts",
      description: "Dedicated engineers building secure, user-friendly health tracking solutions."
    },
    {
      role: "UX Designers",
      description: "Creating intuitive interfaces that make health management effortless."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold text-foreground">About LEA</h1>
          <p className="text-muted-foreground mt-2">Empowering families through comprehensive health tracking</p>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-6xl">
        {/* Mission Statement */}
        <section className="mb-12">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                LEA (Maternease) was created to simplify maternal and infant health management. We believe that every family 
                deserves easy access to comprehensive health tracking tools that provide clarity, confidence, and peace of mind
                throughout pregnancy and early childhood.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                By combining intuitive design with evidence-based health information, we help families stay organized, 
                informed, and connected to their healthcare providers every step of the way.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Values */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* What We Offer */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">What We Offer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Comprehensive Health Tracking</h3>
                <p className="text-muted-foreground">
                  Track vaccinations, appointments, medications, and health conditions for both mother and infant 
                  in one centralized platform.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Intelligent Reminders</h3>
                <p className="text-muted-foreground">
                  Never miss an important appointment or vaccination with our smart notification system that keeps you on schedule.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Health Journal & Analytics</h3>
                <p className="text-muted-foreground">
                  Document your journey with detailed notes and visualize health trends over time to share with your healthcare provider.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Privacy & Security</h3>
                <p className="text-muted-foreground">
                  Your health data is encrypted and protected with enterprise-grade security. Your information stays private and belongs to you.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Team */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Built by Experts</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{member.role}</h3>
                  <p className="text-sm text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Have Questions?</h2>
              <p className="text-muted-foreground mb-6">
                We're here to help. Reach out to our support team or explore our FAQ section for quick answers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/support" className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  Contact Support
                </a>
                <a href="/faq" className="inline-block px-6 py-3 border border-border rounded-md hover:bg-accent transition-colors">
                  View FAQ
                </a>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default About;