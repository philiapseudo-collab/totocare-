import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Mail, Phone, Clock, HelpCircle, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Support = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would send to a backend
    toast({
      title: "Message Sent!",
      description: "Our support team will get back to you within 24 hours.",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      category: "",
      subject: "",
      message: ""
    });
  };

  const supportChannels = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      availability: "Mon-Fri, 9am-6pm EST",
      action: "Start Chat"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Get detailed help via email",
      availability: "Response within 24 hours",
      action: "Send Email"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our team",
      availability: "Mon-Fri, 9am-5pm EST",
      action: "Call Now"
    }
  ];

  const commonIssues = [
    {
      title: "Account & Login",
      description: "Issues with signing in, password reset, or account settings"
    },
    {
      title: "Data Entry",
      description: "Questions about adding vaccinations, appointments, or journal entries"
    },
    {
      title: "Notifications",
      description: "Managing reminders and notification settings"
    },
    {
      title: "Technical Issues",
      description: "App crashes, bugs, or performance problems"
    },
    {
      title: "Privacy & Security",
      description: "Questions about data protection and account security"
    },
    {
      title: "Feature Requests",
      description: "Suggestions for new features or improvements"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto p-6">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Support Center</h1>
          </div>
          <p className="text-muted-foreground">
            We're here to help you get the most out of LEA - Maternease
          </p>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send Us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Issue Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="account">Account & Login</SelectItem>
                        <SelectItem value="data">Data Entry</SelectItem>
                        <SelectItem value="notifications">Notifications</SelectItem>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="privacy">Privacy & Security</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please provide as much detail as possible..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Common Issues */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Common Issues</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {commonIssues.map((issue, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1">{issue.title}</h3>
                      <p className="text-sm text-muted-foreground">{issue.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Support Channels */}
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
                <CardDescription>Choose your preferred support channel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {supportChannels.map((channel, index) => {
                  const Icon = channel.icon;
                  return (
                    <div key={index} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{channel.title}</h3>
                          <p className="text-sm text-muted-foreground">{channel.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <Clock className="w-3 h-3" />
                        {channel.availability}
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        {channel.action}
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a href="/faq" className="flex items-center gap-2 text-sm hover:text-primary">
                  <HelpCircle className="w-4 h-4" />
                  Frequently Asked Questions
                </a>
                <a href="/guides" className="flex items-center gap-2 text-sm hover:text-primary">
                  <BookOpen className="w-4 h-4" />
                  User Guides
                </a>
                <a href="/about" className="flex items-center gap-2 text-sm hover:text-primary">
                  <Mail className="w-4 h-4" />
                  About LEA
                </a>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Direct Contact</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <a href="mailto:support@lea-maternease.app" className="hover:text-primary">
                      support@lea-maternease.app
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    <span>1-800-NURTURE</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Mon-Fri, 9am-6pm EST</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;