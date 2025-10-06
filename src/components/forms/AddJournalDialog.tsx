import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { toast } from "sonner";

interface AddJournalDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddJournalDialog({ trigger, onSuccess }: AddJournalDialogProps) {
  const { addEntry, entries } = useJournalEntries();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    entry_type: "general",
    who: "mother",
    entry_date: new Date().toISOString().split('T')[0],
    content: "",
    tags: ""
  });

  // Get suggested tags from previous entries
  const suggestedTags = useMemo(() => {
    const allTags = entries
      .filter(entry => entry.who.toLowerCase() === formData.who.toLowerCase())
      .flatMap(entry => entry.tags);
    const uniqueTags = Array.from(new Set(allTags));
    return uniqueTags.slice(0, 8); // Show top 8 most common tags
  }, [entries, formData.who]);

  // Suggest title based on entry type
  const titleSuggestions = useMemo(() => {
    const suggestions: Record<string, string[]> = {
      general: ["Daily update", "Quick note", "Today's thoughts"],
      milestone: ["First smile", "First steps", "First words", "Important moment"],
      symptom: ["Morning sickness", "Fatigue", "Discomfort", "Health note"],
      appointment: ["Doctor visit", "Checkup", "Clinic appointment", "Consultation"],
      memory: ["Special moment", "Precious memory", "Beautiful day", "Unforgettable experience"]
    };
    return suggestions[formData.entry_type] || [];
  }, [formData.entry_type]);

  const handleTagClick = (tag: string) => {
    const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
    if (!currentTags.includes(tag)) {
      setFormData(prev => ({ 
        ...prev, 
        tags: prev.tags ? `${prev.tags}, ${tag}` : tag 
      }));
    }
  };

  const handleTitleSuggestionClick = (suggestion: string) => {
    setFormData(prev => ({ ...prev, title: suggestion }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.entry_type || !formData.who) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      await addEntry({
        title: formData.title,
        entry_type: formData.entry_type,
        who: formData.who,
        entry_date: formData.entry_date,
        content: formData.content || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
      });

      setFormData({
        title: "",
        entry_type: "general",
        who: "mother",
        entry_date: new Date().toISOString().split('T')[0],
        content: "",
        tags: ""
      });
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      // Error already handled in addEntry
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Journal Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., First ultrasound visit"
              required
            />
            {titleSuggestions.length > 0 && !formData.title && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {titleSuggestions.map((suggestion) => (
                    <Badge
                      key={suggestion}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleTitleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="entry_type">Entry Type *</Label>
            <Select value={formData.entry_type} onValueChange={(value) => setFormData(prev => ({ ...prev, entry_type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
                <SelectItem value="symptom">Symptom</SelectItem>
                <SelectItem value="appointment">Appointment</SelectItem>
                <SelectItem value="memory">Memory</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="who">Who *</Label>
              <Select value={formData.who} onValueChange={(value) => setFormData(prev => ({ ...prev, who: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mother">Mother</SelectItem>
                  <SelectItem value="infant">Infant</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry_date">Date *</Label>
              <Input
                id="entry_date"
                type="date"
                value={formData.entry_date}
                onChange={(e) => setFormData(prev => ({ ...prev, entry_date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              placeholder="Write your thoughts and memories..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="e.g., happy, ultrasound, milestone"
            />
            {suggestedTags.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Suggested tags from your previous entries:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleTagClick(tag)}
                    >
                      + {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
