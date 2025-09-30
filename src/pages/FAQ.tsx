import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

const FAQ = () => {
  const categories = [
    "Getting Started",
    "Vaccinations", 
    "Clinic Visits",
    "Reproductive Health",
    "Screenings",
    "Conditions",
    "Privacy & Data",
    "Account"
  ];

  const faqs = [
    {
      question: "What can I track in NurtureCare?",
      answer: "You can log vaccinations, clinic visits, reproductive health metrics, screening results, and conditions for both mother and infant. The dashboard summarizes what's next.",
      tags: ["Getting Started", "Dashboard"]
    },
    {
      question: "How do I add a new entry?",
      answer: "Use the '+ New Entry' button or 'Quick Add' on the dashboard. Choose the entry type, person, date, and add notes as needed.",
      tags: ["Getting Started", "Entries"]
    },
    {
      question: "Are my records private and secure?",
      answer: "Your information stays private to your account. Data is organized by person and timeline to support conversations with your care provider.",
      tags: ["Privacy & Data"]
    },
    {
      question: "Can I track separate vaccination schedules for mother and infant?",
      answer: "Yes. Vaccinations are tracked per person with their own due dates and completion history.",
      tags: ["Vaccinations"]
    },
    {
      question: "How are conditions like gestational diabetes managed in the app?",
      answer: "Each condition has a dedicated card to log readings, meds, and notes. You'll see graphs for key values and status like 'Monitoring' or 'On meds'.",
      tags: ["Conditions"]
    },
    {
      question: "Where do I find screening results?",
      answer: "Go to Screenings to review scheduled tests and recorded results, organized by date.",
      tags: ["Screenings"]
    }
  ];

  const relatedFaqs = [
    "How reminders work",
    "Notifications & timing", 
    "Adding another child",
    "Manage multiple profiles",
    "Exporting your data",
    "Download records"
  ];

  const popularResources = [
    { title: "Vaccination schedule overview", category: "Vaccination" },
    { title: "Managing gestational diabetes", category: "Managing" },
    { title: "Prenatal screening checklist", category: "Prenatal" },
    { title: "Postpartum mental health", category: "Postpartum" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Resources</span>
              <span className="text-foreground font-medium">FAQ</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">Contact Support</Button>
            <Button size="sm">New Entry</Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2">Frequently Asked Questions</h1>
              <p className="text-muted-foreground mb-6">
                Find quick answers about vaccinations, visits, screenings, reproductive health, and condition tracking.
              </p>
              
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search FAQs"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button key={category} variant="outline" size="sm" className="rounded-full">
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* FAQ Items */}
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3">{faq.question}</h3>
                    <p className="text-muted-foreground mb-4">{faq.answer}</p>
                    <div className="flex gap-2">
                      {faq.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Popular Resources */}
            <Card className="mt-8">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Popular Resources</h3>
                <div className="grid grid-cols-2 gap-4">
                  {popularResources.map((resource, index) => (
                    <div key={index} className="p-4 border border-border rounded-lg hover:bg-accent cursor-pointer">
                      <p className="font-medium">{resource.title}</p>
                      <Badge variant="secondary" className="text-xs mt-2">{resource.category}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Need more help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse guides or reach out to our team.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">User Guides</h4>
                    <p className="text-sm text-muted-foreground">Step-by-step instructions</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Start a Conversation</h4>
                    <p className="text-sm text-muted-foreground">Message Support</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Email Us</h4>
                    <p className="text-sm text-muted-foreground">support@nurturecare.app</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Related FAQs</h3>
                <div className="space-y-3">
                  {relatedFaqs.map((faq, index) => (
                    <div key={index} className="p-2 hover:bg-accent rounded cursor-pointer">
                      <p className="text-sm font-medium">{faq}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;