import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Search, Download, Plus, CalendarIcon } from "lucide-react";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { toast } from "sonner";

const Journal = () => {
  const { user } = useAuth();
  const { entries, loading, addEntry } = useJournalEntries();
  const [filterTab, setFilterTab] = useState("All");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [calendarNote, setCalendarNote] = useState("");
  const [quickAddData, setQuickAddData] = useState({
    type: "Note",
    date: new Date().toISOString(),
    who: "Mother",
    tag: "Mood",
    details: ""
  });

  const handleAddCalendarNote = async () => {
    if (!calendarNote.trim() || !selectedDate) {
      toast.error("Please write something before saving");
      return;
    }
    
    try {
      await addEntry({
        entry_type: "Daily Note",
        title: `Daily Story - ${format(selectedDate, 'MMM d, yyyy')}`,
        content: calendarNote,
        who: "Mother",
        entry_date: selectedDate.toISOString(),
        tags: ["Daily Story"]
      });
      
      setCalendarNote("");
      toast.success("Your story has been saved!");
    } catch (error) {
      console.error('Failed to add calendar note:', error);
    }
  };

  const handleAddEntry = async () => {
    if (!quickAddData.details.trim()) return;
    
    try {
      await addEntry({
        entry_type: quickAddData.type,
        title: `${quickAddData.type} entry`,
        content: quickAddData.details,
        who: quickAddData.who,
        entry_date: quickAddData.date,
        tags: [quickAddData.tag]
      });
      
      setQuickAddData({
        type: "Note",
        date: new Date().toISOString(),
        who: "Mother",
        tag: "Mood",
        details: ""
      });
    } catch (error) {
      console.error('Failed to add entry:', error);
    }
  };

  const tabs = ["All", "Mother", "Infant"];
  const tags = ["Medication", "Symptom", "Feeding", "Mood", "Monitoring"];

  const filteredEntries = entries.filter(entry => {
    if (filterTab !== "All" && entry.who !== filterTab) return false;
    if (selectedTags.length > 0 && !entry.tags.some(tag => selectedTags.includes(tag))) return false;
    return true;
  });

  const checklistItems = [
    { title: "Hydration", subtitle: "8 glasses of water", status: "0/8" },
    { title: "Prenatal vitamin", subtitle: "Once daily", status: "Due" },
    { title: "Fetal movement", subtitle: "Count kicks", status: "Track" }
  ];

  const tipsResources = [
    { title: "Keeping a helpful journal", subtitle: "Brief notes, consistent tags" },
    { title: "What to log daily", subtitle: "Sleep, mood, symptoms" },
    { title: "Privacy overview", subtitle: "Your notes are private" }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Please Log In</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">You need to be logged in to access your journal.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Home</span>
              <span>›</span>
              <span>Overview</span>
              <span>›</span>
              <span className="text-foreground font-medium">Journal</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Calendar Notes Section */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <CardTitle>Calendar Notes - Write Your Daily Story</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">Select a date and freestyle your experiences, thoughts, and stories</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Calendar */}
                  <div className="flex flex-col items-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                    {selectedDate && (
                      <p className="text-sm text-muted-foreground mt-4">
                        Writing for: <span className="font-semibold text-foreground">{format(selectedDate, 'MMMM d, yyyy')}</span>
                      </p>
                    )}
                  </div>

                  {/* Note Writing Area */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="calendar-note">Your Story for {selectedDate && format(selectedDate, 'MMM d')}</Label>
                      <Textarea
                        id="calendar-note"
                        placeholder="Write freely about your day... Share your feelings, experiences, memorable moments, or anything on your mind."
                        rows={12}
                        value={calendarNote}
                        onChange={(e) => setCalendarNote(e.target.value)}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        {calendarNote.length} characters
                      </p>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={handleAddCalendarNote}
                      disabled={!calendarNote.trim()}
                    >
                      Save Story
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-4">Journal Entries</h1>
              
              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {tabs.map((tab) => (
                  <Button
                    key={tab}
                    variant={filterTab === tab ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterTab(tab)}
                  >
                    {tab}
                  </Button>
                ))}
              </div>

              {/* Search and Filters */}
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Type to filter entries"
                    className="pl-10"
                  />
                </div>

                {/* Tags */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedTags(prev => 
                            prev.includes(tag) 
                              ? prev.filter(t => t !== tag)
                              : [...prev, tag]
                          );
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Date Range and Sort */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label className="text-sm font-medium mb-2 block">Date range</Label>
                    <Input value="Oct 1 - Oct 31, 2025" readOnly />
                  </div>
                  <div className="w-full sm:w-auto">
                    <Label className="text-sm font-medium mb-2 block">Sort</Label>
                    <Select defaultValue="newest">
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest first</SelectItem>
                        <SelectItem value="oldest">Oldest first</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Journal Entries */}
            <div className="space-y-4 mb-8">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading entries...</p>
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No journal entries yet. Add your first entry below!</p>
                </div>
              ) : (
                <>
                  {filteredEntries.map((entry) => (
                    <Card key={entry.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">{entry.title}</h3>
                            <p className="text-sm text-muted-foreground">{entry.who} • {entry.entry_type}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(entry.entry_date), 'MMM d, yyyy • h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm mb-3">{entry.content}</p>
                        <div className="flex gap-2">
                          {entry.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">End of results</p>
                  </div>
                </>
              )}
            </div>

            {/* Quick Add to Journal */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Add to Journal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={quickAddData.type} onValueChange={(value) => setQuickAddData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Note">Note</SelectItem>
                        <SelectItem value="Medication">Medication</SelectItem>
                        <SelectItem value="Symptom">Symptom</SelectItem>
                        <SelectItem value="Feeding">Feeding</SelectItem>
                        <SelectItem value="Mood">Mood</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={format(new Date(quickAddData.date), "yyyy-MM-dd'T'HH:mm")}
                      onChange={(e) => setQuickAddData(prev => ({ ...prev, date: new Date(e.target.value).toISOString() }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="who">Who</Label>
                    <Select value={quickAddData.who} onValueChange={(value) => setQuickAddData(prev => ({ ...prev, who: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mother">Mother</SelectItem>
                        <SelectItem value="Infant">Infant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tag">Tag</Label>
                    <Select value={quickAddData.tag} onValueChange={(value) => setQuickAddData(prev => ({ ...prev, tag: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mood">Mood</SelectItem>
                        <SelectItem value="Medication">Medication</SelectItem>
                        <SelectItem value="Symptom">Symptom</SelectItem>
                        <SelectItem value="Feeding">Feeding</SelectItem>
                        <SelectItem value="Monitoring">Monitoring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <Label htmlFor="details">Details</Label>
                  <Textarea
                    id="details"
                    rows={3}
                    value={quickAddData.details}
                    onChange={(e) => setQuickAddData(prev => ({ ...prev, details: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => setQuickAddData({
                      type: "Note",
                      date: new Date().toISOString(),
                      who: "Mother",
                      tag: "Mood",
                      details: ""
                    })}
                  >
                    Clear
                  </Button>
                  <Button 
                    className="w-full sm:w-auto"
                    onClick={handleAddEntry}
                    disabled={!quickAddData.details.trim()}
                  >
                    Add Entry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Checklist</CardTitle>
                <p className="text-sm text-muted-foreground">From your dashboard</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {checklistItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={item.status === "Due" ? "bg-warning/10 text-warning" : "text-muted-foreground"}
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tips & Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Tips & Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tipsResources.map((tip, index) => (
                  <div key={index}>
                    <h4 className="font-medium">{tip.title}</h4>
                    <p className="text-sm text-muted-foreground">{tip.subtitle}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;